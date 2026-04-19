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
  AuthenticationCreatedEvent,
  AuthenticationUpdatedEvent,
  AuthenticationDeletedEvent,

} from '../events/exporting.event';
import {
  SagaAuthenticationFailedEvent
} from '../events/authentication-failed.event';
import {
  CreateAuthenticationCommand,
  UpdateAuthenticationCommand,
  DeleteAuthenticationCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class AuthenticationCrudSaga {
  private readonly logger = new Logger(AuthenticationCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onAuthenticationCreated = ($events: Observable<AuthenticationCreatedEvent>) => {
    return $events.pipe(
      ofType(AuthenticationCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de Authentication: ${event.aggregateId}`);
        void this.handleAuthenticationCreated(event);
      }),
      map(() => null),
      map(event => {
        // Ejecutar comandos adicionales si es necesario
        return null;
      })
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onAuthenticationUpdated = ($events: Observable<AuthenticationUpdatedEvent>) => {
    return $events.pipe(
      ofType(AuthenticationUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de Authentication: ${event.aggregateId}`);
        void this.handleAuthenticationUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onAuthenticationDeleted = ($events: Observable<AuthenticationDeletedEvent>) => {
    return $events.pipe(
      ofType(AuthenticationDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de Authentication: ${event.aggregateId}`);
        void this.handleAuthenticationDeleted(event);
      }),
      map(() => null),
      map(event => {
        // Ejemplo: Ejecutar comando de compensación
        // return this.commandBus.execute(new CompensateDeleteCommand(...));
        return null;
      })
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
      .registerClient(AuthenticationCrudSaga.name)
      .get(AuthenticationCrudSaga.name),
  })
  private async handleAuthenticationCreated(event: AuthenticationCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Authentication Created completada: ${event.aggregateId}`);
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
      .registerClient(AuthenticationCrudSaga.name)
      .get(AuthenticationCrudSaga.name),
  })
  private async handleAuthenticationUpdated(event: AuthenticationUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Authentication Updated completada: ${event.aggregateId}`);
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
      .registerClient(AuthenticationCrudSaga.name)
      .get(AuthenticationCrudSaga.name),
  })
  private async handleAuthenticationDeleted(event: AuthenticationDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Authentication Deleted completada: ${event.aggregateId}`);
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaAuthenticationFailedEvent( error,event));
  }
}
