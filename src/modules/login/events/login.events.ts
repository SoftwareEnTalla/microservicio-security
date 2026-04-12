export interface LoginAuditPayload {
  occurredAt: Date;
  userId?: string;
  loginIdentifier: string;
  authMethod: string;
  authStatus: string;
  failureReason?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  authenticatedUserAcls?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class LoginCompletedEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: LoginAuditPayload,
  ) {}
}
