import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  LoginSucceededEvent,
} from '../events/exporting.event';
import {
  SagaAuthenticationFailedEvent
} from '../events/authentication-failed.event';
import {
  CreateAuthenticationCommand,
} from '../commands/exporting.command';

@Injectable()
export class AuthenticationRecordLoginSucceededSaga {
  private readonly logger = new Logger(AuthenticationRecordLoginSucceededSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Registra en authentication cada login local o federado que termina exitosamente para que exista trazabilidad funcional desacoplada del módulo login.

  @Saga()
  onLoginSucceeded = ($events: Observable<LoginSucceededEvent>) => {
    return $events.pipe(
      ofType(LoginSucceededEvent),
      tap(event => {
        this.logger.log(`Saga authentication-record-login-succeeded recibió LoginSucceeded: ${event.aggregateId}`);
        void this.handleLoginSucceeded(event);
      }),
      map(() => null)
    );
  };

  private async handleLoginSucceeded(event: LoginSucceededEvent): Promise<void> {
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
      saga: 'authentication-record-login-succeeded',
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
      userId: this.resolveValue(event, 'payload.instance.userId'),
      loginIdentifier: this.resolveValue(event, 'payload.instance.loginIdentifier'),
      authMethod: this.resolveValue(event, 'payload.instance.authMethod'),
      ipAddress: this.resolveValue(event, 'payload.instance.ipAddress'),
      deviceFingerprint: this.resolveValue(event, 'payload.instance.deviceFingerprint'),
      userAgent: this.resolveValue(event, 'payload.instance.userAgent'),
      authenticatedUserAcls: this.resolveValue(event, 'payload.instance.authenticatedUserAcls'),
      occurredAt: this.resolveValue(event, 'payload.instance.occurredAt'),
      metadata: this.resolveValue(event, 'payload.instance.metadata'),
      authStatus: 'SUCCEEDED',
    };
    this.logger.log(`Ejecutando dispatch CreateAuthenticationCommand para la saga executeDispatch1: ${correlationId}`);
    await this.commandBus.execute(new CreateAuthenticationCommand(payload, metadata));
  }

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga cross-context: ${error.message}`);
    this.eventBus.publish(new SagaAuthenticationFailedEvent(error, event));
  }
}

