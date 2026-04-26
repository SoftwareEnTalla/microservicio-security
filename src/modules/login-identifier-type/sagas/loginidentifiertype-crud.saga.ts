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
  LoginIdentifierTypeCreatedEvent,
  LoginIdentifierTypeUpdatedEvent,
  LoginIdentifierTypeDeletedEvent,

} from '../events/exporting.event';
import {
  SagaLoginIdentifierTypeFailedEvent
} from '../events/loginidentifiertype-failed.event';
import {
  CreateLoginIdentifierTypeCommand,
  UpdateLoginIdentifierTypeCommand,
  DeleteLoginIdentifierTypeCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class LoginIdentifierTypeCrudSaga {
  private readonly logger = new Logger(LoginIdentifierTypeCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onLoginIdentifierTypeCreated = ($events: Observable<LoginIdentifierTypeCreatedEvent>) => {
    return $events.pipe(
      ofType(LoginIdentifierTypeCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de LoginIdentifierType: ${event.aggregateId}`);
        void this.handleLoginIdentifierTypeCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onLoginIdentifierTypeUpdated = ($events: Observable<LoginIdentifierTypeUpdatedEvent>) => {
    return $events.pipe(
      ofType(LoginIdentifierTypeUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de LoginIdentifierType: ${event.aggregateId}`);
        void this.handleLoginIdentifierTypeUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onLoginIdentifierTypeDeleted = ($events: Observable<LoginIdentifierTypeDeletedEvent>) => {
    return $events.pipe(
      ofType(LoginIdentifierTypeDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de LoginIdentifierType: ${event.aggregateId}`);
        void this.handleLoginIdentifierTypeDeleted(event);
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
      .registerClient(LoginIdentifierTypeCrudSaga.name)
      .get(LoginIdentifierTypeCrudSaga.name),
  })
  private async handleLoginIdentifierTypeCreated(event: LoginIdentifierTypeCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga LoginIdentifierType Created completada: ${event.aggregateId}`);
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
      .registerClient(LoginIdentifierTypeCrudSaga.name)
      .get(LoginIdentifierTypeCrudSaga.name),
  })
  private async handleLoginIdentifierTypeUpdated(event: LoginIdentifierTypeUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga LoginIdentifierType Updated completada: ${event.aggregateId}`);
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
      .registerClient(LoginIdentifierTypeCrudSaga.name)
      .get(LoginIdentifierTypeCrudSaga.name),
  })
  private async handleLoginIdentifierTypeDeleted(event: LoginIdentifierTypeDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga LoginIdentifierType Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaLoginIdentifierTypeFailedEvent( error,event));
  }
}
