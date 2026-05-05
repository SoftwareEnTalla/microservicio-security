import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { RbacAcl } from '../entities/rbac-acl.entity';

interface BootstrapPermissionDefinition {
  permissionCode: string;
  resource: string;
  action: string;
  scope: string;
  effect: 'ALLOW' | 'DENY';
  description: string;
  metadata?: Record<string, unknown>;
}

interface BootstrapRoleDefinition {
  roleCode: string;
  roleName: string;
  description: string;
  metadata?: Record<string, unknown>;
  permissionCodes: string[];
}

const BOOTSTRAP_PERMISSIONS: BootstrapPermissionDefinition[] = [
  {
    permissionCode: 'ERP_ALL',
    resource: '*',
    action: '*',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Acceso total al ERP para administración raíz.',
    metadata: { bootstrap: true, boundedContexts: ['*'], delegable: false },
  },
  {
    permissionCode: 'SECURITY_USERS_MANAGE',
    resource: 'users',
    action: 'manage',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Gestiona usuarios autenticables y su ciclo de vida.',
    metadata: { bootstrap: true, boundedContexts: ['security'], delegable: true },
  },
  {
    permissionCode: 'SECURITY_RBAC_MANAGE',
    resource: 'rbacacls',
    action: 'manage',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Gestiona roles, permisos, asignaciones y ACL materializadas.',
    metadata: { bootstrap: true, boundedContexts: ['security'], delegable: true },
  },
  {
    permissionCode: 'CATALOG_MANAGE',
    resource: 'catalog',
    action: 'manage',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Gestiona catalogos, categorias, items y traducciones.',
    metadata: { bootstrap: true, boundedContexts: ['catalog'], delegable: true },
  },
  {
    permissionCode: 'ORGANIZATION_MANAGE',
    resource: 'organization',
    action: 'manage',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Gestiona organizaciones, estructuras y delegaciones.',
    metadata: { bootstrap: true, boundedContexts: ['organization'], delegable: true },
  },
  {
    permissionCode: 'HRMS_MANAGE',
    resource: 'hrms',
    action: 'manage',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Gestiona cargos, empleados y responsabilidades HRMS.',
    metadata: { bootstrap: true, boundedContexts: ['hrms'], delegable: true },
  },
  {
    permissionCode: 'SECURITY_USERS_READ',
    resource: 'users',
    action: 'read',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Consulta usuarios y su estado operativo.',
    metadata: { bootstrap: true, boundedContexts: ['security'], delegable: true },
  },
  {
    permissionCode: 'CATALOG_READ',
    resource: 'catalog',
    action: 'read',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Consulta catalogos y nomencladores corporativos.',
    metadata: { bootstrap: true, boundedContexts: ['catalog'], delegable: true },
  },
  {
    permissionCode: 'ORGANIZATION_READ',
    resource: 'organization',
    action: 'read',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Consulta organizaciones y unidades asociadas.',
    metadata: { bootstrap: true, boundedContexts: ['organization'], delegable: true },
  },
  {
    permissionCode: 'HRMS_READ',
    resource: 'hrms',
    action: 'read',
    scope: 'all',
    effect: 'ALLOW',
    description: 'Consulta cargos, personas y relaciones HRMS.',
    metadata: { bootstrap: true, boundedContexts: ['hrms'], delegable: true },
  },
];

