/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */


import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  DeliveryModeCreatedEvent,
  DeliveryModeUpdatedEvent,
  DeliveryModeDeletedEvent,

} from '../events/exporting.event';
import {
  SagaDeliveryModeFailedEvent
} from '../events/deliverymode-failed.event';
import {
  CreateDeliveryModeCommand,
  UpdateDeliveryModeCommand,
  DeleteDeliveryModeCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class DeliveryModeCrudSaga {
  private readonly logger = new Logger(DeliveryModeCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onDeliveryModeCreated = ($events: Observable<DeliveryModeCreatedEvent>) => {
    return $events.pipe(
      ofType(DeliveryModeCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de DeliveryMode: ${event.aggregateId}`);
        void this.handleDeliveryModeCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onDeliveryModeUpdated = ($events: Observable<DeliveryModeUpdatedEvent>) => {
    return $events.pipe(
      ofType(DeliveryModeUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de DeliveryMode: ${event.aggregateId}`);
        void this.handleDeliveryModeUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onDeliveryModeDeleted = ($events: Observable<DeliveryModeDeletedEvent>) => {
    return $events.pipe(
      ofType(DeliveryModeDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de DeliveryMode: ${event.aggregateId}`);
        void this.handleDeliveryModeDeleted(event);
      }),
      map(() => null)
    );
  };


  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(DeliveryModeCrudSaga.name)
      .get(DeliveryModeCrudSaga.name),
  })
  private async handleDeliveryModeCreated(event: DeliveryModeCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga DeliveryMode Created completada: ${event.aggregateId}`);
      // Lógica post-creación (ej: enviar notificación, ejecutar comandos adicionales)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(DeliveryModeCrudSaga.name)
      .get(DeliveryModeCrudSaga.name),
  })
  private async handleDeliveryModeUpdated(event: DeliveryModeUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga DeliveryMode Updated completada: ${event.aggregateId}`);
      // Lógica post-actualización (ej: actualizar caché)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(DeliveryModeCrudSaga.name)
      .get(DeliveryModeCrudSaga.name),
  })
  private async handleDeliveryModeDeleted(event: DeliveryModeDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga DeliveryMode Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaDeliveryModeFailedEvent( error,event));
  }
}
