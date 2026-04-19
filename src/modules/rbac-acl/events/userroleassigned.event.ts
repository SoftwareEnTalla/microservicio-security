import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { BaseEvent, PayloadEvent } from './base.event';
import { v4 as uuidv4 } from 'uuid';

export class UserRoleAssignedEvent extends BaseEvent {
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
  ): UserRoleAssignedEvent {
    return new UserRoleAssignedEvent(instanceId, {
      instance,
      metadata: { initiatedBy: userId, correlationId: correlationId || uuidv4() },
    });
  }
}
