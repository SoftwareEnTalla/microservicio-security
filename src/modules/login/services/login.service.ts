/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */

import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventBus } from "@nestjs/cqrs";
import { createHash, randomInt, randomUUID } from "crypto";
import { Repository } from "typeorm";
import { Login } from "../entities/login.entity";
import { LoginResponse, FederatedLoginStartResponse, LogoutResponse } from "../types/login.types";
import { LoginAuthenticateWithPasswordDto, LoginStartFederatedLoginDto, LoginRefreshSessionDto, LoginLogoutDto } from "../dtos/all-dto";
import { User } from "../../user/entities/user.entity";
import { SessionToken } from "../../session-token/entities/session-token.entity";
import { MfaTotp } from "../../mfa-totp/entities/mfa-totp.entity";
import { BaseEvent } from "../events/base.event";
import { FederatedLoginStartedEvent, LoginFailedEvent, LoginLoggedOutEvent, LoginRefreshedEvent, LoginSucceededEvent } from "../events/exporting.event";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SessionToken)
    private readonly sessionTokenRepository: Repository<SessionToken>,
    @InjectRepository(MfaTotp)
    private readonly mfaTotpRepository: Repository<MfaTotp>,
    private readonly eventBus: EventBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
  ) {}

  async authenticateWithPassword(payload: LoginAuthenticateWithPasswordDto): Promise<LoginResponse<Login>> {
    const identifier = (payload.identifier || "").trim();
    const password = payload.password || "";

    if (!identifier || !password) {
      throw new BadRequestException("El identificador y la contraseña son obligatorios.");
    }

    const user = await this.findUserByIdentifier(identifier);

    if (!user) {
      await this.registerFailedLogin(identifier, "Usuario no encontrado.");
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    if (!user.isActive || (user.accountStatus || "").toUpperCase() !== "ACTIVE") {
      // Permitir flujo de activación por PIN para cuentas PENDING_VERIFICATION
      const isPendingVerification = (user.accountStatus || "").toUpperCase() === "PENDING_VERIFICATION";
      if (isPendingVerification) {
        // Verificar contraseña primero
        if (!this.matchesPassword(password, user.passwordHash)) {
          await this.registerFailedLogin(identifier, "Contraseña inválida.");
          throw new UnauthorizedException("Credenciales inválidas.");
        }
        // Exigir PIN de activación
        return this.handleActivationByPin(user, payload, identifier);
      }
      await this.registerFailedLogin(identifier, `La cuenta ${user.accountStatus || 'INACTIVA'} no permite autenticación.`);
      throw new ForbiddenException("La cuenta no está habilitada para autenticación local.");
    }

    if (user.federatedOnly) {
      await this.registerFailedLogin(identifier, "La cuenta solo admite autenticación federada.");
      throw new ForbiddenException("La cuenta solo admite autenticación federada.");
    }

    if (!this.matchesPassword(password, user.passwordHash)) {
      await this.registerFailedLogin(identifier, "Contraseña inválida.");
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 1000 * 60 * 60 * 24 * 7);
    const sessionCode = this.generateOpaqueToken("session");
    const refreshToken = this.generateOpaqueToken("refresh");
    const accessToken = this.generateOpaqueToken("access");

    const sessionToken = new SessionToken();
    Object.assign(sessionToken, {
      name: `Sesión de ${identifier}`,
      description: `Refresh token emitido para ${identifier}`,
      createdBy: "login-service",
      isActive: true,
      userId: user.id,
      subscriberId: "swagger",
      sessionCode,
      tokenId: this.sha256(refreshToken),
      tokenType: "REFRESH_TOKEN",
      issuedAt,
      expiresAt,
      revokedAt: undefined,
      revocationReason: "",
      logoutAt: undefined,
      certificationStatus: "ISSUED",
      authenticatedUserAcls: this.resolveUserAcls(user),
      metadata: {
        identifier,
        accessTokenHash: this.sha256(accessToken),
      },
    });

    await this.sessionTokenRepository.save(sessionToken);

    const login = this.loginRepository.create({
      name: `Login ${identifier}`,
      description: `Autenticación local satisfactoria para ${identifier}`,
      createdBy: "login-service",
      isActive: true,
      correlationCode: this.generateOpaqueToken("login"),
      userId: user.id,
      loginIdentifier: identifier,
      loginIdentifierType: this.resolveIdentifierType(user, identifier),
      flowType: "PASSWORD",
      authMethod: "LOCAL_PASSWORD",
      providerCode: "LOCAL",
      subscriberId: "swagger",
      sessionCode,
      authStatus: "SUCCEEDED",
      failureReason: "",
      ipAddress: "",
      deviceFingerprint: "",
      userAgent: "",
      accessTokenIssued: true,
      refreshTokenIssued: true,
      pkceRequired: false,
      authenticatedUserAcls: this.resolveUserAcls(user),
      occurredAt: issuedAt,
      metadata: {
        refreshTokenId: sessionToken.tokenId,
        accessTokenHash: this.sha256(accessToken),
      },
    });

    const persistedLogin = await this.loginRepository.save(login);

    await this.userRepository.update(user.id, {
      lastLoginAt: issuedAt,
    });

    await this.publishDomainEvent(
      LoginSucceededEvent.create(
        String(persistedLogin.id),
        persistedLogin,
        String(persistedLogin.createdBy || "login-service"),
        String(persistedLogin.correlationCode || persistedLogin.id),
      ),
    );

    return this.buildLoginResponse(persistedLogin, {
      accessToken,
      refreshToken,
      sessionCode,
      userId: user.id,
      expiresAt,
      message: "Autenticación completada correctamente.",
    });
  }

  async startFederatedLogin(payload: LoginStartFederatedLoginDto): Promise<FederatedLoginStartResponse> {
    const providerCode = (payload.providerCode || "").trim();
    const redirectUri = (payload.redirectUri || "").trim();

    if (!providerCode || !redirectUri) {
      throw new BadRequestException("El proveedor y la URL de retorno son obligatorios.");
    }

    const state = this.generateOpaqueToken("fed");
    const authorizationBaseUrl = process.env.WSO2_AUTHORIZATION_URL || "http://localhost:9443/oauth2/authorize";
    const url = new URL(authorizationBaseUrl);
    url.searchParams.set("provider", providerCode);
    url.searchParams.set("redirect_uri", redirectUri);
    if (payload.loginHint) {
      url.searchParams.set("login_hint", payload.loginHint.trim());
    }
    url.searchParams.set("state", state);

    const occurredAt = new Date();
    const login = this.loginRepository.create({
      name: `Federated login ${providerCode}`,
      description: `Inicio de autenticación federada con ${providerCode}`,
      createdBy: "login-service",
      isActive: true,
      correlationCode: this.generateOpaqueToken("login"),
      loginIdentifier: payload.loginHint?.trim() || providerCode,
      loginIdentifierType: payload.loginHint ? "LOGIN_HINT" : "PROVIDER_CODE",
      flowType: "FEDERATED",
      authMethod: "OIDC",
      providerCode,
      subscriberId: "swagger",
      sessionCode: state,
      authStatus: "REDIRECT_REQUIRED",
      failureReason: "",
      ipAddress: "",
      deviceFingerprint: "",
      userAgent: "",
      accessTokenIssued: false,
      refreshTokenIssued: false,
      pkceRequired: false,
      authenticatedUserAcls: {},
      occurredAt,
      metadata: {
        redirectUri,
        authorizationUrl: url.toString(),
      },
    });

    const persistedLogin = await this.loginRepository.save(login);

    await this.publishDomainEvent(
      FederatedLoginStartedEvent.create(
        String(persistedLogin.id),
        persistedLogin,
        String(persistedLogin.createdBy || "login-service"),
        String(persistedLogin.correlationCode || persistedLogin.id),
      ),
    );

    return {
      ok: true,
      message: "Flujo federado inicializado correctamente.",
      providerCode,
      redirectUri,
      authorizationUrl: url.toString(),
      state,
    };
  }

  async refreshSession(payload: LoginRefreshSessionDto): Promise<LoginResponse<Login>> {
    const refreshToken = (payload.refreshToken || "").trim();

    if (!refreshToken) {
      throw new BadRequestException("El refresh token es obligatorio.");
    }

    const persistedSession = await this.sessionTokenRepository.findOne({
      where: { tokenId: this.sha256(refreshToken), tokenType: "REFRESH_TOKEN" },
    });

    if (!persistedSession || !persistedSession.isActive) {
      throw new UnauthorizedException("Refresh token inválido.");
    }

    if (persistedSession.expiresAt && persistedSession.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("El refresh token expiró.");
    }

    if (["REVOKED", "LOGGED_OUT"].includes((persistedSession.certificationStatus || "").toUpperCase())) {
      throw new UnauthorizedException("La sesión ya no está disponible.");
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 1000 * 60 * 60 * 24 * 7);
    const rotatedRefreshToken = this.generateOpaqueToken("refresh");
    const accessToken = this.generateOpaqueToken("access");

    await this.sessionTokenRepository.update(persistedSession.id, {
      tokenId: this.sha256(rotatedRefreshToken),
      issuedAt,
      expiresAt,
      certificationStatus: "ISSUED",
      revokedAt: undefined,
      revocationReason: "",
      logoutAt: undefined,
      metadata: {
        ...(persistedSession.metadata || {}),
        accessTokenHash: this.sha256(accessToken),
        refreshedAt: issuedAt.toISOString(),
      } as any,
    });

    const login = this.loginRepository.create({
      name: `Refresh ${persistedSession.sessionCode}`,
      description: `Renovación de sesión ${persistedSession.sessionCode}`,
      createdBy: "login-service",
      isActive: true,
      correlationCode: this.generateOpaqueToken("login"),
      userId: persistedSession.userId,
      loginIdentifier: persistedSession.sessionCode,
      loginIdentifierType: "SESSION_CODE",
      flowType: "REFRESH",
      authMethod: "LOCAL_PASSWORD",
      providerCode: "LOCAL",
      subscriberId: persistedSession.subscriberId || "swagger",
      sessionCode: persistedSession.sessionCode,
      authStatus: "REFRESHED",
      failureReason: "",
      ipAddress: "",
      deviceFingerprint: "",
      userAgent: "",
      accessTokenIssued: true,
      refreshTokenIssued: true,
      pkceRequired: false,
      authenticatedUserAcls: persistedSession.authenticatedUserAcls || {},
      occurredAt: issuedAt,
      metadata: {
        refreshTokenId: this.sha256(rotatedRefreshToken),
        accessTokenHash: this.sha256(accessToken),
      },
    });

    const persistedLogin = await this.loginRepository.save(login);

    await this.publishDomainEvent(
      LoginRefreshedEvent.create(
        String(persistedLogin.id),
        persistedLogin,
        String(persistedLogin.createdBy || "login-service"),
        String(persistedLogin.correlationCode || persistedLogin.id),
      ),
    );

    return this.buildLoginResponse(persistedLogin, {
      accessToken,
      refreshToken: rotatedRefreshToken,
      sessionCode: persistedSession.sessionCode,
      userId: persistedSession.userId,
      expiresAt,
      message: "Sesión renovada correctamente.",
    });
  }

  async logout(payload: LoginLogoutDto): Promise<LogoutResponse> {
    const sessionCode = (payload.sessionCode || "").trim();
    const refreshToken = (payload.refreshToken || "").trim();

    if (!sessionCode && !refreshToken) {
      throw new BadRequestException("Debe indicar el código de sesión o el refresh token.");
    }

    const persistedSession = await this.sessionTokenRepository.findOne({
      where: sessionCode
        ? { sessionCode, tokenType: "REFRESH_TOKEN" }
        : { tokenId: this.sha256(refreshToken), tokenType: "REFRESH_TOKEN" },
    });

    if (!persistedSession) {
      throw new UnauthorizedException("No se encontró una sesión activa para cerrar.");
    }

    const logoutAt = new Date();

    await this.sessionTokenRepository.update(persistedSession.id, {
      certificationStatus: "LOGGED_OUT",
      logoutAt,
      revokedAt: logoutAt,
      revocationReason: "Cierre de sesión solicitado por el usuario.",
      isActive: false,
    });

    const logoutLogin = await this.loginRepository.save(
      this.loginRepository.create({
        name: `Logout ${persistedSession.sessionCode}`,
        description: `Cierre de sesión ${persistedSession.sessionCode}`,
        createdBy: "login-service",
        isActive: true,
        correlationCode: this.generateOpaqueToken("login"),
        userId: persistedSession.userId,
        loginIdentifier: persistedSession.sessionCode,
        loginIdentifierType: "SESSION_CODE",
        flowType: "LOGOUT",
        authMethod: "LOCAL_PASSWORD",
        providerCode: "LOCAL",
        subscriberId: persistedSession.subscriberId || "swagger",
        sessionCode: persistedSession.sessionCode,
        authStatus: "LOGGED_OUT",
        failureReason: "",
        ipAddress: "",
        deviceFingerprint: "",
        userAgent: "",
        accessTokenIssued: false,
        refreshTokenIssued: false,
        pkceRequired: false,
        authenticatedUserAcls: persistedSession.authenticatedUserAcls || {},
        occurredAt: logoutAt,
        metadata: {
          logoutReason: "USER_REQUESTED",
        },
      }),
    );

    await this.publishDomainEvent(
      LoginLoggedOutEvent.create(
        String(logoutLogin.id),
        logoutLogin,
        String(logoutLogin.createdBy || "login-service"),
        String(logoutLogin.correlationCode || logoutLogin.id),
      ),
    );

    return {
      ok: true,
      message: "Sesión cerrada correctamente.",
      sessionCode: persistedSession.sessionCode,
      logoutAt,
    };
  }

  private async findUserByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier },
        { phone: identifier },
        { identifierValue: identifier },
      ],
    });
  }

  private async registerFailedLogin(identifier: string, reason: string): Promise<Login> {
    const failedLogin = this.loginRepository.create({
      name: `Login fallido ${identifier}`,
      description: `Intento fallido de autenticación para ${identifier}`,
      createdBy: "login-service",
      isActive: true,
      correlationCode: this.generateOpaqueToken("login"),
      loginIdentifier: identifier,
      loginIdentifierType: "UNKNOWN",
      flowType: "PASSWORD",
      authMethod: "LOCAL_PASSWORD",
      providerCode: "LOCAL",
      subscriberId: "swagger",
      sessionCode: "",
      authStatus: "FAILED",
      failureReason: reason,
      ipAddress: "",
      deviceFingerprint: "",
      userAgent: "",
      accessTokenIssued: false,
      refreshTokenIssued: false,
      pkceRequired: false,
      authenticatedUserAcls: {},
      occurredAt: new Date(),
      metadata: {},
    });

    const persistedLogin = await this.loginRepository.save(failedLogin);
    await this.publishDomainEvent(
      LoginFailedEvent.create(
        String(persistedLogin.id),
        persistedLogin,
        String(persistedLogin.createdBy || "login-service"),
        String(persistedLogin.correlationCode || persistedLogin.id),
      ),
    );
    return persistedLogin;
  }

  private buildLoginResponse(login: Login, extras: {
    accessToken: string;
    refreshToken: string;
    sessionCode: string;
    userId: string;
    expiresAt: Date;
    message: string;
  }): LoginResponse<Login> {
    return {
      ok: true,
      message: extras.message,
      data: login,
      accessToken: extras.accessToken,
      refreshToken: extras.refreshToken,
      sessionCode: extras.sessionCode,
      userId: extras.userId,
      expiresAt: extras.expiresAt,
    };
  }

  private resolveUserAcls(user: User): Record<string, any> {
    return (user.metadata && typeof user.metadata === "object" && user.metadata.acls)
      ? user.metadata.acls
      : {};
  }

  private resolveIdentifierType(user: User, identifier: string): string {
    if (user.username === identifier) {
      return "USERNAME";
    }
    if (user.email === identifier) {
      return "EMAIL";
    }
    if (user.phone === identifier) {
      return "PHONE";
    }
    return (user.identifierType || "IDENTIFIER_VALUE").toUpperCase();
  }

  private matchesPassword(candidate: string, storedHash: string): boolean {
    const normalizedStored = (storedHash || "").trim();
    if (!normalizedStored) {
      return false;
    }

    const sha256 = this.sha256(candidate);
    const normalizedLower = normalizedStored.toLowerCase();

    return normalizedStored === candidate
      || normalizedLower === sha256
      || normalizedLower === `sha256:${sha256}`
      || normalizedLower === `sha256$${sha256}`;
  }

  private sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private generateOpaqueToken(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, "")}${randomUUID().replace(/-/g, "")}`;
  }

  private async publishDomainEvent(event: BaseEvent): Promise<void> {
    await this.publishDomainEvents([event]);
  }

  private async publishDomainEvents(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      this.eventBus.publish(event as any);
      await this.eventPublisher.publish(event as any);
      if (process.env.EVENT_STORE_ENABLED === "true") {
        await this.eventStore.appendEvent(`login-${event.aggregateId}`, event);
      }
    }
  }

  private async handleActivationByPin(
    user: User,
    payload: LoginAuthenticateWithPasswordDto,
    identifier: string,
  ): Promise<LoginResponse<Login>> {
    const activationPin = (payload.activationPin || "").trim();

    const mfaTotp = await this.mfaTotpRepository.findOne({ where: { userId: user.id } });
    if (!mfaTotp) {
      await this.registerFailedLogin(identifier, "No se encontró configuración MFA para esta cuenta.");
      throw new ForbiddenException("No se encontró configuración de activación para esta cuenta.");
    }

    // PASO 1: Si NO viene PIN, devolver respuesta indicando que se requiere activación
    if (!activationPin) {
      // Registrar intento como ACTIVATION_REQUIRED (no como fallo)
      const login = this.loginRepository.create({
        name: `Login ${identifier}`,
        description: `Activación pendiente para ${identifier}`,
        createdBy: "login-service",
        isActive: true,
        correlationCode: this.generateOpaqueToken("login"),
        userId: user.id,
        loginIdentifier: identifier,
        loginIdentifierType: this.resolveIdentifierType(user, identifier),
        flowType: "PASSWORD",
        authMethod: "LOCAL_PASSWORD",
        providerCode: "LOCAL",
        subscriberId: "swagger",
        sessionCode: "",
        authStatus: "ACTIVATION_REQUIRED",
        failureReason: "",
        ipAddress: "",
        deviceFingerprint: "",
        userAgent: "",
        accessTokenIssued: false,
        refreshTokenIssued: false,
        pkceRequired: false,
        authenticatedUserAcls: {},
        occurredAt: new Date(),
        metadata: { activationRequired: true, deliveryMode: mfaTotp.deliveryMode },
      });

      const persistedLogin = await this.loginRepository.save(login);

      // En modo LOCAL, regenerar un PIN fresco y devolvérselo al usuario
      const response: LoginResponse<Login> = {
        ok: true,
        message: "La cuenta requiere activación. Introduzca el PIN de 6 dígitos en el campo activationPin junto con sus credenciales.",
        data: persistedLogin,
        activationRequired: true,
        deliveryMode: mfaTotp.deliveryMode,
      };

      if (mfaTotp.deliveryMode === "LOCAL") {
        // Si el PIN aún es válido, regenerar PIN en texto plano para mostrarlo
        // Nota: el PIN original está hasheado, hay que regenerar uno nuevo
        const newPin = String(randomInt(0, 1000000)).padStart(6, "0");
        const newPinHash = createHash("sha256").update(newPin).digest("hex");
        const expiryMinutes = Number(process.env.MFA_PIN_EXPIRY_MINUTES || 30);
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        await this.mfaTotpRepository.update(mfaTotp.id, {
          activationPin: newPinHash,
          activationPinExpiresAt: expiresAt,
          pinVerified: false,
        });

        response.activationPin = newPin;
        response.message = `La cuenta requiere activación. Su PIN de activación es: ${newPin}. Envíelo en el campo activationPin junto con sus credenciales.`;
      } else if (mfaTotp.deliveryMode === "SMS") {
        response.message = "La cuenta requiere activación. Se ha enviado un PIN de 6 dígitos a su teléfono. Envíelo en el campo activationPin.";
      } else if (mfaTotp.deliveryMode === "EMAIL") {
        response.message = "La cuenta requiere activación. Se ha enviado un PIN de 6 dígitos a su correo. Envíelo en el campo activationPin.";
      }

      return response;
    }

    // PASO 2: Viene PIN — verificar y activar

    if (mfaTotp.pinVerified) {
      await this.registerFailedLogin(identifier, "El PIN ya fue utilizado. Contacte soporte.");
      throw new ForbiddenException("El PIN de activación ya fue utilizado.");
    }

    if (mfaTotp.activationPinExpiresAt && new Date() > mfaTotp.activationPinExpiresAt) {
      await this.registerFailedLogin(identifier, "El PIN de activación ha expirado.");
      throw new ForbiddenException("El PIN de activación ha expirado. Intente hacer login sin PIN para obtener uno nuevo.");
    }

    const pinHash = this.sha256(activationPin);
    if (mfaTotp.activationPin !== pinHash) {
      await this.registerFailedLogin(identifier, "PIN de activación incorrecto.");
      throw new UnauthorizedException("PIN de activación incorrecto.");
    }

    // PIN correcto: activar la cuenta
    await this.userRepository.update(user.id, {
      accountStatus: "ACTIVE",
      isActive: true,
    });

    // Marcar PIN como verificado
    await this.mfaTotpRepository.update(mfaTotp.id, {
      pinVerified: true,
      challengeStatus: "VERIFIED",
      verifiedAt: new Date(),
      lastUsedAt: new Date(),
    });

    // Continuar con autenticación normal (usuario ya está activo)
    const activatedUser = await this.userRepository.findOne({ where: { id: user.id } });
    if (!activatedUser) {
      throw new ForbiddenException("Error al activar la cuenta.");
    }

    // Crear sesión normalmente
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 1000 * 60 * 60 * 24 * 7);
    const sessionCode = this.generateOpaqueToken("session");
    const refreshToken = this.generateOpaqueToken("refresh");
    const accessToken = this.generateOpaqueToken("access");

    const sessionToken = new SessionToken();
    Object.assign(sessionToken, {
      name: `Sesión de ${identifier}`,
      description: `Refresh token emitido para ${identifier}`,
      createdBy: "login-service",
      isActive: true,
      userId: activatedUser.id,
      subscriberId: "swagger",
      sessionCode,
      tokenId: this.sha256(refreshToken),
      tokenType: "REFRESH_TOKEN",
      issuedAt,
      expiresAt,
      revokedAt: undefined,
      revocationReason: "",
      logoutAt: undefined,
      certificationStatus: "ISSUED",
      authenticatedUserAcls: this.resolveUserAcls(activatedUser),
      metadata: {
        identifier,
        accessTokenHash: this.sha256(accessToken),
        activatedAt: issuedAt.toISOString(),
      },
    });

    await this.sessionTokenRepository.save(sessionToken);

    const login = this.loginRepository.create({
      name: `Login ${identifier}`,
      description: `Activación y autenticación satisfactoria para ${identifier}`,
      createdBy: "login-service",
      isActive: true,
      correlationCode: this.generateOpaqueToken("login"),
      userId: activatedUser.id,
      loginIdentifier: identifier,
      loginIdentifierType: this.resolveIdentifierType(activatedUser, identifier),
      flowType: "PASSWORD",
      authMethod: "LOCAL_PASSWORD",
      providerCode: "LOCAL",
      subscriberId: "swagger",
      sessionCode,
      authStatus: "SUCCEEDED",
      failureReason: "",
      ipAddress: "",
      deviceFingerprint: "",
      userAgent: "",
      accessTokenIssued: true,
      refreshTokenIssued: true,
      pkceRequired: false,
      authenticatedUserAcls: this.resolveUserAcls(activatedUser),
      occurredAt: issuedAt,
      metadata: {
        refreshTokenId: sessionToken.tokenId,
        accessTokenHash: this.sha256(accessToken),
        activatedByPin: true,
      },
    });

    const persistedLogin = await this.loginRepository.save(login);

    await this.userRepository.update(activatedUser.id, {
      lastLoginAt: issuedAt,
    });

    await this.publishDomainEvent(
      LoginSucceededEvent.create(
        String(persistedLogin.id),
        persistedLogin,
        String(persistedLogin.createdBy || "login-service"),
        String(persistedLogin.correlationCode || persistedLogin.id),
      ),
    );

    return this.buildLoginResponse(persistedLogin, {
      accessToken,
      refreshToken,
      sessionCode,
      userId: activatedUser.id,
      expiresAt,
      message: "Cuenta activada y autenticación completada correctamente.",
    });
  }
}
