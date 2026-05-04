import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { RbacAcl } from '../entities/rbac-acl.entity';

@Injectable()
export class RbacBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacBootstrapService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRoleAssignmentRepository: Repository<UserRoleAssignment>,
    @InjectRepository(RbacAcl)
    private readonly rbacAclRepository: Repository<RbacAcl>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.RBAC_BOOTSTRAP_ENABLED === 'false') {
      this.logger.log('RBAC bootstrap deshabilitado por configuración.');
      return;
    }

    try {
      const bootstrapUser = await this.resolveBootstrapUser();
      if (!bootstrapUser) {
        this.logger.log('RBAC bootstrap omitido: no existe usuario administrador bootstrap.');
        return;
      }

      const role = await this.ensureRole();
      const permission = await this.ensurePermission();
      await this.ensureRolePermission(role.id, permission.id);
      await this.ensureUserRoleAssignment(bootstrapUser.id, role.id);
      await this.materializeAclRows();

      this.logger.log(`RBAC bootstrap completado para userId=${bootstrapUser.id}.`);
    } catch (error) {
      this.logger.error(`Error en RBAC bootstrap: ${(error as Error).message}`, (error as Error).stack);
    }
  }

  private async resolveBootstrapUser(): Promise<User | null> {
    const email = (process.env.SA_EMAIL || '').trim().toLowerCase();
    if (email) {
      const superAdmin = await this.userRepository.findOne({ where: { email } });
      if (superAdmin) {
        return superAdmin;
      }
    }

    return this.userRepository.findOne({
      where: { userType: 'ADMIN', isActive: true },
      order: { creationDate: 'ASC' },
    });
  }

  private async ensureRole(): Promise<Role> {
    let role = await this.roleRepository.findOne({ where: { roleCode: 'SUPER_ADMIN' } });
    if (role) {
      if (!role.isActive || role.roleName !== 'Super Admin' || role.description !== 'Rol administrativo raíz con acceso total al ERP.') {
        role.isActive = true;
        role.roleName = 'Super Admin';
        role.description = 'Rol administrativo raíz con acceso total al ERP.';
        role.metadata = { bootstrap: true, scope: 'global' };
        role = await this.roleRepository.save(role);
      }
      return role;
    }

    role = this.roleRepository.create({
      roleCode: 'SUPER_ADMIN',
      roleName: 'Super Admin',
      description: 'Rol administrativo raíz con acceso total al ERP.',
      isActive: true,
      metadata: { bootstrap: true, scope: 'global' },
    });

    return this.roleRepository.save(role);
  }

  private async ensurePermission(): Promise<Permission> {
    let permission = await this.permissionRepository.findOne({ where: { permissionCode: 'SECURITY_ALL' } });
    if (permission) {
      permission.resource = '*';
      permission.action = '*';
      permission.scope = 'all';
      permission.effect = 'ALLOW';
      permission.description = 'Permiso bootstrap para acceso total inicial del super administrador.';
      permission.isActive = true;
      permission.metadata = { bootstrap: true, boundedContext: 'security' };
      return this.permissionRepository.save(permission);
    }

    permission = this.permissionRepository.create({
      permissionCode: 'SECURITY_ALL',
      resource: '*',
      action: '*',
      scope: 'all',
      effect: 'ALLOW',
      description: 'Permiso bootstrap para acceso total inicial del super administrador.',
      isActive: true,
      metadata: { bootstrap: true, boundedContext: 'security' },
    });

    return this.permissionRepository.save(permission);
  }

  private async ensureRolePermission(roleId: string, permissionId: string): Promise<RolePermission> {
    const existing = await this.rolePermissionRepository.findOne({ where: { roleId, permissionId } });
    if (existing) {
      return existing;
    }

    return this.rolePermissionRepository.save(
      this.rolePermissionRepository.create({
        roleId,
        permissionId,
        assignedBy: 'rbac-bootstrap',
      })
    );
  }

  private async ensureUserRoleAssignment(userId: string, roleId: string): Promise<UserRoleAssignment> {
    const existing = await this.userRoleAssignmentRepository.findOne({ where: { userId, roleId } });
    if (existing) {
      existing.isActive = true;
      existing.revokedAt = null as unknown as undefined;
      existing.assignedBy = 'rbac-bootstrap';
      return this.userRoleAssignmentRepository.save(existing);
    }

    return this.userRoleAssignmentRepository.save(
      this.userRoleAssignmentRepository.create({
        userId,
        roleId,
        assignedBy: 'rbac-bootstrap',
        isActive: true,
      })
    );
  }

  private async materializeAclRows(): Promise<void> {
    const assignments = await this.userRoleAssignmentRepository.find({
      where: { isActive: true },
      relations: ['role'],
      order: { assignedAt: 'ASC' },
    });

    for (const assignment of assignments) {
      if (!assignment.role?.isActive) {
        continue;
      }

      const rolePermissions = await this.rolePermissionRepository.find({
        where: { roleId: assignment.roleId },
        relations: ['permission'],
      });

      for (const rolePermission of rolePermissions) {
        if (!rolePermission.permission?.isActive) {
          continue;
        }

        const permission = rolePermission.permission;
        const role = assignment.role;
        const existing = await this.rbacAclRepository.findOne({
          where: {
            userId: assignment.userId,
            roleCode: role.roleCode,
            permissionCode: permission.permissionCode,
            resource: permission.resource,
            action: permission.action,
            effect: permission.effect,
          },
        });

        const entity = existing || this.rbacAclRepository.create();
        Object.assign(entity, {
          name: `${role.roleCode}:${permission.permissionCode}`,
          description: `${role.roleName} -> ${permission.permissionCode}`,
          createdBy: 'rbac-bootstrap',
          isActive: true,
          roleCode: role.roleCode,
          roleName: role.roleName,
          permissionCode: permission.permissionCode,
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope || 'all',
          effect: permission.effect,
          userId: assignment.userId,
          assignedAt: assignment.assignedAt,
          revokedAt: assignment.revokedAt,
          metadata: {
            bootstrap: true,
            roleId: role.id,
            permissionId: permission.id,
            assignmentId: assignment.id,
          },
          type: 'rbacacl',
        });

        await this.rbacAclRepository.save(entity);
      }
    }
  }
}