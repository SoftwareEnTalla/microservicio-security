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
  ProtocolFamilyCreatedEvent,
  ProtocolFamilyUpdatedEvent,
  ProtocolFamilyDeletedEvent,

} from '../events/exporting.event';
import {
  SagaProtocolFamilyFailedEvent
} from '../events/protocolfamily-failed.event';
import {
  CreateProtocolFamilyCommand,
  UpdateProtocolFamilyCommand,
  DeleteProtocolFamilyCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class ProtocolFamilyCrudSaga {
  private readonly logger = new Logger(ProtocolFamilyCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onProtocolFamilyCreated = ($events: Observable<ProtocolFamilyCreatedEvent>) => {
    return $events.pipe(
      ofType(ProtocolFamilyCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de ProtocolFamily: ${event.aggregateId}`);
        void this.handleProtocolFamilyCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onProtocolFamilyUpdated = ($events: Observable<ProtocolFamilyUpdatedEvent>) => {
    return $events.pipe(
      ofType(ProtocolFamilyUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de ProtocolFamily: ${event.aggregateId}`);
        void this.handleProtocolFamilyUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onProtocolFamilyDeleted = ($events: Observable<ProtocolFamilyDeletedEvent>) => {
    return $events.pipe(
      ofType(ProtocolFamilyDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de ProtocolFamily: ${event.aggregateId}`);
        void this.handleProtocolFamilyDeleted(event);
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
      .registerClient(ProtocolFamilyCrudSaga.name)
      .get(ProtocolFamilyCrudSaga.name),
  })
  private async handleProtocolFamilyCreated(event: ProtocolFamilyCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga ProtocolFamily Created completada: ${event.aggregateId}`);
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
      .registerClient(ProtocolFamilyCrudSaga.name)
      .get(ProtocolFamilyCrudSaga.name),
  })
  private async handleProtocolFamilyUpdated(event: ProtocolFamilyUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga ProtocolFamily Updated completada: ${event.aggregateId}`);
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
      .registerClient(ProtocolFamilyCrudSaga.name)
      .get(ProtocolFamilyCrudSaga.name),
  })
  private async handleProtocolFamilyDeleted(event: ProtocolFamilyDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga ProtocolFamily Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaProtocolFamilyFailedEvent( error,event));
  }
}
