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
  MfaModeCreatedEvent,
  MfaModeUpdatedEvent,
  MfaModeDeletedEvent,

} from '../events/exporting.event';
import {
  SagaMfaModeFailedEvent
} from '../events/mfamode-failed.event';
import {
  CreateMfaModeCommand,
  UpdateMfaModeCommand,
  DeleteMfaModeCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class MfaModeCrudSaga {
  private readonly logger = new Logger(MfaModeCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onMfaModeCreated = ($events: Observable<MfaModeCreatedEvent>) => {
    return $events.pipe(
      ofType(MfaModeCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de MfaMode: ${event.aggregateId}`);
        void this.handleMfaModeCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onMfaModeUpdated = ($events: Observable<MfaModeUpdatedEvent>) => {
    return $events.pipe(
      ofType(MfaModeUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de MfaMode: ${event.aggregateId}`);
        void this.handleMfaModeUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onMfaModeDeleted = ($events: Observable<MfaModeDeletedEvent>) => {
    return $events.pipe(
      ofType(MfaModeDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de MfaMode: ${event.aggregateId}`);
        void this.handleMfaModeDeleted(event);
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
      .registerClient(MfaModeCrudSaga.name)
      .get(MfaModeCrudSaga.name),
  })
  private async handleMfaModeCreated(event: MfaModeCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga MfaMode Created completada: ${event.aggregateId}`);
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
      .registerClient(MfaModeCrudSaga.name)
      .get(MfaModeCrudSaga.name),
  })
  private async handleMfaModeUpdated(event: MfaModeUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga MfaMode Updated completada: ${event.aggregateId}`);
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
      .registerClient(MfaModeCrudSaga.name)
      .get(MfaModeCrudSaga.name),
  })
  private async handleMfaModeDeleted(event: MfaModeDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga MfaMode Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaMfaModeFailedEvent( error,event));
  }
}
