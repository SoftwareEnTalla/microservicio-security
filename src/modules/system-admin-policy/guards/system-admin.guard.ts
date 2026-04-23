/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { AdminActionAuditService } from "../services/admin-action-audit.service";

const SYSTEM_ADMIN_UUID = "00000000-0000-0000-0000-000000000001";

/**
 * Guard global para endpoints de User que aplica las restricciones del
 * administrador del sistema (UH-11 System Admin):
 *
 *  - Si el actor se identifica como ADMIN (header `x-actor-role: ADMIN`),
 *    NO puede crear, editar ni eliminar usuarios.
 *  - ÚNICA excepción: puede "desactivar" vía PUT con body `{ isActive: false }`.
 *  - Toda intención (permitida o denegada) queda registrada vía
 *    `AdminActionAuditService` en `system_admin_policy_base_entity`.
 *
 * Cuando el actor no es ADMIN el guard es transparente (permite continuar).
 */
@Injectable()
export class SystemAdminGuard implements CanActivate {
  constructor(private readonly audit: AdminActionAuditService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const actorRole = String(request.headers["x-actor-role"] || "").toUpperCase();
    if (actorRole !== "ADMIN") return true;

    const actorId =
      (request.headers["x-actor-id"] as string) || SYSTEM_ADMIN_UUID;
    const method = request.method.toUpperCase();
    const targetId = (request.params as any)?.id || "";
    const body: any = request.body || {};

    // Regla: admin solo puede desactivar (isActive=false vía PUT)
    const isDeactivation =
      method === "PUT" &&
      Object.prototype.hasOwnProperty.call(body, "isActive") &&
      body.isActive === false;

    const mutates = method === "POST" || method === "PUT" || method === "DELETE";

    if (!mutates) return true;

    if (isDeactivation) {
      await this.audit.record({
        adminUserId: actorId,
        policyCode: "ADMIN_USER_DEACTIVATE",
        actionType: "USER_DEACTIVATE",
        targetType: "user",
        targetId,
        decision: "ALLOWED",
        reason: "Admin desactivó usuario (permitido por política)",
        metadata: { method, path: request.path },
      });
      return true;
    }

    // Denegar cualquier otra mutación sobre users ejecutada por ADMIN
    await this.audit.record({
      adminUserId: actorId,
      policyCode: "ADMIN_USER_MUTATION_FORBIDDEN",
      actionType: `USER_${method}`,
      targetType: "user",
      targetId,
      decision: "DENIED",
      reason:
        "Política: el administrador del sistema no puede crear/editar/eliminar usuarios (solo desactivar)",
      metadata: { method, path: request.path },
    });

    throw new ForbiddenException(
      "Un administrador del sistema no puede crear, editar ni eliminar usuarios por la vía funcional. Solo puede desactivarlos (PUT isActive:false).",
    );
  }
}
