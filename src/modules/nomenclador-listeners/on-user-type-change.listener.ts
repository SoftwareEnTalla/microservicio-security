/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 *
 * OnUserTypeChangeListener — listener generado para reaccionar a cambios del
 * nomenclador `user-type` (owner: security). Suscribe a EventBus local y a Kafka.
 *
 * Patrón: on<Nomenclador>Change. Si tu microservicio necesita lógica
 * específica (invalidar cachés, refrescar mirrors, propagar a entidades stale),
 * extiende esta clase y sobrescribe `onChange`.
 *
 * Generado por sources/scaffold_nomenclador_listeners.py — NO editar a mano.
 */

import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { Subscription } from 'rxjs';

const NOM_KEY = 'user-type';
const OWNER_BC = 'security';
const CROSS_CONTEXT = true;
const EVENT_NAMES: string[] = [
  'UserTypeCreatedEvent',
  'UserTypeUpdatedEvent',
  'UserTypeDeletedEvent',
];
const TOPICS: string[] = [
  'user-type-created',
  'user-type-updated',
  'user-type-deleted',
];

@Injectable()
export class OnUserTypeChangeListener
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(OnUserTypeChangeListener.name);
  private busSubscription?: Subscription;
  private kafkaConsumer: any | null = null;

  constructor(
    private readonly config: ConfigService,
    @Optional() private readonly eventBus?: EventBus,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.eventBus) {
      this.busSubscription = this.eventBus.subscribe((evt: any) => {
        if (!evt) return;
        const name = evt?.constructor?.name;
        if (EVENT_NAMES.includes(name)) {
          void this.onChange(name, evt).catch((err) =>
            this.logger.error(
              `Error en onChange (${name}): ${err?.message ?? err}`,
            ),
          );
        }
      });
    }

    const brokersRaw = this.config.get<string>('KAFKA_BROKERS') ?? '';
    const brokers = brokersRaw
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
    if (brokers.length === 0) {
      this.logger.debug(
        `KAFKA_BROKERS vacío — OnUserTypeChangeListener solo escucha EventBus local.`,
      );
      return;
    }

    let Kafka: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      Kafka = require('kafkajs').Kafka;
    } catch {
      this.logger.debug('kafkajs no disponible — Kafka subscription deshabilitada.');
      return;
    }

    try {
      const appName = process.env.APP_NAME ?? 'ms';
      const clientId =
        this.config.get<string>('NOMENCLADOR_KAFKA_CLIENT_ID') ??
        `${appName}-on-${NOM_KEY}-change`;
      const groupId =
        this.config.get<string>('NOMENCLADOR_KAFKA_GROUP_ID') ??
        `${clientId}-${appName}`;
      const k = new Kafka({ clientId, brokers });
      this.kafkaConsumer = k.consumer({ groupId });
      await this.kafkaConsumer.connect();
      for (const topic of TOPICS) {
        await this.kafkaConsumer.subscribe({ topic, fromBeginning: false });
      }
      await this.kafkaConsumer.run({
        eachMessage: async ({ topic, message }: any) =>
          this.handleKafkaMessage(topic, message),
      });
      this.logger.log(
        `OnUserTypeChangeListener suscrito a [${TOPICS.join(', ')}] (group ${groupId}, owner=${OWNER_BC}, cross=${CROSS_CONTEXT}).`,
      );
    } catch (err: any) {
      this.logger.warn(
        `No se pudo iniciar Kafka subscription para ${NOM_KEY}: ${err?.message ?? err}`,
      );
      this.kafkaConsumer = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      this.busSubscription?.unsubscribe();
    } catch {
      /* noop */
    }
    if (this.kafkaConsumer) {
      try {
        await this.kafkaConsumer.disconnect();
      } catch {
        /* noop */
      }
      this.kafkaConsumer = null;
    }
  }

  private async handleKafkaMessage(topic: string, message: any): Promise<void> {
    try {
      const raw = message?.value?.toString('utf8') ?? '{}';
      const payload = JSON.parse(raw);
      await this.onChange(topic, payload);
    } catch (err: any) {
      this.logger.warn(`Error manejando ${topic}: ${err?.message ?? err}`);
    }
  }

  /**
   * Hook protegido. Sobrescriba para lógica específica del consumidor:
   * - Invalidar cachés de entidades que referencian este nomenclador.
   * - Disparar comandos de refresco para mirrors / proyecciones stale.
   * - Notificar a otros agregados internos.
   *
   * Default: log informativo.
   */
  protected async onChange(eventName: string, payload: any): Promise<void> {
    this.logger.log(
      `[onUserTypeChange] eventName=${eventName} payload=${JSON.stringify(payload).slice(0, 500)}`,
    );
  }
}
