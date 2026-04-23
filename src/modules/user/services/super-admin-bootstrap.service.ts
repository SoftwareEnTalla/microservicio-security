/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 *
 * Bootstrap idempotente del superadministrador del sistema.
 * Se ejecuta al inicializar el módulo; si SA_EMAIL está configurado,
 * garantiza que exista un usuario con rol SUPER_ADMIN sin duplicar registros.
 */

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createHash, randomUUID } from "crypto";
import { User } from "../entities/user.entity";

@Injectable()
export class SuperAdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminBootstrapService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SA_BOOTSTRAP_ENABLED === "false") {
      this.logger.log("SuperAdmin bootstrap deshabilitado por configuración.");
      return;
    }

    const email = (process.env.SA_EMAIL || "").trim().toLowerCase();
    const password = (process.env.SA_PWD || "").trim();

    if (!email || !password) {
      this.logger.log(
        "SuperAdmin bootstrap omitido: SA_EMAIL o SA_PWD no configurados.",
      );
      return;
    }

    try {
      const existing = await this.userRepository.findOne({ where: { email } });
      const passwordHash = createHash("sha256").update(password).digest("hex");
      const now = new Date();

      if (existing) {
        // Idempotente: actualizar SOLO campos operativos mínimos
        // (nunca degradar isActive ni cambiar identifierValue).
        const updates: Partial<User> = {};
        if (!existing.isActive) {
          updates.isActive = true;
        }
        if ((existing.accountStatus || "").toUpperCase() !== "ACTIVE") {
          updates.accountStatus = "ACTIVE";
        }
        if ((existing.userType || "").toUpperCase() !== "ADMIN") {
          updates.userType = "ADMIN";
        }
        // Solo refrescar passwordHash si la env explícitamente lo indica
        if (process.env.SA_PWD_FORCE_UPDATE === "true") {
          updates.passwordHash = passwordHash;
          updates.passwordChangedAt = now;
        }
        if (Object.keys(updates).length > 0) {
          await this.userRepository.update(existing.id, updates);
          this.logger.log(
            `SuperAdmin actualizado (id=${existing.id}): ${Object.keys(updates).join(", ")}`,
          );
        } else {
          this.logger.log(`SuperAdmin ya existente y vigente (id=${existing.id}).`);
        }
        return;
      }

      // Crear SuperAdmin nuevo
      const username = (process.env.SA_USERNAME || email.split("@")[0] || "superadmin").trim();
      const phone = (process.env.SA_PHONE || "00000000000").trim();
      const identifierType = (process.env.USER_IDENTIFIER_TYPE || "EMAIL").trim().toUpperCase();
      const identifierValue =
        identifierType === "USERNAME"
          ? username
          : identifierType === "PHONE"
          ? phone
          : email;

      const entity = this.userRepository.create({
        name: "Super Administrator",
        description: "Usuario raíz del sistema creado por bootstrap idempotente.",
        createdBy: "sa-bootstrap",
        isActive: true,
        code: randomUUID(),
        username,
        email,
        phone,
        passwordHash,
        referralId: "",
        identifierType,
        identifierValue,
        accountStatus: "ACTIVE",
        userType: "ADMIN",
        termsAccepted: true,
        termsAcceptedAt: now,
        lastLoginAt: undefined,
        passwordChangedAt: now,
        mfaEnabled: false,
        totpEnabled: false,
        federatedOnly: false,
        metadata: { bootstrap: true, role: "SUPER_ADMIN" },
        creationDate: now,
        modificationDate: now,
      } as Partial<User>);

      // Asegurar discriminator de ChildEntity
      (entity as any).type = "user";

      await this.userRepository.save(entity);
      this.logger.log(`SuperAdmin creado correctamente (email=${email}).`);
      this.logger.log("super-admin-bootstrapped");
    } catch (error) {
      this.logger.error(
        `Error en bootstrap de SuperAdmin: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
