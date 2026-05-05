import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { AuthenticatedUserAclResolvedEvent, ResolvedAcl } from '../events/authenticateduseraclresolved.event';
import { logger } from '@core/logs/logger';

@Injectable()
export class AclResolverService {
  private readonly log = new Logger(AclResolverService.name);

  constructor(
    @InjectRepository(UserRoleAssignment)
    private readonly uraRepo: Repository<UserRoleAssignment>,
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
  ) {}

  /**
   * Resuelve los ACLs efectivos de un usuario: unión de todos los permisos
   * de todos los roles activos asignados al usuario.
   */
  async resolveUserAcl(userId: string, initiatedBy?: string): Promise<ResolvedAcl> {
    // 1. Obtener roles activos del usuario
    const assignments = await this.uraRepo.find({
      where: { userId, isActive: true },
      relations: ['role'],
    });
    const activeRoleIds = assignments
      .filter(a => a.role?.isActive)
      .map(a => a.roleId);

    if (activeRoleIds.length === 0) {
      return { userId, permissions: [], roles: [], resolvedAt: new Date() };
    }

    // 2. Obtener todos los permisos de esos roles
    const rolePermissions = await this.rpRepo
      .createQueryBuilder('rp')
      .innerJoinAndSelect('rp.permission', 'p')
      .where('rp.roleId IN (:...roleIds)', { roleIds: activeRoleIds })
      .andWhere('p.isActive = :active', { active: true })
      .getMany();

    // 3. Deduplicar permisos por permissionCode
    const seenCodes = new Set<string>();
    const permissions: ResolvedAcl['permissions'] = [];
    for (const rp of rolePermissions) {
      if (rp.permission && !seenCodes.has(rp.permission.permissionCode)) {
        seenCodes.add(rp.permission.permissionCode);
        permissions.push({
          permissionCode: rp.permission.permissionCode,
          resource: rp.permission.resource,
          action: rp.permission.action,
          scope: rp.permission.scope ?? 'all',
          effect: rp.permission.effect,
        });
      }
    }

    // 4. Obtener nombres de roles
    const roles = assignments
      .filter(a => a.role?.isActive)
      .map(a => a.role!.roleCode);

    const resolved: ResolvedAcl = {
      userId,
      permissions,
      roles,
      resolvedAt: new Date(),
    };

    await this.syncResolvedAclToUserMetadata(userId, resolved);

    // 5. Publicar evento de ACL resuelto
    const event = AuthenticatedUserAclResolvedEvent.create(
      userId,
      resolved,
      initiatedBy || 'system',
    );
    await this.publishEvent(event);
    logger.info('ACL resuelto para usuario:', userId);
    return resolved;
  }

  /**
   * Resuelve ACLs para todos los usuarios afectados por un cambio en un rol.
   * Se usa desde la saga cuando un rol o sus permisos cambian.
   */
  async resolveAclForAffectedUsers(roleId: string, initiatedBy: string): Promise<void> {
    const assignments = await this.uraRepo.find({
      where: { roleId, isActive: true },
    });
    for (const assignment of assignments) {
      await this.resolveUserAcl(assignment.userId, initiatedBy);
    }
    logger.info(`ACLs resueltos para ${assignments.length} usuario(s) afectados por cambio en rol ${roleId}`);
  }

  private async publishEvent(event: any): Promise<void> {
    await this.eventPublisher.publish(event);
    if (process.env.EVENT_STORE_ENABLED === 'true') {
      await this.eventStore.appendEvent('acl-resolved-' + event.aggregateId, event);
    }
  }

  private async syncResolvedAclToUserMetadata(userId: string, resolved: ResolvedAcl): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }

    const metadata = user.metadata && typeof user.metadata === 'object' ? { ...user.metadata } : {};
    const primaryRole = resolved.roles[0] || null;
    metadata.acls = {
      role: primaryRole,
      roles: resolved.roles,
      permissions: resolved.permissions.some((permission) => permission.permissionCode === 'ERP_ALL')
        ? ['*']
        : resolved.permissions.map((permission) => permission.permissionCode),
    };

    user.metadata = metadata;
    await this.userRepo.save(user);
  }
}