const BOOTSTRAP_ROLES: BootstrapRoleDefinition[] = [
  {
    roleCode: 'SUPER_ADMIN',
    roleName: 'Super Admin',
    description: 'Rol administrativo raíz con acceso total al ERP y capacidad de delegación global.',
    metadata: { bootstrap: true, scope: 'global', delegable: true, priority: 100 },
    permissionCodes: ['ERP_ALL'],
  },
  {
    roleCode: 'ADMIN',
    roleName: 'Administrator',
    description: 'Rol administrativo operativo para gestionar usuarios, RBAC, catálogo y estructuras base.',
    metadata: { bootstrap: true, scope: 'global', delegable: true, priority: 90 },
    permissionCodes: [
      'SECURITY_USERS_MANAGE',
      'SECURITY_RBAC_MANAGE',
      'CATALOG_MANAGE',
      'ORGANIZATION_READ',
      'HRMS_READ',
    ],
  },
  {
    roleCode: 'ORG_ADMIN',
    roleName: 'Organization Admin',
    description: 'Rol para administrar organizaciones, sus responsables y visibilidad operativa.',
    metadata: { bootstrap: true, scope: 'organization', delegable: true, priority: 70 },
    permissionCodes: ['ORGANIZATION_MANAGE', 'HRMS_READ', 'CATALOG_READ'],
  },
  {
    roleCode: 'HRMS_MANAGER',
    roleName: 'HRMS Manager',
    description: 'Rol para administrar cargos, aprobaciones y responsabilidades del personal.',
    metadata: { bootstrap: true, scope: 'organization', delegable: true, priority: 60 },
    permissionCodes: ['HRMS_MANAGE', 'ORGANIZATION_READ', 'CATALOG_READ'],
  },
  {
    roleCode: 'CATALOG_MANAGER',
    roleName: 'Catalog Manager',
    description: 'Rol para administrar catálogos transversales del ERP.',
    metadata: { bootstrap: true, scope: 'global', delegable: true, priority: 50 },
    permissionCodes: ['CATALOG_MANAGE', 'CATALOG_READ'],
  },
];

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
      const permissions = await this.ensurePermissions();
      const roles = await this.ensureRoles();
      await this.ensureBootstrapRolePermissions(roles, permissions);

      const bootstrapUser = await this.resolveBootstrapUser();
      if (!bootstrapUser) {
        this.logger.log('RBAC bootstrap parcial completado: catálogo mínimo de roles y permisos cargado sin usuario bootstrap para asignar.');
        return;
      }

      const superAdminRole = roles.get('SUPER_ADMIN');
      if (!superAdminRole) {
        throw new Error('No se pudo materializar el rol SUPER_ADMIN durante el bootstrap RBAC.');
      }

      await this.ensureUserRoleAssignment(bootstrapUser.id, superAdminRole.id);
      await this.materializeAclRows();
      await this.syncUserAclMetadata();

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

  private async ensureRoles(): Promise<Map<string, Role>> {
    const roles = new Map<string, Role>();

    for (const definition of BOOTSTRAP_ROLES) {
      let role = await this.roleRepository.findOne({ where: { roleCode: definition.roleCode } });
      if (role) {
        role.roleName = definition.roleName;
        role.description = definition.description;
        role.isActive = true;
        role.metadata = definition.metadata;
      } else {
        role = this.roleRepository.create({
          roleCode: definition.roleCode,
          roleName: definition.roleName,
          description: definition.description,
          isActive: true,
          metadata: definition.metadata,
        });
      }

      roles.set(definition.roleCode, await this.roleRepository.save(role));
    }

    return roles;
  }

  private async ensurePermissions(): Promise<Map<string, Permission>> {
    const permissions = new Map<string, Permission>();

    for (const definition of BOOTSTRAP_PERMISSIONS) {
      let permission = await this.permissionRepository.findOne({ where: { permissionCode: definition.permissionCode } });
      if (permission) {
        permission.resource = definition.resource;
        permission.action = definition.action;
        permission.scope = definition.scope;
        permission.effect = definition.effect;
        permission.description = definition.description;
        permission.isActive = true;
        permission.metadata = definition.metadata;
      } else {
        permission = this.permissionRepository.create({
          permissionCode: definition.permissionCode,
          resource: definition.resource,
          action: definition.action,
          scope: definition.scope,
          effect: definition.effect,
          description: definition.description,
          isActive: true,
          metadata: definition.metadata,
        });
      }

      permissions.set(definition.permissionCode, await this.permissionRepository.save(permission));
    }

    return permissions;
  }

  private async ensureBootstrapRolePermissions(
    roles: Map<string, Role>,
    permissions: Map<string, Permission>,
  ): Promise<void> {
    for (const roleDefinition of BOOTSTRAP_ROLES) {
      const role = roles.get(roleDefinition.roleCode);
      if (!role) {
        continue;
      }

      for (const permissionCode of roleDefinition.permissionCodes) {
        const permission = permissions.get(permissionCode);
        if (!permission) {
          continue;
        }

        await this.ensureRolePermission(role.id, permission.id);
      }
    }
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

  private async syncUserAclMetadata(): Promise<void> {
    const assignments = await this.userRoleAssignmentRepository.find({
      where: { isActive: true },
      relations: ['role'],
      order: { assignedAt: 'ASC' },
    });

    const groupedAssignments = new Map<string, UserRoleAssignment[]>();
    assignments.forEach((assignment) => {
      const current = groupedAssignments.get(assignment.userId) || [];
      current.push(assignment);
      groupedAssignments.set(assignment.userId, current);
    });

    for (const [userId, userAssignments] of groupedAssignments.entries()) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        continue;
      }

      const activeRoles = userAssignments
        .map((assignment) => assignment.role)
        .filter((role): role is Role => !!role && role.isActive);

      if (!activeRoles.length) {
        continue;
      }

      const primaryRole = [...activeRoles].sort((left, right) => {
        const leftPriority = Number(left.metadata?.priority || 0);
        const rightPriority = Number(right.metadata?.priority || 0);
        return rightPriority - leftPriority;
      })[0];

      const permissions = await this.rolePermissionRepository.find({
        where: activeRoles.map((role) => ({ roleId: role.id })),
        relations: ['permission'],
      });

      const permissionCodes = Array.from(new Set(
        permissions
          .map((rolePermission) => rolePermission.permission)
          .filter((permission): permission is Permission => !!permission && permission.isActive)
          .map((permission) => permission.permissionCode)
      ));

      const metadata = user.metadata && typeof user.metadata === 'object' ? { ...user.metadata } : {};
      metadata.acls = {
        role: primaryRole.roleCode,
        roles: Array.from(new Set(activeRoles.map((role) => role.roleCode))),
        permissions: permissionCodes.includes('ERP_ALL') ? ['*'] : permissionCodes,
      };

      user.metadata = metadata;
      await this.userRepository.save(user);
    }
  }
}