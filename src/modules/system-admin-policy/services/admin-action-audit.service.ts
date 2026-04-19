/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 */

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { SystemAdminPolicy } from "../entities/system-admin-policy.entity";

export interface AdminActionRecord {
  adminUserId: string;
  policyCode: string;
  actionType: string;
  targetType?: string;
  targetId?: string;
  decision: "ALLOWED" | "DENIED" | "AUDITED";
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Servicio de auditoría de acciones administrativas.
 *
 * Centraliza la creación de registros en `system_admin_policy_base_entity`
 * para toda decisión/acción sensible ejecutada por un administrador del
 * sistema (UH-11 System Admin).
 */
@Injectable()
export class AdminActionAuditService {
  private readonly logger = new Logger(AdminActionAuditService.name);

  constructor(
    @InjectRepository(SystemAdminPolicy)
    private readonly repository: Repository<SystemAdminPolicy>,
  ) {}

  async record(entry: AdminActionRecord): Promise<void> {
    try {
      const row = this.repository.create({
        name: `admin-${entry.actionType}-${entry.decision}`.slice(0, 100),
        description: entry.reason || `Acción ${entry.actionType} ${entry.decision}`,
        code: randomUUID(),
        createdBy: "system-admin-guard",
        isActive: true,
        adminUserId: entry.adminUserId,
        policyCode: entry.policyCode,
        actionType: entry.actionType,
        targetType: entry.targetType || "",
        targetId: entry.targetId || "",
        decision: entry.decision,
        reason: entry.reason || "",
        occurredAt: new Date(),
        metadata: entry.metadata || {},
      } as any);
      await this.repository.save(row);
    } catch (err: any) {
      // No bloquear la operación en caso de fallo de auditoría
      this.logger.error(`No se pudo registrar auditoría admin: ${err?.message}`);
    }
  }
}
