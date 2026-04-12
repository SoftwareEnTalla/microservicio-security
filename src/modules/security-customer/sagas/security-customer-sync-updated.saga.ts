import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  CustomerUpdatedEvent,
} from '../events/exporting.event';
import {
  SagaSecurityCustomerFailedEvent
} from '../events/securitycustomer-failed.event';
import {
  UpdateSecurityCustomerCommand,
} from '../commands/exporting.command';

@Injectable()
export class SecurityCustomerSyncUpdatedSaga {
  private readonly logger = new Logger(SecurityCustomerSyncUpdatedSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Replica actualizaciones relevantes del agregado customer hacia security-customer usando el mismo identificador correlacionado.

  @Saga()
  onCustomerUpdated = ($events: Observable<CustomerUpdatedEvent>) => {
    return $events.pipe(
      ofType(CustomerUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga security-customer-sync-updated recibió CustomerUpdated: ${event.aggregateId}`);
        void this.handleCustomerUpdated(event);
      }),
      map(() => null)
    );
  };

  private async handleCustomerUpdated(event: CustomerUpdatedEvent): Promise<void> {
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
      saga: 'security-customer-sync-updated',
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
    this.logger.log(`Ejecutando dispatch UpdateSecurityCustomerCommand para la saga executeDispatch1: ${correlationId}`);
    await this.commandBus.execute(new UpdateSecurityCustomerCommand(payload, metadata));
  }

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga cross-context: ${error.message}`);
    this.eventBus.publish(new SagaSecurityCustomerFailedEvent(error, event));
  }
}

