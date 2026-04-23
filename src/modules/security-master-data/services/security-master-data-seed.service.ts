/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 *
 * Seed idempotente de catálogos (security-master-data).
 * Garantiza la existencia de nomencladores base definidos en la historia H-012:
 * user-status, identifier-type, auth-method, mfa-mode, challenge-type,
 * session-status, token-type, identity-provider-type, protocol-family,
 * protocol-version, role-code, permission-effect, approval-status.
 */

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { SecurityMasterData } from "../entities/security-master-data.entity";

interface SeedRow {
  category: string;
  code: string;
  displayName: string;
  sortOrder: number;
}

const SEED_ROWS: SeedRow[] = [
  // user-status
  { category: "user-status", code: "PENDING_VERIFICATION", displayName: "Pendiente de verificación", sortOrder: 10 },
  { category: "user-status", code: "ACTIVE", displayName: "Activo", sortOrder: 20 },
  { category: "user-status", code: "BLOCKED", displayName: "Bloqueado", sortOrder: 30 },
  { category: "user-status", code: "DISABLED", displayName: "Desactivado", sortOrder: 40 },
  { category: "user-status", code: "SUSPENDED", displayName: "Suspendido", sortOrder: 50 },
  // identifier-type
  { category: "identifier-type", code: "EMAIL", displayName: "Correo electrónico", sortOrder: 10 },
  { category: "identifier-type", code: "USERNAME", displayName: "Nombre de usuario", sortOrder: 20 },
  { category: "identifier-type", code: "PHONE", displayName: "Teléfono", sortOrder: 30 },
  // auth-method
  { category: "auth-method", code: "LOCAL_PASSWORD", displayName: "Contraseña local", sortOrder: 10 },
  { category: "auth-method", code: "OAUTH", displayName: "OAuth", sortOrder: 20 },
  { category: "auth-method", code: "OIDC", displayName: "OpenID Connect", sortOrder: 30 },
  { category: "auth-method", code: "SAML", displayName: "SAML", sortOrder: 40 },
  { category: "auth-method", code: "TOTP", displayName: "TOTP", sortOrder: 50 },
  { category: "auth-method", code: "RECOVERY_CODE", displayName: "Código de recuperación", sortOrder: 60 },
  // mfa-mode
  { category: "mfa-mode", code: "OPTIONAL", displayName: "Opcional", sortOrder: 10 },
  { category: "mfa-mode", code: "REQUIRED", displayName: "Obligatorio", sortOrder: 20 },
  { category: "mfa-mode", code: "DISABLED", displayName: "Deshabilitado", sortOrder: 30 },
  // challenge-type
  { category: "challenge-type", code: "TOTP", displayName: "Código TOTP", sortOrder: 10 },
  { category: "challenge-type", code: "SMS_PIN", displayName: "PIN por SMS", sortOrder: 20 },
  { category: "challenge-type", code: "EMAIL_PIN", displayName: "PIN por correo", sortOrder: 30 },
  { category: "challenge-type", code: "RECOVERY_CODE", displayName: "Código de recuperación", sortOrder: 40 },
  // session-status
  { category: "session-status", code: "ISSUED", displayName: "Emitida", sortOrder: 10 },
  { category: "session-status", code: "REVOKED", displayName: "Revocada", sortOrder: 20 },
  { category: "session-status", code: "LOGGED_OUT", displayName: "Cerrada", sortOrder: 30 },
  { category: "session-status", code: "EXPIRED", displayName: "Expirada", sortOrder: 40 },
  // token-type
  { category: "token-type", code: "ACCESS_TOKEN", displayName: "Token de acceso", sortOrder: 10 },
  { category: "token-type", code: "REFRESH_TOKEN", displayName: "Token de renovación", sortOrder: 20 },
  { category: "token-type", code: "ID_TOKEN", displayName: "Token de identidad", sortOrder: 30 },
  // identity-provider-type
  { category: "identity-provider-type", code: "GOOGLE", displayName: "Google", sortOrder: 10 },
  { category: "identity-provider-type", code: "GITHUB", displayName: "GitHub", sortOrder: 20 },
  { category: "identity-provider-type", code: "META", displayName: "Meta (Facebook)", sortOrder: 30 },
  { category: "identity-provider-type", code: "TWITTER", displayName: "Twitter/X", sortOrder: 40 },
  { category: "identity-provider-type", code: "FIREBASE", displayName: "Firebase", sortOrder: 50 },
  { category: "identity-provider-type", code: "WSO2", displayName: "WSO2 Identity Server", sortOrder: 60 },
  // protocol-family
  { category: "protocol-family", code: "OAUTH", displayName: "OAuth", sortOrder: 10 },
  { category: "protocol-family", code: "OIDC", displayName: "OpenID Connect", sortOrder: 20 },
  { category: "protocol-family", code: "SAML", displayName: "SAML", sortOrder: 30 },
  // protocol-version
  { category: "protocol-version", code: "OAUTH_1_0", displayName: "OAuth 1.0", sortOrder: 10 },
  { category: "protocol-version", code: "OAUTH_2_0", displayName: "OAuth 2.0", sortOrder: 20 },
  { category: "protocol-version", code: "OIDC_1_0", displayName: "OIDC 1.0", sortOrder: 30 },
  { category: "protocol-version", code: "SAML_1_1", displayName: "SAML 1.1", sortOrder: 40 },
  { category: "protocol-version", code: "SAML_2_0", displayName: "SAML 2.0", sortOrder: 50 },
  // role-code
  { category: "role-code", code: "USER", displayName: "Usuario", sortOrder: 10 },
  { category: "role-code", code: "MERCHANT", displayName: "Comercio", sortOrder: 20 },
  { category: "role-code", code: "ADMIN", displayName: "Administrador", sortOrder: 30 },
  { category: "role-code", code: "SALES_MANAGER", displayName: "Gestor de ventas", sortOrder: 40 },
  // permission-effect
  { category: "permission-effect", code: "ALLOW", displayName: "Permitir", sortOrder: 10 },
  { category: "permission-effect", code: "DENY", displayName: "Denegar", sortOrder: 20 },
  // approval-status
  { category: "approval-status", code: "PENDING", displayName: "Pendiente", sortOrder: 10 },
  { category: "approval-status", code: "APPROVED", displayName: "Aprobado", sortOrder: 20 },
  { category: "approval-status", code: "REJECTED", displayName: "Rechazado", sortOrder: 30 },
];

