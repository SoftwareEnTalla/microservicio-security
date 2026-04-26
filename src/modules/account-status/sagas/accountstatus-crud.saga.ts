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
  AccountStatusCreatedEvent,
  AccountStatusUpdatedEvent,
  AccountStatusDeletedEvent,

} from '../events/exporting.event';
import {
  SagaAccountStatusFailedEvent
} from '../events/accountstatus-failed.event';
import {
  CreateAccountStatusCommand,
  UpdateAccountStatusCommand,
  DeleteAccountStatusCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class AccountStatusCrudSaga {
  private readonly logger = new Logger(AccountStatusCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onAccountStatusCreated = ($events: Observable<AccountStatusCreatedEvent>) => {
    return $events.pipe(
      ofType(AccountStatusCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de AccountStatus: ${event.aggregateId}`);
        void this.handleAccountStatusCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onAccountStatusUpdated = ($events: Observable<AccountStatusUpdatedEvent>) => {
    return $events.pipe(
      ofType(AccountStatusUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de AccountStatus: ${event.aggregateId}`);
        void this.handleAccountStatusUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onAccountStatusDeleted = ($events: Observable<AccountStatusDeletedEvent>) => {
    return $events.pipe(
      ofType(AccountStatusDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de AccountStatus: ${event.aggregateId}`);
        void this.handleAccountStatusDeleted(event);
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
      .registerClient(AccountStatusCrudSaga.name)
      .get(AccountStatusCrudSaga.name),
  })
  private async handleAccountStatusCreated(event: AccountStatusCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga AccountStatus Created completada: ${event.aggregateId}`);
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
      .registerClient(AccountStatusCrudSaga.name)
      .get(AccountStatusCrudSaga.name),
  })
  private async handleAccountStatusUpdated(event: AccountStatusUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga AccountStatus Updated completada: ${event.aggregateId}`);
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
      .registerClient(AccountStatusCrudSaga.name)
      .get(AccountStatusCrudSaga.name),
  })
  private async handleAccountStatusDeleted(event: AccountStatusDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga AccountStatus Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaAccountStatusFailedEvent( error,event));
  }
}
