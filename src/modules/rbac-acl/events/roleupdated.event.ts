import { Role } from '../entities/role.entity';
import { BaseEvent, PayloadEvent } from './base.event';
import { v4 as uuidv4 } from 'uuid';

export class RoleUpdatedEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<Role>,
  ) {
    super(aggregateId);
  }

  static create(
    instanceId: string,
    instance: Role,
    userId: string,
    correlationId?: string,
  ): RoleUpdatedEvent {
    return new RoleUpdatedEvent(instanceId, {
      instance,
      metadata: { initiatedBy: userId, correlationId: correlationId || uuidv4() },
    });
  }
}