@Injectable()
export class SecurityMasterDataSeedService implements OnModuleInit {
  private readonly logger = new Logger(SecurityMasterDataSeedService.name);

  constructor(
    @InjectRepository(SecurityMasterData)
    private readonly repository: Repository<SecurityMasterData>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.MASTER_DATA_SEED_ENABLED === "false") {
      this.logger.log("Seed de security-master-data deshabilitado por configuración.");
      return;
    }

    try {
      let inserted = 0;
      const now = new Date();
      for (const row of SEED_ROWS) {
        const existing = await this.repository.findOne({ where: { code: row.code } });
        if (existing) continue;

        const entity = this.repository.create({
          name: `${row.category}:${row.code}`,
          description: row.displayName,
          createdBy: "master-data-seed",
          isActive: true,
          category: row.category,
          code: row.code,
          displayName: row.displayName,
          sortOrder: row.sortOrder,
          metadata: { seeded: true },
          creationDate: now,
          modificationDate: now,
        } as Partial<SecurityMasterData>);
        (entity as any).type = "securitymasterdata";
        if (!(entity as any).id) {
          (entity as any).id = randomUUID();
        }
        await this.repository.save(entity);
        inserted++;
      }

      if (inserted > 0) {
        this.logger.log(`Master-data seed aplicado: ${inserted} catálogos creados.`);
      } else {
        this.logger.log(`Master-data seed: todos los catálogos ya existen (${SEED_ROWS.length}).`);
      }
    } catch (error) {
      this.logger.error(
        `Error aplicando seed de master-data: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
