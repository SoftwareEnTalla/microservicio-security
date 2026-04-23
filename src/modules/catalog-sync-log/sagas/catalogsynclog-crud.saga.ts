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
  CatalogSyncLogCreatedEvent,
  CatalogSyncLogUpdatedEvent,
  CatalogSyncLogDeletedEvent,
  CatalogSyncCompletedEvent,
  CatalogSyncFailedEvent,
} from '../events/exporting.event';
import {
  SagaCatalogSyncLogFailedEvent
} from '../events/catalogsynclog-failed.event';
import {
  CreateCatalogSyncLogCommand,
  UpdateCatalogSyncLogCommand,
  DeleteCatalogSyncLogCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class CatalogSyncLogCrudSaga {
  private readonly logger = new Logger(CatalogSyncLogCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onCatalogSyncLogCreated = ($events: Observable<CatalogSyncLogCreatedEvent>) => {
    return $events.pipe(
      ofType(CatalogSyncLogCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de CatalogSyncLog: ${event.aggregateId}`);
        void this.handleCatalogSyncLogCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onCatalogSyncLogUpdated = ($events: Observable<CatalogSyncLogUpdatedEvent>) => {
    return $events.pipe(
      ofType(CatalogSyncLogUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de CatalogSyncLog: ${event.aggregateId}`);
        void this.handleCatalogSyncLogUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onCatalogSyncLogDeleted = ($events: Observable<CatalogSyncLogDeletedEvent>) => {
    return $events.pipe(
      ofType(CatalogSyncLogDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de CatalogSyncLog: ${event.aggregateId}`);
        void this.handleCatalogSyncLogDeleted(event);
      }),
      map(() => null)
    );
  };

  @Saga()
  onCatalogSyncCompleted = ($events: Observable<CatalogSyncCompletedEvent>) => {
    return $events.pipe(
      ofType(CatalogSyncCompletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio CatalogSyncCompleted: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onCatalogSyncFailed = ($events: Observable<CatalogSyncFailedEvent>) => {
    return $events.pipe(
      ofType(CatalogSyncFailedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio CatalogSyncFailed: ${event.aggregateId}`);
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
      .registerClient(CatalogSyncLogCrudSaga.name)
      .get(CatalogSyncLogCrudSaga.name),
  })
  private async handleCatalogSyncLogCreated(event: CatalogSyncLogCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga CatalogSyncLog Created completada: ${event.aggregateId}`);
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
      .registerClient(CatalogSyncLogCrudSaga.name)
      .get(CatalogSyncLogCrudSaga.name),
  })
  private async handleCatalogSyncLogUpdated(event: CatalogSyncLogUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga CatalogSyncLog Updated completada: ${event.aggregateId}`);
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
      .registerClient(CatalogSyncLogCrudSaga.name)
      .get(CatalogSyncLogCrudSaga.name),
  })
  private async handleCatalogSyncLogDeleted(event: CatalogSyncLogDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga CatalogSyncLog Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaCatalogSyncLogFailedEvent( error,event));
  }
}
