import { Role } from '../entities/role.entity';
import { BaseEvent, PayloadEvent } from './base.event';
import { v4 as uuidv4 } from 'uuid';

export class RoleCreatedEvent extends BaseEvent {
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
    correlationId: string = uuidv4(),
  ): RoleCreatedEvent {
    return new RoleCreatedEvent(instanceId, {
      instance,
      metadata: { initiatedBy: userId, correlationId: correlationId || uuidv4() },
    });
  }
}
