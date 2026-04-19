/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 *
 * Workflow de aprobación/rechazo de merchants.
 * Cumple con la historia H-009: un merchant puede existir autenticado
 * pero sin privilegios de cobro hasta que su solicitud sea aprobada.
 */

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SecurityMerchant } from "../entities/security-merchant.entity";

export interface MerchantApprovalResult {
  ok: boolean;
  message: string;
  data: SecurityMerchant;
}

@Injectable()
export class MerchantApprovalService {
  constructor(
    @InjectRepository(SecurityMerchant)
    private readonly merchantRepository: Repository<SecurityMerchant>,
  ) {}

  async requestApproval(id: string): Promise<MerchantApprovalResult> {
    const merchant = await this.findMerchantOrFail(id);
    if ((merchant.approvalStatus || "").toUpperCase() === "APPROVED") {
      throw new BadRequestException("El merchant ya está aprobado.");
    }
    merchant.approvalStatus = "PENDING";
    merchant.approvedAt = undefined;
    merchant.modificationDate = new Date();
    const saved = await this.merchantRepository.save(merchant);
    return { ok: true, message: "Solicitud de aprobación registrada.", data: saved };
  }

  async approve(id: string, approvedBy: string): Promise<MerchantApprovalResult> {
    const merchant = await this.findMerchantOrFail(id);
    if (!merchant.merchantCode) {
      throw new BadRequestException("No se puede aprobar un merchant sin merchantCode.");
    }
    merchant.approvalStatus = "APPROVED";
    merchant.approvedAt = new Date();
    merchant.modificationDate = new Date();
    merchant.metadata = {
      ...(merchant.metadata || {}),
      approvedBy: approvedBy || "admin",
      approvedAt: merchant.approvedAt.toISOString(),
    };
    const saved = await this.merchantRepository.save(merchant);
    return { ok: true, message: "Merchant aprobado y habilitado para cobrar.", data: saved };
  }

  async reject(id: string, reason: string, rejectedBy: string): Promise<MerchantApprovalResult> {
    const merchant = await this.findMerchantOrFail(id);
    if (!reason || !reason.trim()) {
      throw new BadRequestException("Debe indicar la razón del rechazo.");
    }
    merchant.approvalStatus = "REJECTED";
    merchant.approvedAt = undefined;
    merchant.modificationDate = new Date();
    merchant.metadata = {
      ...(merchant.metadata || {}),
      rejectionReason: reason.trim(),
      rejectedBy: rejectedBy || "admin",
      rejectedAt: new Date().toISOString(),
    };
    const saved = await this.merchantRepository.save(merchant);
    return { ok: true, message: "Merchant rechazado.", data: saved };
  }

  private async findMerchantOrFail(id: string): Promise<SecurityMerchant> {
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} no encontrado.`);
    }
    return merchant;
  }
}
