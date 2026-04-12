import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  CustomerCreatedEvent,
} from '../events/exporting.event';
import {
  SagaSecurityCustomerFailedEvent
} from '../events/securitycustomer-failed.event';
import {
  CreateSecurityCustomerCommand,
} from '../commands/exporting.command';

@Injectable()
export class SecurityCustomerSyncCreatedSaga {
  private readonly logger = new Logger(SecurityCustomerSyncCreatedSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Replica la creación del agregado customer dentro del contexto security para mantener una proyección especializada sin acoplar ORM entre microservicios.

  @Saga()
  onCustomerCreated = ($events: Observable<CustomerCreatedEvent>) => {
    return $events.pipe(
      ofType(CustomerCreatedEvent),
      tap(event => {
        this.logger.log(`Saga security-customer-sync-created recibió CustomerCreated: ${event.aggregateId}`);
        void this.handleCustomerCreated(event);
      }),
      map(() => null)
    );
  };

  private async handleCustomerCreated(event: CustomerCreatedEvent): Promise<void> {
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
      saga: 'security-customer-sync-created',
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
      id: this.resolveValue(event, 'aggregateId'),
      userId: this.resolveValue(event, 'payload.instance.userId'),
      riskLevel: this.resolveValue(event, 'payload.instance.riskLevel'),
      externalReference: this.resolveValue(event, 'payload.instance.externalReference'),
      paymentMethods: this.resolveValue(event, 'payload.instance.paymentMethods'),
      metadata: this.resolveValue(event, 'payload.instance.metadata'),
    };
    this.logger.log(`Ejecutando dispatch CreateSecurityCustomerCommand para la saga executeDispatch1: ${correlationId}`);
    await this.commandBus.execute(new CreateSecurityCustomerCommand(payload, metadata));
  }

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga cross-context: ${error.message}`);
    this.eventBus.publish(new SagaSecurityCustomerFailedEvent(error, event));
  }
}

