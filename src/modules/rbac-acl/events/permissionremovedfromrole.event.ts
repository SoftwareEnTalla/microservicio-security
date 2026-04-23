import { RolePermission } from '../entities/role-permission.entity';
import { BaseEvent, PayloadEvent } from './base.event';
import { v4 as uuidv4 } from 'uuid';

export class PermissionRemovedFromRoleEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<RolePermission>,
  ) {
    super(aggregateId);
  }

  static create(
    instanceId: string,
    instance: RolePermission,
    userId: string,
    correlationId?: string,
  ): PermissionRemovedFromRoleEvent {
    return new PermissionRemovedFromRoleEvent(instanceId, {
      instance,
      metadata: { initiatedBy: userId, correlationId: correlationId || uuidv4() },
    });
  }
}
