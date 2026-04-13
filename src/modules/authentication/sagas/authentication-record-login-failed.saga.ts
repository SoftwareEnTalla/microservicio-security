import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  LoginFailedEvent,
} from '../events/exporting.event';
import {
  SagaAuthenticationFailedEvent
} from '../events/authentication-failed.event';
import {
  CreateAuthenticationCommand,
} from '../commands/exporting.command';

@Injectable()
export class AuthenticationRecordLoginFailedSaga {
  private readonly logger = new Logger(AuthenticationRecordLoginFailedSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Registra en authentication cada login fallido, incluso si aún no pudo resolverse un usuario interno, para conservar rastro funcional del intento.

  @Saga()
  onLoginFailed = ($events: Observable<LoginFailedEvent>) => {
    return $events.pipe(
      ofType(LoginFailedEvent),
      tap(event => {
        this.logger.log(`Saga authentication-record-login-failed recibió LoginFailed: ${event.aggregateId}`);
        void this.handleLoginFailed(event);
      }),
      map(() => null)
    );
  };

  private async handleLoginFailed(event: LoginFailedEvent): Promise<void> {
    const correlationId = this.resolveCorrelationId(event);
    try {
      await this.executeDispatch1(event, correlationId);
    } catch (error: any) {
      await this.runCompensations(event, correlationId, error);
      this.handleSagaError(error, event);
    }
  }

  private resolveCorrelationId(event: any): string {
    const correlationCandidate = this.resolveValue(event, 'aggregateId');
    if (correlationCandidate !== undefined && correlationCandidate !== null && String(correlationCandidate).trim() !== '') {
      return String(correlationCandidate);
    }
    return String(event?.payload?.metadata?.correlationId ?? event?.aggregateId ?? 'unknown-correlation');
  }

  private buildCommandMetadata(event: any, correlationId: string) {
    const sourceMetadata = event?.payload?.metadata ?? {};
    return {
      ...sourceMetadata,
      correlationId,
      causationId: sourceMetadata?.eventId ?? sourceMetadata?.correlationId ?? event?.aggregateId,
      saga: 'authentication-record-login-failed',
    };
  }

  private resolveEventInstance(event: any): any {
    return event?.payload?.instance ?? {};
  }

  private resolveValue(event: any, path: string): any {
    const normalizedPath = String(path || '').replace(/^event\./, '');
    if (!normalizedPath) {
      return undefined;
    }
    if (normalizedPath === '$now') {
      return new Date().toISOString();
    }
    return normalizedPath.split('.').reduce((acc: any, segment: string) => (acc === undefined || acc === null ? undefined : acc[segment]), event);
  }

  private async runCompensations(event: any, correlationId: string, error: Error): Promise<void> {
    this.logger.warn(`Ejecutando compensaciones de saga para ${correlationId}: ${error.message}`);
  }

  private async executeDispatch1(event: any, correlationId: string): Promise<void> {
    const metadata = this.buildCommandMetadata(event, correlationId);
    const payload = {
      name: this.resolveValue(event, 'payload.instance.name'),
      description: this.resolveValue(event, 'payload.instance.description'),
      createdBy: this.resolveValue(event, 'payload.instance.createdBy'),
      isActive: this.resolveValue(event, 'payload.instance.isActive'),
      userId: this.resolveValue(event, 'payload.instance.userId'),
      loginIdentifier: this.resolveValue(event, 'payload.instance.loginIdentifier'),
      authMethod: this.resolveValue(event, 'payload.instance.authMethod'),
      failureReason: this.resolveValue(event, 'payload.instance.failureReason'),
      ipAddress: this.resolveValue(event, 'payload.instance.ipAddress'),
      deviceFingerprint: this.resolveValue(event, 'payload.instance.deviceFingerprint'),
      userAgent: this.resolveValue(event, 'payload.instance.userAgent'),
      occurredAt: this.resolveValue(event, 'payload.instance.occurredAt'),
      metadata: this.resolveValue(event, 'payload.instance.metadata'),
      authStatus: 'FAILED',
    };
    this.logger.log(`Ejecutando dispatch CreateAuthenticationCommand para la saga executeDispatch1: ${correlationId}`);
    await this.commandBus.execute(new CreateAuthenticationCommand(payload, metadata));
  }

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga cross-context: ${error.message}`);
    this.eventBus.publish(new SagaAuthenticationFailedEvent(error, event));
  }
}

