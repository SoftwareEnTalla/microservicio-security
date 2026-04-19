import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { PermissionAssignedToRoleEvent } from '../events/permissionassignedtorole.event';
import { PermissionRemovedFromRoleEvent } from '../events/permissionremovedfromrole.event';
import { UserRoleAssignedEvent } from '../events/userroleassigned.event';
import { UserRoleRevokedEvent } from '../events/userrolerevoked.event';
import { logger } from '@core/logs/logger';

@Injectable()
export class RbacAssignmentService {
  private readonly log = new Logger(RbacAssignmentService.name);

  constructor(
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>,
    @InjectRepository(UserRoleAssignment)
    private readonly uraRepo: Repository<UserRoleAssignment>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
  ) {}

  // --- Asignación de permisos a roles ---

  async assignPermissionToRole(roleId: string, permissionId: string, assignedBy: string): Promise<RolePermission> {
    await this.validateRoleExists(roleId);
    await this.validatePermissionExists(permissionId);
    const existing = await this.rpRepo.findOne({ where: { roleId, permissionId } });
    if (existing) {
      throw new ConflictException(`El permiso ya está asignado a este rol.`);
    }
    const rp = this.rpRepo.create({ roleId, permissionId, assignedBy });
    const saved = await this.rpRepo.save(rp);
    const event = PermissionAssignedToRoleEvent.create(saved.id, saved, assignedBy);
    await this.publishEvent(event);
    logger.info('Permiso asignado a rol:', { roleId, permissionId });
    return saved;
  }

  async removePermissionFromRole(roleId: string, permissionId: string, removedBy: string): Promise<void> {
    const rp = await this.rpRepo.findOne({ where: { roleId, permissionId } });
    if (!rp) {
      throw new NotFoundException(`Asignación permiso-rol no encontrada.`);
    }
    await this.rpRepo.remove(rp);
    const event = PermissionRemovedFromRoleEvent.create(rp.id, rp, removedBy);
    await this.publishEvent(event);
    logger.info('Permiso removido del rol:', { roleId, permissionId });
  }

  async getPermissionsByRole(roleId: string): Promise<RolePermission[]> {
    return this.rpRepo.find({ where: { roleId }, relations: ['permission'] });
  }

  // --- Asignación de roles a usuarios ---

  async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<UserRoleAssignment> {
    await this.validateRoleExists(roleId);
    const existing = await this.uraRepo.findOne({ where: { userId, roleId } });
    if (existing && existing.isActive) {
      throw new ConflictException(`El usuario ya tiene este rol asignado.`);
    }
    if (existing && !existing.isActive) {
      existing.isActive = true;
      existing.revokedAt = undefined;
      existing.assignedBy = assignedBy;
      const saved = await this.uraRepo.save(existing);
      const event = UserRoleAssignedEvent.create(saved.id, saved, assignedBy);
      await this.publishEvent(event);
      return saved;
    }
    const ura = this.uraRepo.create({ userId, roleId, assignedBy, isActive: true });
    const saved = await this.uraRepo.save(ura);
    const event = UserRoleAssignedEvent.create(saved.id, saved, assignedBy);
    await this.publishEvent(event);
    logger.info('Rol asignado a usuario:', { userId, roleId });
    return saved;
  }

  async revokeRoleFromUser(userId: string, roleId: string, revokedBy: string): Promise<void> {
    const ura = await this.uraRepo.findOne({ where: { userId, roleId, isActive: true } });
    if (!ura) {
      throw new NotFoundException(`Asignación activa usuario-rol no encontrada.`);
    }
    ura.isActive = false;
    ura.revokedAt = new Date();
    await this.uraRepo.save(ura);
    const event = UserRoleRevokedEvent.create(ura.id, ura, revokedBy);
    await this.publishEvent(event);
    logger.info('Rol revocado del usuario:', { userId, roleId });
  }

  async getRolesByUser(userId: string): Promise<UserRoleAssignment[]> {
    return this.uraRepo.find({ where: { userId, isActive: true }, relations: ['role'] });
  }

  async getUsersByRole(roleId: string): Promise<UserRoleAssignment[]> {
    return this.uraRepo.find({ where: { roleId, isActive: true } });
  }

  // --- Helpers ---

  private async validateRoleExists(roleId: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Rol ${roleId} no encontrado.`);
    if (!role.isActive) throw new ConflictException(`Rol '${role.roleCode}' está desactivado.`);
  }

  private async validatePermissionExists(permissionId: string): Promise<void> {
    const perm = await this.permRepo.findOne({ where: { id: permissionId } });
    if (!perm) throw new NotFoundException(`Permiso ${permissionId} no encontrado.`);
    if (!perm.isActive) throw new ConflictException(`Permiso '${perm.permissionCode}' está desactivado.`);
  }

  private async publishEvent(event: any): Promise<void> {
    await this.eventPublisher.publish(event);
    if (process.env.EVENT_STORE_ENABLED === 'true') {
      await this.eventStore.appendEvent('rbac-assignment-' + event.aggregateId, event);
    }
  }
}
