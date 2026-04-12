import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  SalesManagerUpdatedEvent,
} from '../events/exporting.event';
import {
  SagaSalesManagerFailedEvent
} from '../events/salesmanager-failed.event';
import {
  UpdateSalesManagerCommand,
} from '../commands/exporting.command';

@Injectable()
export class SecuritySalesManagerSyncUpdatedSaga {
  private readonly logger = new Logger(SecuritySalesManagerSyncUpdatedSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Replica cambios del agregado salesmanager para mantener la consistencia eventual de security.

  @Saga()
  onSalesManagerUpdated = ($events: Observable<SalesManagerUpdatedEvent>) => {
    return $events.pipe(
      ofType(SalesManagerUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga security-sales-manager-sync-updated recibió SalesManagerUpdated: ${event.aggregateId}`);
        void this.handleSalesManagerUpdated(event);
      }),
      map(() => null)
    );
  };

  private async handleSalesManagerUpdated(event: SalesManagerUpdatedEvent): Promise<void> {
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
      saga: 'security-sales-manager-sync-updated',
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
      managerCode: this.resolveValue(event, 'payload.instance.managerCode'),
      approvalStatus: this.resolveValue(event, 'payload.instance.approvalStatus'),
      commissionPlanId: this.resolveValue(event, 'payload.instance.commissionPlanId'),
      merchantContracts: this.resolveValue(event, 'payload.instance.merchantContracts'),
      referralTreeReference: this.resolveValue(event, 'payload.instance.referralTreeReference'),
      metadata: this.resolveValue(event, 'payload.instance.metadata'),
    };
    this.logger.log(`Ejecutando dispatch UpdateSalesManagerCommand para la saga executeDispatch1: ${correlationId}`);
    await this.commandBus.execute(new UpdateSalesManagerCommand(payload, metadata));
  }

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga cross-context: ${error.message}`);
    this.eventBus.publish(new SagaSalesManagerFailedEvent(error, event));
  }
}

