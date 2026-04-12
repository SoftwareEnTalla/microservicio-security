import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  MerchantUpdatedEvent,
} from '../events/exporting.event';
import {
  SagaSecurityMerchantFailedEvent
} from '../events/securitymerchant-failed.event';
import {
  UpdateSecurityMerchantCommand,
} from '../commands/exporting.command';

@Injectable()
export class SecurityMerchantSyncUpdatedSaga {
  private readonly logger = new Logger(SecurityMerchantSyncUpdatedSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Replica cambios del merchant para que security mantenga una vista consistente del estado comercial del usuario merchant.

  @Saga()
  onMerchantUpdated = ($events: Observable<MerchantUpdatedEvent>) => {
    return $events.pipe(
      ofType(MerchantUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga security-merchant-sync-updated recibió MerchantUpdated: ${event.aggregateId}`);
        void this.handleMerchantUpdated(event);
      }),
      map(() => null)
    );
  };

  private async handleMerchantUpdated(event: MerchantUpdatedEvent): Promise<void> {
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
      saga: 'security-merchant-sync-updated',
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
      merchantCode: this.resolveValue(event, 'payload.instance.merchantCode'),
      legalRepresentative: this.resolveValue(event, 'payload.instance.legalRepresentative'),
      legalEntityName: this.resolveValue(event, 'payload.instance.legalName'),
      collectionMethods: this.resolveValue(event, 'payload.instance.collectionMethods'),
      bankAccounts: this.resolveValue(event, 'payload.instance.bankAccounts'),
      approvalStatus: this.resolveValue(event, 'payload.instance.approvalStatus'),
      metadata: this.resolveValue(event, 'payload.instance.metadata'),
    };
    this.logger.log(`Ejecutando dispatch UpdateSecurityMerchantCommand para la saga executeDispatch1: ${correlationId}`);
    await this.commandBus.execute(new UpdateSecurityMerchantCommand(payload, metadata));
  }

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga cross-context: ${error.message}`);
    this.eventBus.publish(new SagaSecurityMerchantFailedEvent(error, event));
  }
}

