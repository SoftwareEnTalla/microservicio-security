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
  ProviderTypeCreatedEvent,
  ProviderTypeUpdatedEvent,
  ProviderTypeDeletedEvent,

} from '../events/exporting.event';
import {
  SagaProviderTypeFailedEvent
} from '../events/providertype-failed.event';
import {
  CreateProviderTypeCommand,
  UpdateProviderTypeCommand,
  DeleteProviderTypeCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class ProviderTypeCrudSaga {
  private readonly logger = new Logger(ProviderTypeCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onProviderTypeCreated = ($events: Observable<ProviderTypeCreatedEvent>) => {
    return $events.pipe(
      ofType(ProviderTypeCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de ProviderType: ${event.aggregateId}`);
        void this.handleProviderTypeCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onProviderTypeUpdated = ($events: Observable<ProviderTypeUpdatedEvent>) => {
    return $events.pipe(
      ofType(ProviderTypeUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de ProviderType: ${event.aggregateId}`);
        void this.handleProviderTypeUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onProviderTypeDeleted = ($events: Observable<ProviderTypeDeletedEvent>) => {
    return $events.pipe(
      ofType(ProviderTypeDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de ProviderType: ${event.aggregateId}`);
        void this.handleProviderTypeDeleted(event);
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
      .registerClient(ProviderTypeCrudSaga.name)
      .get(ProviderTypeCrudSaga.name),
  })
  private async handleProviderTypeCreated(event: ProviderTypeCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga ProviderType Created completada: ${event.aggregateId}`);
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
      .registerClient(ProviderTypeCrudSaga.name)
      .get(ProviderTypeCrudSaga.name),
  })
  private async handleProviderTypeUpdated(event: ProviderTypeUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga ProviderType Updated completada: ${event.aggregateId}`);
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
      .registerClient(ProviderTypeCrudSaga.name)
      .get(ProviderTypeCrudSaga.name),
  })
  private async handleProviderTypeDeleted(event: ProviderTypeDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga ProviderType Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaProviderTypeFailedEvent( error,event));
  }
}
