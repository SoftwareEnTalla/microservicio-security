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
  LoginCreatedEvent,
  LoginUpdatedEvent,
  LoginDeletedEvent,
  LoginSucceededEvent,
  LoginFailedEvent,
  LoginRefreshedEvent,
  LoginLoggedOutEvent,
  FederatedLoginStartedEvent,
} from '../events/exporting.event';
import {
  SagaLoginFailedEvent
} from '../events/login-failed.event';
import {
  CreateLoginCommand,
  UpdateLoginCommand,
  DeleteLoginCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class LoginCrudSaga {
  private readonly logger = new Logger(LoginCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onLoginCreated = ($events: Observable<LoginCreatedEvent>) => {
    return $events.pipe(
      ofType(LoginCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de Login: ${event.aggregateId}`);
        void this.handleLoginCreated(event);
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
  onLoginUpdated = ($events: Observable<LoginUpdatedEvent>) => {
    return $events.pipe(
      ofType(LoginUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de Login: ${event.aggregateId}`);
        void this.handleLoginUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onLoginDeleted = ($events: Observable<LoginDeletedEvent>) => {
    return $events.pipe(
      ofType(LoginDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de Login: ${event.aggregateId}`);
        void this.handleLoginDeleted(event);
      }),
      map(() => null),
      map(event => {
        // Ejemplo: Ejecutar comando de compensación
        // return this.commandBus.execute(new CompensateDeleteCommand(...));
        return null;
      })
    );
  };

  @Saga()
  onLoginSucceeded = ($events: Observable<LoginSucceededEvent>) => {
    return $events.pipe(
      ofType(LoginSucceededEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio LoginSucceeded: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onLoginFailed = ($events: Observable<LoginFailedEvent>) => {
    return $events.pipe(
      ofType(LoginFailedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio LoginFailed: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onLoginRefreshed = ($events: Observable<LoginRefreshedEvent>) => {
    return $events.pipe(
      ofType(LoginRefreshedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio LoginRefreshed: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onLoginLoggedOut = ($events: Observable<LoginLoggedOutEvent>) => {
    return $events.pipe(
      ofType(LoginLoggedOutEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio LoginLoggedOut: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onFederatedLoginStarted = ($events: Observable<FederatedLoginStartedEvent>) => {
    return $events.pipe(
      ofType(FederatedLoginStartedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio FederatedLoginStarted: ${event.aggregateId}`);
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
      .registerClient(LoginCrudSaga.name)
      .get(LoginCrudSaga.name),
  })
  private async handleLoginCreated(event: LoginCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Login Created completada: ${event.aggregateId}`);
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
      .registerClient(LoginCrudSaga.name)
      .get(LoginCrudSaga.name),
  })
  private async handleLoginUpdated(event: LoginUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Login Updated completada: ${event.aggregateId}`);
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
      .registerClient(LoginCrudSaga.name)
      .get(LoginCrudSaga.name),
  })
  private async handleLoginDeleted(event: LoginDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Login Deleted completada: ${event.aggregateId}`);
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaLoginFailedEvent( error,event));
  }
}
