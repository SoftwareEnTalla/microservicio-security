import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { createHash, randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from '../../user/entities/user.entity';
import { IdentityFederation } from '../../identity-federation/entities/identity-federation.entity';
import { SessionToken } from '../../session-token/entities/session-token.entity';
import { SessionTokenCommandService } from '../../session-token/services/sessiontokencommand.service';
import { SessionTokenCommandRepository } from '../../session-token/repositories/sessiontokencommand.repository';
import {
  CompleteFederatedLoginDto,
  LoginWithPasswordDto,
  LogoutDto,
  RefreshSecurityTokenDto,
  StartFederatedLoginDto,
} from '../dtos/login.dto';
import {
  FederatedLoginStartResponse,
  LoginResponse,
  LogoutResponse,
  SecurityTokenPairResponse,
} from '../types/login.types';
import { LoginCompletedEvent } from '../events/login.events';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);
  private readonly accessTokenTtlSeconds = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 900);
  private readonly refreshTokenTtlSeconds = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 604800);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(IdentityFederation)
    private readonly identityFederationRepository: Repository<IdentityFederation>,
    @InjectRepository(SessionToken)
    private readonly sessionTokenRepository: Repository<SessionToken>,
    private readonly sessionTokenCommandService: SessionTokenCommandService,
    private readonly sessionTokenCommandRepository: SessionTokenCommandRepository,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async authenticateWithPassword(dto: LoginWithPasswordDto): Promise<LoginResponse> {
    const occurredAt = new Date();
    const user = await this.findUserByIdentifier(dto.identifier);

    if (!user) {
      this.publishLoginOutcome({
        aggregateId: randomUUID(),
        occurredAt,
        loginIdentifier: dto.identifier,
        authMethod: 'LOCAL_PASSWORD',
        authStatus: 'FAILED',
        failureReason: 'IDENTIFIER_NOT_FOUND',
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
        userAgent: dto.userAgent,
        metadata: { subscriberId: dto.subscriberId ?? null },
      });
      throw new UnauthorizedException('No fue posible autenticar el identificador indicado.');
    }

    this.ensureLocalPasswordLoginAllowed(user);

    const passwordMatches = await this.comparePassword(dto.password, user.passwordHash);
    if (!passwordMatches) {
      this.publishLoginOutcome({
        aggregateId: randomUUID(),
        occurredAt,
        userId: user.id,
        loginIdentifier: dto.identifier,
        authMethod: 'LOCAL_PASSWORD',
        authStatus: 'FAILED',
        failureReason: 'INVALID_CREDENTIALS',
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
        userAgent: dto.userAgent,
        metadata: { subscriberId: dto.subscriberId ?? null },
      });
      throw new UnauthorizedException('No fue posible autenticar el identificador indicado.');
    }

    const authenticatedUserAcls = this.resolveAuthenticatedUserAcls(user);
    const tokens = await this.issueSessionTokens({
      user,
      authMethod: 'LOCAL_PASSWORD',
      subscriberId: dto.subscriberId,
      authenticatedUserAcls,
      metadata: {
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
        userAgent: dto.userAgent,
      },
    });

    await this.userRepository.update(user.id, { lastLoginAt: occurredAt, modificationDate: occurredAt });

    this.publishLoginOutcome({
      aggregateId: randomUUID(),
      occurredAt,
      userId: user.id,
      loginIdentifier: dto.identifier,
      authMethod: 'LOCAL_PASSWORD',
      authStatus: 'SUCCEEDED',
      ipAddress: dto.ipAddress,
      deviceFingerprint: dto.deviceFingerprint,
      userAgent: dto.userAgent,
      authenticatedUserAcls,
      metadata: {
        subscriberId: dto.subscriberId ?? null,
        sessionCode: tokens.sessionCode,
      },
    });

    return {
      ok: true,
      message: 'Autenticación completada correctamente.',
      tokens,
      user: this.toUserSummary(user),
      authenticatedUserAcls,
    };
  }

  async refreshSecurityToken(dto: RefreshSecurityTokenDto): Promise<LoginResponse> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const sessionRecord = await this.sessionTokenRepository.findOne({
      where: {
        tokenId: String(payload.jti ?? payload.tokenId ?? ''),
        tokenType: 'REFRESH',
      },
    });

    if (!sessionRecord) {
      throw new UnauthorizedException('La continuidad de sesión indicada no existe o ya no es válida.');
    }

    if (sessionRecord.certificationStatus !== 'ISSUED') {
      throw new UnauthorizedException('La continuidad de sesión indicada ya no está habilitada.');
    }

    if (sessionRecord.expiresAt && new Date(sessionRecord.expiresAt).getTime() <= Date.now()) {
      await this.sessionTokenCommandService.update(sessionRecord.id, {
        ...sessionRecord,
        certificationStatus: 'EXPIRED',
        revokedAt: new Date(),
        revocationReason: 'REFRESH_TOKEN_EXPIRED',
        modificationDate: new Date(),
      } as any);
      throw new UnauthorizedException('La continuidad de sesión indicada expiró.');
    }

    const user = await this.userRepository.findOne({ where: { id: String(payload.sub) } });
    if (!user) {
      throw new NotFoundException('No se encontró el usuario asociado a la continuidad de sesión.');
    }

    this.ensureLocalPasswordLoginAllowed(user, false);

    const authenticatedUserAcls = this.resolveAuthenticatedUserAcls(user);
    const rotatedTokens = await this.rotateSessionTokens({
      user,
      sessionRecord,
      subscriberId: dto.subscriberId || String(payload.subscriberId || sessionRecord.subscriberId || ''),
      authenticatedUserAcls,
      metadata: {
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
        userAgent: dto.userAgent,
      },
    });

    this.publishLoginOutcome({
      aggregateId: randomUUID(),
      occurredAt: new Date(),
      userId: user.id,
      loginIdentifier: user.identifierValue || user.email,
      authMethod: 'LOCAL_PASSWORD',
      authStatus: 'REFRESHED',
      ipAddress: dto.ipAddress,
      deviceFingerprint: dto.deviceFingerprint,
      userAgent: dto.userAgent,
      authenticatedUserAcls,
      metadata: {
        subscriberId: dto.subscriberId ?? sessionRecord.subscriberId ?? null,
        sessionCode: rotatedTokens.sessionCode,
      },
    });

    return {
      ok: true,
      message: 'La sesión fue renovada correctamente.',
      tokens: rotatedTokens,
      user: this.toUserSummary(user),
      authenticatedUserAcls,
    };
  }

  async logout(dto: LogoutDto): Promise<LogoutResponse> {
    const sessionRecord = await this.resolveSessionForLogout(dto);
    if (!sessionRecord) {
      throw new NotFoundException('No se encontró una sesión activa que pueda cerrarse.');
    }

    await this.sessionTokenCommandService.update(sessionRecord.id, {
      ...sessionRecord,
      certificationStatus: 'LOGGED_OUT',
      logoutAt: new Date(),
      revokedAt: new Date(),
      revocationReason: dto.reason || 'USER_LOGOUT',
      modificationDate: new Date(),
      metadata: {
        ...(sessionRecord.metadata || {}),
        logoutReason: dto.reason || 'USER_LOGOUT',
      },
    } as any);

    return {
      ok: true,
      message: 'La sesión fue cerrada correctamente.',
      sessionCode: sessionRecord.sessionCode,
    };
  }

  async startFederatedLogin(dto: StartFederatedLoginDto): Promise<FederatedLoginStartResponse> {
    const provider = await this.identityFederationRepository.findOne({ where: { code: dto.providerCode } });
    if (!provider || !provider.enabled) {
      throw new NotFoundException('El proveedor de identidad solicitado no está disponible.');
    }

    const state = dto.state || randomUUID();
    const protocolFamily = String(provider.protocolFamily || '').toUpperCase();
    const resolvedScopes = dto.scopes?.length
      ? dto.scopes
      : this.readStringArray(provider.metadata, 'scopes', ['openid', 'profile', 'email']);

    if (!provider.authorizationUrl) {
      throw new BadRequestException('El proveedor no tiene una URL de autorización configurada.');
    }

    let codeVerifier = dto.codeVerifier;
    let codeChallenge = dto.codeChallenge;
    const shouldUsePkce = this.shouldUsePkce(provider, dto);
    if (shouldUsePkce && !codeChallenge) {
      codeVerifier = codeVerifier || this.generateCodeVerifier();
      codeChallenge = this.createS256CodeChallenge(codeVerifier);
    }

    const url = new URL(provider.authorizationUrl);
    url.searchParams.set('client_id', provider.clientId);
    if (dto.redirectUri) url.searchParams.set('redirect_uri', dto.redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', resolvedScopes.join(' '));

    if (protocolFamily === 'OIDC' || protocolFamily === 'OAUTH') {
      url.searchParams.set('response_type', 'code');
      if (dto.loginHint) url.searchParams.set('login_hint', dto.loginHint);
      if (shouldUsePkce && codeChallenge) {
        url.searchParams.set('code_challenge', codeChallenge);
        url.searchParams.set('code_challenge_method', dto.codeChallengeMethod || 'S256');
      }
    }

    return {
      ok: true,
      message: 'Redirección federada preparada correctamente.',
      providerCode: provider.code,
      protocolFamily,
      authorizationUrl: url.toString(),
      state,
      codeVerifier,
    };
  }

  async completeFederatedLogin(dto: CompleteFederatedLoginDto): Promise<LoginResponse> {
    const provider = await this.identityFederationRepository.findOne({ where: { code: dto.providerCode } });
    if (!provider || !provider.enabled) {
      throw new NotFoundException('El proveedor de identidad solicitado no está disponible.');
    }

    const protocolFamily = String(provider.protocolFamily || '').toUpperCase();
    if (!['OIDC', 'OAUTH'].includes(protocolFamily)) {
      throw new BadRequestException('Solo se completan automáticamente flujos OAuth/OIDC en esta versión.');
    }

    if (!dto.code) {
      throw new BadRequestException('El proveedor debe devolver un authorization code para completar el login.');
    }

    if (!provider.tokenUrl) {
      throw new BadRequestException('El proveedor no tiene una URL de token configurada.');
    }

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: dto.code,
      client_id: provider.clientId,
    });

    if (dto.redirectUri) tokenBody.set('redirect_uri', dto.redirectUri);
    if (dto.codeVerifier) tokenBody.set('code_verifier', dto.codeVerifier);
    const resolvedSecret = this.resolveClientSecret(provider.clientSecretRef);
    if (resolvedSecret) tokenBody.set('client_secret', resolvedSecret);

    const tokenResponse = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      this.publishLoginOutcome({
        aggregateId: randomUUID(),
        occurredAt: new Date(),
        loginIdentifier: dto.providerCode,
        authMethod: protocolFamily,
        authStatus: 'FAILED',
        failureReason: 'FEDERATED_TOKEN_EXCHANGE_FAILED',
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
        userAgent: dto.userAgent,
        metadata: { providerCode: provider.code, errorBody },
      });
      throw new UnauthorizedException('No fue posible completar la autenticación con el proveedor externo.');
    }

    const externalTokens = (await tokenResponse.json()) as Record<string, any>;
    const externalProfile = await this.resolveExternalProfile(provider, externalTokens);
    const user = await this.resolveLocalUserFromExternalProfile(externalProfile);
    if (!user) {
      this.publishLoginOutcome({
        aggregateId: randomUUID(),
        occurredAt: new Date(),
        loginIdentifier: String(externalProfile?.email || externalProfile?.sub || provider.code),
        authMethod: protocolFamily,
        authStatus: 'FAILED',
        failureReason: 'FEDERATED_USER_NOT_LINKED',
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
        userAgent: dto.userAgent,
        metadata: { providerCode: provider.code, externalProfile },
      });
      throw new UnauthorizedException('La identidad externa no está enlazada a un usuario interno.');
    }

    const authenticatedUserAcls = this.resolveAuthenticatedUserAcls(user);
    const localTokens = await this.issueSessionTokens({
      user,
      authMethod: protocolFamily,
      subscriberId: dto.subscriberId,
      authenticatedUserAcls,
      metadata: {
        providerCode: provider.code,
        externalProfile,
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
        userAgent: dto.userAgent,
      },
    });

    await this.userRepository.update(user.id, { lastLoginAt: new Date(), modificationDate: new Date() });

    this.publishLoginOutcome({
      aggregateId: randomUUID(),
      occurredAt: new Date(),
      userId: user.id,
      loginIdentifier: String(externalProfile?.email || externalProfile?.sub || user.identifierValue),
      authMethod: protocolFamily,
      authStatus: 'SUCCEEDED',
      ipAddress: dto.ipAddress,
      deviceFingerprint: dto.deviceFingerprint,
      userAgent: dto.userAgent,
      authenticatedUserAcls,
      metadata: {
        subscriberId: dto.subscriberId ?? null,
        sessionCode: localTokens.sessionCode,
        providerCode: provider.code,
        externalProfile,
      },
    });

    return {
      ok: true,
      message: 'Autenticación federada completada correctamente.',
      tokens: localTokens,
      user: this.toUserSummary(user),
      authenticatedUserAcls,
      provider: {
        code: provider.code,
        providerType: provider.providerType,
        protocolFamily,
      },
    };
  }

  private async issueSessionTokens(params: {
    user: User;
    authMethod: string;
    subscriberId?: string;
    authenticatedUserAcls: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<SecurityTokenPairResponse> {
    const sessionCode = randomUUID();
    const accessTokenId = randomUUID();
    const refreshTokenId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: params.user.id,
        typ: 'access',
        jti: accessTokenId,
        sessionCode,
        subscriberId: params.subscriberId || null,
        username: params.user.username || null,
        email: params.user.email,
        phone: params.user.phone || null,
        userType: params.user.userType,
        identifierType: params.user.identifierType,
        identifierValue: params.user.identifierValue,
        authenticatedUserAcls: params.authenticatedUserAcls,
        authMethod: params.authMethod,
      },
      { expiresIn: this.accessTokenTtlSeconds },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: params.user.id,
        typ: 'refresh',
        jti: refreshTokenId,
        tokenId: refreshTokenId,
        sessionCode,
        subscriberId: params.subscriberId || null,
        authMethod: params.authMethod,
      },
      { expiresIn: this.refreshTokenTtlSeconds },
    );

    await this.sessionTokenCommandService.create({
      name: `Security session ${sessionCode}`,
      creationDate: new Date(),
      modificationDate: new Date(),
      createdBy: 'login-module',
      isActive: true,
      userId: params.user.id,
      subscriberId: params.subscriberId || 'unknown-subscriber',
      sessionCode,
      tokenId: refreshTokenId,
      tokenType: 'REFRESH',
      issuedAt: new Date(now * 1000),
      expiresAt: new Date((now + this.refreshTokenTtlSeconds) * 1000),
      certificationStatus: 'ISSUED',
      authenticatedUserAcls: params.authenticatedUserAcls,
      metadata: {
        ...(params.metadata || {}),
        accessTokenId,
        refreshTokenId,
      },
    } as any);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenTtlSeconds,
      refreshExpiresIn: this.refreshTokenTtlSeconds,
      sessionCode,
    };
  }

  private async rotateSessionTokens(params: {
    user: User;
    sessionRecord: SessionToken;
    subscriberId?: string;
    authenticatedUserAcls: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<SecurityTokenPairResponse> {
    const accessTokenId = randomUUID();
    const refreshTokenId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: params.user.id,
        typ: 'access',
        jti: accessTokenId,
        sessionCode: params.sessionRecord.sessionCode,
        subscriberId: params.subscriberId || null,
        username: params.user.username || null,
        email: params.user.email,
        phone: params.user.phone || null,
        userType: params.user.userType,
        identifierType: params.user.identifierType,
        identifierValue: params.user.identifierValue,
        authenticatedUserAcls: params.authenticatedUserAcls,
        authMethod: 'LOCAL_PASSWORD',
      },
      { expiresIn: this.accessTokenTtlSeconds },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: params.user.id,
        typ: 'refresh',
        jti: refreshTokenId,
        tokenId: refreshTokenId,
        sessionCode: params.sessionRecord.sessionCode,
        subscriberId: params.subscriberId || null,
        authMethod: 'LOCAL_PASSWORD',
      },
      { expiresIn: this.refreshTokenTtlSeconds },
    );

    await this.sessionTokenCommandService.update(params.sessionRecord.id, {
      ...params.sessionRecord,
      subscriberId: params.subscriberId || params.sessionRecord.subscriberId,
      tokenId: refreshTokenId,
      tokenType: 'REFRESH',
      issuedAt: new Date(now * 1000),
      expiresAt: new Date((now + this.refreshTokenTtlSeconds) * 1000),
      certificationStatus: 'ISSUED',
      revokedAt: null,
      revocationReason: '',
      logoutAt: null,
      modificationDate: new Date(),
      authenticatedUserAcls: params.authenticatedUserAcls,
      metadata: {
        ...(params.sessionRecord.metadata || {}),
        ...(params.metadata || {}),
        accessTokenId,
        refreshTokenId,
      },
    } as any);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenTtlSeconds,
      refreshExpiresIn: this.refreshTokenTtlSeconds,
      sessionCode: params.sessionRecord.sessionCode,
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<Record<string, any>> {
    try {
      const payload = await this.jwtService.verifyAsync<Record<string, any>>(refreshToken);
      if (String(payload.typ || '') !== 'refresh') {
        throw new UnauthorizedException('El token recibido no corresponde a una continuidad de sesión.');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedException('La continuidad de sesión indicada no es válida.');
    }
  }

  private async resolveSessionForLogout(dto: LogoutDto): Promise<SessionToken | null> {
    if (dto.refreshToken) {
      const payload = await this.verifyRefreshToken(dto.refreshToken);
      return this.sessionTokenRepository.findOne({
        where: { tokenId: String(payload.jti ?? payload.tokenId ?? ''), tokenType: 'REFRESH' },
      });
    }

    if (dto.sessionCode) {
      return this.sessionTokenRepository.findOne({
        where: { sessionCode: dto.sessionCode },
      });
    }

    throw new BadRequestException('Debes indicar un refresh token o un sessionCode para cerrar sesión.');
  }

  private ensureLocalPasswordLoginAllowed(user: User, rejectPending: boolean = true): void {
    if (user.federatedOnly) {
      throw new UnauthorizedException('Esta cuenta solo permite autenticación mediante proveedor externo.');
    }

    const blockedStatuses = ['INACTIVE', 'BLOCKED', 'SUSPENDED'];
    if (blockedStatuses.includes(String(user.accountStatus || '').toUpperCase())) {
      throw new UnauthorizedException('La cuenta no está habilitada para iniciar sesión.');
    }

    if (rejectPending && String(user.accountStatus || '').toUpperCase() === 'PENDING_VERIFICATION') {
      throw new UnauthorizedException('La cuenta todavía no está lista para iniciar sesión.');
    }
  }

  private async findUserByIdentifier(identifier: string): Promise<User | null> {
    const normalized = identifier.trim();
    return this.userRepository.findOne({
      where: [
        { username: normalized },
        { email: normalized },
        { phone: normalized },
        { identifierValue: normalized },
      ],
    });
  }

  private resolveAuthenticatedUserAcls(user: User): Record<string, any> {
    const metadata = (user.metadata || {}) as Record<string, any>;
    const permissions = Array.isArray(metadata.permissions) ? metadata.permissions : [];
    const roles = Array.isArray(metadata.roles)
      ? metadata.roles
      : [String(user.userType || 'USER').toUpperCase()];

    return {
      roles,
      permissions,
      scopes: [
        `security:${String(user.userType || 'user').toLowerCase()}`,
        `account:${String(user.accountStatus || 'unknown').toLowerCase()}`,
      ],
    };
  }

  private toUserSummary(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      accountStatus: user.accountStatus,
      userType: user.userType,
      identifierType: user.identifierType,
      identifierValue: user.identifierValue,
    };
  }

  private publishLoginOutcome(params: {
    aggregateId: string;
    occurredAt: Date;
    userId?: string;
    loginIdentifier: string;
    authMethod: string;
    authStatus: string;
    failureReason?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
    userAgent?: string;
    authenticatedUserAcls?: Record<string, any>;
    metadata?: Record<string, any>;
  }): void {
    this.eventBus.publish(
      new LoginCompletedEvent(params.aggregateId, {
        occurredAt: params.occurredAt,
        userId: params.userId,
        loginIdentifier: params.loginIdentifier,
        authMethod: params.authMethod,
        authStatus: params.authStatus,
        failureReason: params.failureReason,
        ipAddress: params.ipAddress,
        deviceFingerprint: params.deviceFingerprint,
        userAgent: params.userAgent,
        authenticatedUserAcls: params.authenticatedUserAcls,
        metadata: params.metadata,
      }),
    );
  }

  private async comparePassword(candidatePassword: string, storedHash: string): Promise<boolean> {
    if (!storedHash) return false;

    if (storedHash.startsWith('$2')) {
      return bcrypt.compare(candidatePassword, storedHash);
    }

    if (storedHash.startsWith('sha256:')) {
      return this.sha256(candidatePassword) === storedHash.slice('sha256:'.length);
    }

    if (storedHash.startsWith('plain:')) {
      return candidatePassword === storedHash.slice('plain:'.length);
    }

    return storedHash === candidatePassword || storedHash === this.sha256(candidatePassword);
  }

  private resolveClientSecret(secretRef?: string): string | undefined {
    if (!secretRef) return undefined;
    if (secretRef.startsWith('env:')) {
      return process.env[secretRef.slice(4)];
    }
    return secretRef;
  }

  private async resolveExternalProfile(
    provider: IdentityFederation,
    externalTokens: Record<string, any>,
  ): Promise<Record<string, any>> {
    if (provider.userInfoUrl && externalTokens.access_token) {
      const userInfoResponse = await fetch(provider.userInfoUrl, {
        headers: {
          authorization: `Bearer ${externalTokens.access_token}`,
        },
      });
      if (userInfoResponse.ok) {
        return (await userInfoResponse.json()) as Record<string, any>;
      }
    }

    if (externalTokens.id_token) {
      return this.decodeJwtPayload(String(externalTokens.id_token));
    }

    throw new UnauthorizedException('El proveedor no devolvió información suficiente para identificar al usuario.');
  }

  private async resolveLocalUserFromExternalProfile(profile: Record<string, any>): Promise<User | null> {
    const identifiers = [
      profile.email,
      profile.preferred_username,
      profile.username,
      profile.phone_number,
      profile.sub,
    ].filter((value) => typeof value === 'string' && String(value).trim().length > 0) as string[];

    for (const identifier of identifiers) {
      const found = await this.userRepository.findOne({
        where: [
          { email: identifier },
          { username: identifier },
          { phone: identifier },
          { identifierValue: identifier },
        ],
      });
      if (found) return found;
    }

    return null;
  }

  private shouldUsePkce(provider: IdentityFederation, dto: StartFederatedLoginDto): boolean {
    if (dto.codeChallenge || dto.codeVerifier) return true;
    const metadata = (provider.metadata || {}) as Record<string, any>;
    if (typeof metadata.supportsPkce === 'boolean') return metadata.supportsPkce;
    return ['OIDC', 'OAUTH'].includes(String(provider.protocolFamily || '').toUpperCase());
  }

  private readStringArray(
    metadata: Record<string, any> | undefined,
    key: string,
    fallback: string[],
  ): string[] {
    if (!metadata) return fallback;
    const candidate = metadata[key];
    return Array.isArray(candidate) && candidate.length > 0 ? candidate.map(String) : fallback;
  }

  private generateCodeVerifier(): string {
    return randomBytes(48).toString('base64url');
  }

  private createS256CodeChallenge(codeVerifier: string): string {
    return createHash('sha256').update(codeVerifier).digest('base64url');
  }

  private decodeJwtPayload(token: string): Record<string, any> {
    const parts = token.split('.');
    if (parts.length < 2) return {};
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, any>;
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
