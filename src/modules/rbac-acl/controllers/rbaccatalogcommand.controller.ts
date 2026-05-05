import { Body, Controller, Delete, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginAuthGuard } from '../../login/guards/loginauthguard.guard';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { RoleCommandService } from '../services/role-command.service';
import { PermissionCommandService } from '../services/permission-command.service';
import { RbacAssignmentService } from '../services/rbac-assignment.service';

interface RolePermissionPayload {
  roleId: string;
  permissionId: string;
}

interface UserRoleAssignmentPayload {
  userId: string;
  roleId: string;
}

@Controller()
@UseGuards(LoginAuthGuard)
export class RbacCatalogCommandController {
  constructor(
    private readonly roleCommandService: RoleCommandService,
    private readonly permissionCommandService: PermissionCommandService,
    private readonly rbacAssignmentService: RbacAssignmentService,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRoleAssignmentRepository: Repository<UserRoleAssignment>,
  ) {}

  @Post('roles/command')
  createRole(@Body() payload: Partial<Role>, @Req() request: Record<string, any>): Promise<Role> {
    return this.roleCommandService.createRole(payload, this.resolveActor(request));
  }

  @Put('roles/command/:id')
  updateRole(@Param('id') id: string, @Body() payload: Partial<Role>, @Req() request: Record<string, any>): Promise<Role> {
    return this.roleCommandService.updateRole(id, payload, this.resolveActor(request));
  }

  @Delete('roles/command/:id')
  async deleteRole(@Param('id') id: string, @Req() request: Record<string, any>): Promise<{ ok: true }> {
    await this.roleCommandService.deleteRole(id, this.resolveActor(request));
    return { ok: true };
  }

  @Post('permissions/command')
  createPermission(@Body() payload: Partial<Permission>, @Req() request: Record<string, any>): Promise<Permission> {
    return this.permissionCommandService.createPermission(payload, this.resolveActor(request));
  }

  @Put('permissions/command/:id')
  updatePermission(@Param('id') id: string, @Body() payload: Partial<Permission>, @Req() request: Record<string, any>): Promise<Permission> {
    return this.permissionCommandService.updatePermission(id, payload, this.resolveActor(request));
  }

  @Delete('permissions/command/:id')
  async deletePermission(@Param('id') id: string, @Req() request: Record<string, any>): Promise<{ ok: true }> {
    await this.permissionCommandService.deletePermission(id, this.resolveActor(request));
    return { ok: true };
  }

  @Post('rolepermissions/command')
  assignPermissionToRole(@Body() payload: RolePermissionPayload, @Req() request: Record<string, any>): Promise<RolePermission> {
    return this.rbacAssignmentService.assignPermissionToRole(payload.roleId, payload.permissionId, this.resolveActor(request));
  }

  @Delete('rolepermissions/command/:id')
  async removePermissionFromRole(@Param('id') id: string, @Req() request: Record<string, any>): Promise<{ ok: true }> {
    const assignment = await this.rolePermissionRepository.findOne({ where: { id } });
    if (assignment) {
      await this.rbacAssignmentService.removePermissionFromRole(assignment.roleId, assignment.permissionId, this.resolveActor(request));
    }
    return { ok: true };
  }

  @Post('userroleassignments/command')
  assignRoleToUser(@Body() payload: UserRoleAssignmentPayload, @Req() request: Record<string, any>): Promise<UserRoleAssignment> {
    return this.rbacAssignmentService.assignRoleToUser(payload.userId, payload.roleId, this.resolveActor(request));
  }

  @Delete('userroleassignments/command/:id')
  async revokeRoleFromUser(@Param('id') id: string, @Req() request: Record<string, any>): Promise<{ ok: true }> {
    const assignment = await this.userRoleAssignmentRepository.findOne({ where: { id } });
    if (assignment) {
      await this.rbacAssignmentService.revokeRoleFromUser(assignment.userId, assignment.roleId, this.resolveActor(request));
    }
    return { ok: true };
  }

  private resolveActor(request: Record<string, any>): string {
    const explicitActor = request?.headers?.['x-user-id'] || request?.headers?.['x-user-email'];
    if (typeof explicitActor === 'string' && explicitActor.trim()) {
      return explicitActor.trim();
    }

    return 'rbac-ui';
  }
}