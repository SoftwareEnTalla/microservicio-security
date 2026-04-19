import { BaseEvent, PayloadEvent } from './base.event';
import { v4 as uuidv4 } from 'uuid';

export interface ResolvedAcl {
  userId: string;
  permissions: Array<{
    permissionCode: string;
    resource: string;
    action: string;
    scope: string;
    effect: string;
  }>;
  roles: string[];
  resolvedAt: Date;
}

export class AuthenticatedUserAclResolvedEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<ResolvedAcl>,
  ) {
    super(aggregateId);
  }

  static create(
    userId: string,
    instance: ResolvedAcl,
    initiatedBy: string,
    correlationId?: string,
  ): AuthenticatedUserAclResolvedEvent {
    return new AuthenticatedUserAclResolvedEvent(userId, {
      instance,
      metadata: { initiatedBy, correlationId: correlationId || uuidv4() },
    });
  }
}
