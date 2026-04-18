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

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash, randomInt, randomUUID } from "crypto";
import { FindManyOptions, ILike, Repository } from "typeorm";
import { Helper } from "src/common/helpers/helpers";
import { User } from "../entities/user.entity";
import {
  CreateUserDto,
  CreateUserMinimalDto,
  UpdateUserMinimalDto,
  UserListQueryDto,
} from "../dtos/all-dto";
import { UserCommandRepository } from "../repositories/usercommand.repository";
import { UserQueryRepository } from "../repositories/userquery.repository";
import { UserRepository } from "../repositories/user.repository";
import { UserResponse, UsersResponse } from "../types/user.types";
import { MfaTotp } from "../../mfa-totp/entities/mfa-totp.entity";

@Injectable()
export class UserService {
  constructor(
    private readonly commandRepository: UserCommandRepository,
    private readonly queryRepository: UserQueryRepository,
    private readonly repository: UserRepository,
    @InjectRepository(MfaTotp)
    private readonly mfaTotpRepository: Repository<MfaTotp>,
  ) {}

  async create(payload: CreateUserMinimalDto): Promise<UserResponse<User>> {
    try {
      const normalized = this.normalizeCreatePayload(payload);
      const entity = await this.commandRepository.create(User.fromDto(normalized));

      // Generar PIN de activación MFA-TOTP
      const { pin, mfaTotp } = await this.createActivationMfaTotp(entity);

      const response: UserResponse<User> & { activationPin?: string } = {
        ok: true,
        message: "Usuario creado con éxito. Requiere activación por PIN.",
        data: entity,
      };

      // En modo LOCAL devolver el PIN en la respuesta
      if (mfaTotp.deliveryMode === "LOCAL") {
        response.activationPin = pin;
      }

      return response;
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async bulkCreate(payloads: CreateUserMinimalDto[]): Promise<UsersResponse<User>> {
    try {
      const entities = await this.commandRepository.bulkCreate(
        payloads.map((payload) => User.fromDto(this.normalizeCreatePayload(payload))),
      );

      return {
        ok: true,
        message: "Usuarios creados con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async update(id: string, payload: UpdateUserMinimalDto): Promise<UserResponse<User>> {
    try {
      const current = await this.queryRepository.findById(id);
      if (!current) {
        throw new NotFoundException("Usuario no encontrado.");
      }

      const patch = this.normalizeUpdatePayload(current, payload);
      const entity = await this.commandRepository.update(id, patch);
      if (!entity) {
        throw new NotFoundException("Usuario no encontrado.");
      }

      return {
        ok: true,
        message: "Usuario actualizado con éxito.",
        data: entity,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async bulkUpdate(payloads: UpdateUserMinimalDto[]): Promise<UsersResponse<User>> {
    try {
      const normalizedPayloads = await Promise.all(
        payloads.map(async (payload) => {
          if (!payload.id) {
            throw new BadRequestException("Cada elemento de actualización masiva debe incluir id.");
          }
          const current = await this.queryRepository.findById(payload.id);
          if (!current) {
            throw new NotFoundException(`Usuario no encontrado para id ${payload.id}.`);
          }
          return this.normalizeUpdatePayload(current, payload);
        }),
      );

      const entities = await this.commandRepository.bulkUpdate(normalizedPayloads);

      return {
        ok: true,
        message: "Usuarios actualizados con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async delete(id: string): Promise<UserResponse<User>> {
    try {
      const entity = await this.queryRepository.findById(id);
      if (!entity) {
        throw new NotFoundException("Usuario no encontrado.");
      }

      await this.commandRepository.delete(id);

      return {
        ok: true,
        message: "Usuario eliminado con éxito.",
        data: entity,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async bulkDelete(ids: string[]): Promise<number> {
    try {
      const result = await this.commandRepository.bulkDelete(ids);
      return result.affected ?? 0;
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async findAll(filters?: UserListQueryDto): Promise<UsersResponse<User>> {
    try {
      const options = this.buildFindOptions(filters);
      const users = await this.repository.findAll(options);
      const count = await this.repository.count();

      return {
        ok: true,
        message: "Listado de usuarios obtenido con éxito.",
        data: users,
        count: users.length,
        pagination: Helper.getPaginator(
          this.parsePositiveNumber(filters?.page, 1),
          this.parsePositiveNumber(filters?.size, 25),
          count,
        ),
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async findById(id: string): Promise<UserResponse<User>> {
    try {
      const entity = await this.queryRepository.findById(id);
      if (!entity) {
        throw new NotFoundException("Usuario no encontrado.");
      }

      return {
        ok: true,
        message: "Usuario obtenido con éxito.",
        data: entity,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async findByField(
    field: string,
    value: string,
    page?: number,
    limit?: number,
  ): Promise<UsersResponse<User>> {
    try {
      const items = await this.repository.findByField(
        field,
        value,
        this.parsePositiveNumber(page, 1),
        this.parsePositiveNumber(limit, 25),
      );

      return {
        ok: true,
        message: "Usuarios obtenidos con éxito.",
        data: items,
        count: items.length,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async findOne(where?: Record<string, any>): Promise<UserResponse<User>> {
    try {
      const entity = await this.repository.findOne(where);
      if (!entity) {
        throw new NotFoundException("Usuario no encontrado.");
      }

      return {
        ok: true,
        message: "Usuario obtenido con éxito.",
        data: entity,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  async findOneOrFail(where?: Record<string, any>): Promise<UserResponse<User>> {
    return this.findOne(where);
  }

  async findAndCount(where?: Record<string, any>): Promise<UsersResponse<User>> {
    try {
      const [entities, count] = await this.repository.findAndCount(where);

      return {
        ok: true,
        message: "Usuarios obtenidos con éxito.",
        data: entities,
        count,
      };
    } catch (error) {
      return Helper.throwCachedError(error);
    }
  }

  private normalizeCreatePayload(payload: CreateUserMinimalDto): CreateUserDto {
    const identifierType = this.resolveIdentifierType(payload.identifierType);
    const normalizedUsername = payload.username.trim();
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedPhone = payload.phone.trim();
    const now = new Date();
    // Siempre PENDING_VERIFICATION e inactivo. Requiere activación por MFA-TOTP.
    const accountStatus = "PENDING_VERIFICATION";
    const isActive = false;

    this.validatePassword(payload.password);

    return CreateUserDto.build({
      id: undefined,
      name: (payload.name || normalizedUsername).trim(),
      description: (payload.description || `Usuario ${normalizedUsername}`).trim(),
      createdBy: (payload.createdBy || "swagger-user-service").trim(),
      isActive,
      code: randomUUID(),
      username: normalizedUsername,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: this.hashPassword(payload.password),
      referralId: payload.referralId,
      identifierType,
      identifierValue: this.resolveIdentifierValue(
        identifierType,
        normalizedUsername,
        normalizedEmail,
        normalizedPhone,
      ),
      accountStatus,
      userType: "CUSTOMER",
      termsAccepted: payload.termsAccepted,
      termsAcceptedAt: payload.termsAccepted ? now : undefined,
      lastLoginAt: undefined,
      passwordChangedAt: now,
      mfaEnabled: false,
      totpEnabled: false,
      federatedOnly: false,
      metadata: payload.metadata || {},
      creationDate: now,
      modificationDate: now,
    });
  }

  private normalizeUpdatePayload(current: User, payload: UpdateUserMinimalDto): Partial<User> {
    const patch: Partial<User> = {
      modificationDate: new Date(),
    };

    if (payload.name !== undefined) {
      patch["name"] = payload.name.trim();
    }
    if (payload.description !== undefined) {
      patch["description"] = payload.description.trim();
    }
    if (payload.accountStatus !== undefined) {
      patch.accountStatus = payload.accountStatus.trim().toUpperCase();
    }
    if (payload.userType !== undefined) {
      patch.userType = payload.userType.trim().toUpperCase();
    }
    if (payload.isActive !== undefined) {
      patch.isActive = payload.isActive;
    }
    if (payload.createdBy !== undefined) {
      patch.createdBy = payload.createdBy.trim();
    }
    if (payload.metadata !== undefined) {
      patch.metadata = {
        ...(current.metadata || {}),
        ...(payload.metadata || {}),
      };
    }

    const identifierType = this.resolveIdentifierType(current.identifierType);
    const nextUsername = payload.username !== undefined ? payload.username.trim() : current.username || "";
    const nextEmail = payload.email !== undefined ? payload.email.trim().toLowerCase() : current.email;
    const nextPhone = payload.phone !== undefined ? payload.phone.trim() : current.phone || "";
    const nextIdentifierValue = this.resolveIdentifierValue(
      identifierType,
      nextUsername,
      nextEmail,
      nextPhone,
    );

    if (current.identifierValue !== nextIdentifierValue) {
      throw new BadRequestException("El identificador principal no puede modificarse después de crear el usuario.");
    }

    if (payload.username !== undefined) {
      patch.username = nextUsername;
    }
    if (payload.email !== undefined) {
      patch.email = nextEmail;
    }
    if (payload.phone !== undefined) {
      patch.phone = nextPhone;
    }
    if (payload.password !== undefined) {
      this.validatePassword(payload.password);
      patch.passwordHash = this.hashPassword(payload.password);
      patch.passwordChangedAt = new Date();
    }
    if (payload.termsAccepted !== undefined) {
      patch.termsAccepted = payload.termsAccepted;
      patch.termsAcceptedAt = payload.termsAccepted ? (current.termsAcceptedAt || new Date()) : undefined;
    }

    return patch;
  }

  private buildFindOptions(filters?: UserListQueryDto): FindManyOptions<User> {
    const page = this.parsePositiveNumber(filters?.page, 1);
    const size = this.parsePositiveNumber(filters?.size, 25);
    const where: Record<string, any> = {};

    if (filters?.id) where.id = filters.id;
    if (filters?.code) where.code = filters.code;
    if (filters?.identifierType) where.identifierType = filters.identifierType.trim().toUpperCase();
    if (filters?.identifierValue) where.identifierValue = filters.identifierValue.trim();
    if (filters?.accountStatus) where.accountStatus = filters.accountStatus.trim().toUpperCase();
    if (filters?.userType) where.userType = filters.userType.trim().toUpperCase();
    if (filters?.isActive !== undefined) where.isActive = this.parseBoolean(filters.isActive);
    if (filters?.termsAccepted !== undefined) where.termsAccepted = this.parseBoolean(filters.termsAccepted);

    if (filters?.search) {
      const search = `%${filters.search.trim()}%`;
      return {
        where: [
          { ...where, username: ILike(search) },
          { ...where, email: ILike(search) },
          { ...where, phone: ILike(search) },
          { ...where, code: ILike(search) },
        ],
        order: {
          [filters?.sort || "creationDate"]: this.normalizeOrder(filters?.order),
        },
        skip: (page - 1) * size,
        take: size,
      };
    }

    if (filters?.username) where.username = ILike(`%${filters.username.trim()}%`);
    if (filters?.email) where.email = ILike(`%${filters.email.trim().toLowerCase()}%`);
    if (filters?.phone) where.phone = ILike(`%${filters.phone.trim()}%`);

    return {
      where,
      order: {
        [filters?.sort || "creationDate"]: this.normalizeOrder(filters?.order),
      },
      skip: (page - 1) * size,
      take: size,
    };
  }

  private resolveIdentifierType(identifierType?: string): string {
    const configured = (identifierType || process.env.USER_IDENTIFIER_TYPE || "EMAIL").trim().toUpperCase();
    if (!["EMAIL", "USERNAME", "PHONE"].includes(configured)) {
      throw new BadRequestException("identifierType debe ser EMAIL, USERNAME o PHONE.");
    }
    return configured;
  }

  private resolveIdentifierValue(
    identifierType: string,
    username: string,
    email: string,
    phone: string,
  ): string {
    switch (identifierType) {
      case "USERNAME":
        if (!username) {
          throw new BadRequestException("Se requiere username como identificador principal.");
        }
        return username;
      case "PHONE":
        if (!phone) {
          throw new BadRequestException("Se requiere phone como identificador principal.");
        }
        return phone;
      case "EMAIL":
      default:
        if (!email) {
          throw new BadRequestException("Se requiere email como identificador principal.");
        }
        return email;
    }
  }

  private validatePassword(password: string): void {
    const normalized = (password || "").trim();
    const minLength = Number(process.env.USER_PASSWORD_MIN_LENGTH || 8);

    if (!normalized) {
      throw new BadRequestException("La contraseña es obligatoria.");
    }
    if (normalized.length < minLength) {
      throw new BadRequestException(`La contraseña debe tener al menos ${minLength} caracteres.`);
    }
  }

  private hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
  }

  private parsePositiveNumber(value: number | string | undefined, fallback: number): number {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? Math.trunc(numeric) : fallback;
  }

  private normalizeOrder(order?: string): "ASC" | "DESC" {
    return (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
  }

  private parseBoolean(value: boolean | string): boolean {
    if (typeof value === "boolean") {
      return value;
    }
    return String(value).toLowerCase() === "true";
  }

  private async createActivationMfaTotp(user: User): Promise<{ pin: string; mfaTotp: MfaTotp }> {
    const pin = String(randomInt(0, 1000000)).padStart(6, "0");
    const pinHash = createHash("sha256").update(pin).digest("hex");
    const expiryMinutes = Number(process.env.MFA_PIN_EXPIRY_MINUTES || 30);
    const deliveryMode = (process.env.MFA_DELIVERY_MODE || "LOCAL").trim().toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);

    const mfaTotp = this.mfaTotpRepository.create({
      name: `MFA-Activation-${user.username || user.email}`,
      description: `PIN de activación para ${user.email}`,
      createdBy: "user-service",
      isActive: true,
      userId: user.id,
      mfaEnabled: true,
      mfaMode: "REQUIRED",
      totpEnabled: false,
      totpSecretRef: "",
      recoveryCodesVersion: 1,
      challengeStatus: "PENDING",
      challengeType: "TOTP",
      deliveryMode,
      activationPin: pinHash,
      activationPinExpiresAt: expiresAt,
      pinVerified: false,
      verifiedAt: undefined,
      lastUsedAt: undefined,
      metadata: { deliveryMode, createdAt: now.toISOString() },
      creationDate: now,
      modificationDate: now,
    } as Partial<MfaTotp>);

    mfaTotp.type = "mfatotp";
    await this.mfaTotpRepository.save(mfaTotp);

    return { pin, mfaTotp };
  }
}
