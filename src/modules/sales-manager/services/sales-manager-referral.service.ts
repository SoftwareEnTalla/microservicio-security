/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 *
 * Servicio para resolver el árbol jerárquico de referidos de sales-managers.
 * Usa `user.referralId` para descubrir la cadena ancestor y `SalesManager`
 * para enriquecer cada nodo con metadata comercial.
 */

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SalesManager } from "../entities/sales-manager.entity";
import { User } from "../../user/entities/user.entity";

export interface ReferralTreeNode {
  userId: string;
  username: string;
  email: string;
  salesManagerId?: string;
  managerCode?: string;
  approvalStatus?: string;
  depth: number;
  referrals: ReferralTreeNode[];
}

@Injectable()
export class SalesManagerReferralService {
  constructor(
    @InjectRepository(SalesManager)
    private readonly salesManagerRepository: Repository<SalesManager>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async buildReferralTree(rootUserId: string, maxDepth = 5): Promise<ReferralTreeNode> {
    const rootUser = await this.userRepository.findOne({ where: { id: rootUserId } });
    if (!rootUser) {
      throw new NotFoundException(`Usuario ${rootUserId} no encontrado.`);
    }
    return this.buildNode(rootUser, 0, maxDepth);
  }

  async listAncestors(userId: string, maxDepth = 10): Promise<ReferralTreeNode[]> {
    const chain: ReferralTreeNode[] = [];
    let cursor = await this.userRepository.findOne({ where: { id: userId } });
    let depth = 0;
    while (cursor && cursor.referralId && depth < maxDepth) {
      const parent = await this.userRepository.findOne({ where: { id: cursor.referralId } });
      if (!parent) break;
      const sm = await this.salesManagerRepository.findOne({ where: { userId: parent.id } });
      chain.push({
        userId: parent.id,
        username: parent.username || "",
        email: parent.email,
        salesManagerId: sm?.id,
        managerCode: sm?.managerCode,
        approvalStatus: sm?.approvalStatus,
        depth: depth + 1,
        referrals: [],
      });
      cursor = parent;
      depth++;
    }
    return chain;
  }

  private async buildNode(user: User, depth: number, maxDepth: number): Promise<ReferralTreeNode> {
    const sm = await this.salesManagerRepository.findOne({ where: { userId: user.id } });
    const node: ReferralTreeNode = {
      userId: user.id,
      username: user.username || "",
      email: user.email,
      salesManagerId: sm?.id,
      managerCode: sm?.managerCode,
      approvalStatus: sm?.approvalStatus,
      depth,
      referrals: [],
    };

    if (depth >= maxDepth) return node;

    const children = await this.userRepository.find({ where: { referralId: user.id } });
    for (const child of children) {
      node.referrals.push(await this.buildNode(child, depth + 1, maxDepth));
    }
    return node;
  }
}
