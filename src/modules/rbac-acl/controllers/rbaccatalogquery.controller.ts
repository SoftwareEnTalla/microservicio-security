import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginAuthGuard } from '../../login/guards/loginauthguard.guard';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { User } from '../../user/entities/user.entity';
import { RoleCommandService } from '../services/role-command.service';
import { PermissionCommandService } from '../services/permission-command.service';

@Controller()
@UseGuards(LoginAuthGuard)
export class RbacCatalogQueryController {
  constructor(
    private readonly roleCommandService: RoleCommandService,
    private readonly permissionCommandService: PermissionCommandService,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRoleAssignmentRepository: Repository<UserRoleAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('roles/query/list')
  async listRoles(): Promise<Role[]> {
    return this.roleCommandService.findAll();
  }

  @Get('permissions/query/list')
  async listPermissions(): Promise<Permission[]> {
    return this.permissionCommandService.findAll();
  }

  @Get('rolepermissions/query/list')
  async listRolePermissions(): Promise<Array<Record<string, unknown>>> {
    const records = await this.rolePermissionRepository.find({
      relations: ['role', 'permission'],
      order: { assignedAt: 'DESC' },
    });

    return records.map((record) => ({
      id: record.id,
      roleId: record.roleId,
      roleCode: record.role?.roleCode || null,
      roleName: record.role?.roleName || null,
      permissionId: record.permissionId,
      permissionCode: record.permission?.permissionCode || null,
      resource: record.permission?.resource || null,
      action: record.permission?.action || null,
      scope: record.permission?.scope || null,
      effect: record.permission?.effect || null,
      assignedBy: record.assignedBy || null,
      assignedAt: record.assignedAt,
      metadata: {
        role: record.role || null,
        permission: record.permission || null,
      },
    }));
  }

  @Get('userroleassignments/query/list')
  async listUserRoleAssignments(): Promise<Array<Record<string, unknown>>> {
    const records = await this.userRoleAssignmentRepository.find({
      relations: ['role'],
      order: { assignedAt: 'DESC' },
    });

    const userIds = Array.from(new Set(records.map((record) => record.userId)));
    const users = userIds.length
      ? await this.userRepository.find({ where: userIds.map((id) => ({ id })) })
      : [];
    const userMap = new Map(users.map((user) => [user.id, user]));

    return records.map((record) => {
      const user = userMap.get(record.userId);
      return {
        id: record.id,
        userId: record.userId,
        username: user?.username || null,
        email: user?.email || null,
        userType: user?.userType || null,
        roleId: record.roleId,
        roleCode: record.role?.roleCode || null,
        roleName: record.role?.roleName || null,
        assignedBy: record.assignedBy || null,
        assignedAt: record.assignedAt,
        revokedAt: record.revokedAt || null,
        isActive: record.isActive,
        metadata: {
          role: record.role || null,
          user: user || null,
        },
      };
    });
  }
}