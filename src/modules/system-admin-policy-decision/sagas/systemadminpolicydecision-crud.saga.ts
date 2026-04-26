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
  SystemAdminPolicyDecisionCreatedEvent,
  SystemAdminPolicyDecisionUpdatedEvent,
  SystemAdminPolicyDecisionDeletedEvent,

} from '../events/exporting.event';
import {
  SagaSystemAdminPolicyDecisionFailedEvent
} from '../events/systemadminpolicydecision-failed.event';
import {
  CreateSystemAdminPolicyDecisionCommand,
  UpdateSystemAdminPolicyDecisionCommand,
  DeleteSystemAdminPolicyDecisionCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class SystemAdminPolicyDecisionCrudSaga {
  private readonly logger = new Logger(SystemAdminPolicyDecisionCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onSystemAdminPolicyDecisionCreated = ($events: Observable<SystemAdminPolicyDecisionCreatedEvent>) => {
    return $events.pipe(
      ofType(SystemAdminPolicyDecisionCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de SystemAdminPolicyDecision: ${event.aggregateId}`);
        void this.handleSystemAdminPolicyDecisionCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onSystemAdminPolicyDecisionUpdated = ($events: Observable<SystemAdminPolicyDecisionUpdatedEvent>) => {
    return $events.pipe(
      ofType(SystemAdminPolicyDecisionUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de SystemAdminPolicyDecision: ${event.aggregateId}`);
        void this.handleSystemAdminPolicyDecisionUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onSystemAdminPolicyDecisionDeleted = ($events: Observable<SystemAdminPolicyDecisionDeletedEvent>) => {
    return $events.pipe(
      ofType(SystemAdminPolicyDecisionDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de SystemAdminPolicyDecision: ${event.aggregateId}`);
        void this.handleSystemAdminPolicyDecisionDeleted(event);
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
      .registerClient(SystemAdminPolicyDecisionCrudSaga.name)
      .get(SystemAdminPolicyDecisionCrudSaga.name),
  })
  private async handleSystemAdminPolicyDecisionCreated(event: SystemAdminPolicyDecisionCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga SystemAdminPolicyDecision Created completada: ${event.aggregateId}`);
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
      .registerClient(SystemAdminPolicyDecisionCrudSaga.name)
      .get(SystemAdminPolicyDecisionCrudSaga.name),
  })
  private async handleSystemAdminPolicyDecisionUpdated(event: SystemAdminPolicyDecisionUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga SystemAdminPolicyDecision Updated completada: ${event.aggregateId}`);
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
      .registerClient(SystemAdminPolicyDecisionCrudSaga.name)
      .get(SystemAdminPolicyDecisionCrudSaga.name),
  })
  private async handleSystemAdminPolicyDecisionDeleted(event: SystemAdminPolicyDecisionDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga SystemAdminPolicyDecision Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaSystemAdminPolicyDecisionFailedEvent( error,event));
  }
}
