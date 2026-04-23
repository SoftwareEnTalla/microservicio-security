import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { BaseEvent, PayloadEvent } from './base.event';
import { v4 as uuidv4 } from 'uuid';

export class UserRoleRevokedEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<UserRoleAssignment>,
  ) {
    super(aggregateId);
  }

  static create(
    instanceId: string,
    instance: UserRoleAssignment,
    userId: string,
    correlationId?: string,
  ): UserRoleRevokedEvent {
    return new UserRoleRevokedEvent(instanceId, {
      instance,
      metadata: { initiatedBy: userId, correlationId: correlationId || uuidv4() },
    });
  }
}
