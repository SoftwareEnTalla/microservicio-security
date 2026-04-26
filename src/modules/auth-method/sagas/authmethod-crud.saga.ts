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
  AuthMethodCreatedEvent,
  AuthMethodUpdatedEvent,
  AuthMethodDeletedEvent,

} from '../events/exporting.event';
import {
  SagaAuthMethodFailedEvent
} from '../events/authmethod-failed.event';
import {
  CreateAuthMethodCommand,
  UpdateAuthMethodCommand,
  DeleteAuthMethodCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class AuthMethodCrudSaga {
  private readonly logger = new Logger(AuthMethodCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onAuthMethodCreated = ($events: Observable<AuthMethodCreatedEvent>) => {
    return $events.pipe(
      ofType(AuthMethodCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de AuthMethod: ${event.aggregateId}`);
        void this.handleAuthMethodCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onAuthMethodUpdated = ($events: Observable<AuthMethodUpdatedEvent>) => {
    return $events.pipe(
      ofType(AuthMethodUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de AuthMethod: ${event.aggregateId}`);
        void this.handleAuthMethodUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onAuthMethodDeleted = ($events: Observable<AuthMethodDeletedEvent>) => {
    return $events.pipe(
      ofType(AuthMethodDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de AuthMethod: ${event.aggregateId}`);
        void this.handleAuthMethodDeleted(event);
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
      .registerClient(AuthMethodCrudSaga.name)
      .get(AuthMethodCrudSaga.name),
  })
  private async handleAuthMethodCreated(event: AuthMethodCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga AuthMethod Created completada: ${event.aggregateId}`);
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
      .registerClient(AuthMethodCrudSaga.name)
      .get(AuthMethodCrudSaga.name),
  })
  private async handleAuthMethodUpdated(event: AuthMethodUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga AuthMethod Updated completada: ${event.aggregateId}`);
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
      .registerClient(AuthMethodCrudSaga.name)
      .get(AuthMethodCrudSaga.name),
  })
  private async handleAuthMethodDeleted(event: AuthMethodDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga AuthMethod Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaAuthMethodFailedEvent( error,event));
  }
}
