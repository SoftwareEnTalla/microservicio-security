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
import { Observable, map, tap, mergeMap, EMPTY, from } from 'rxjs';
import {
  RbacAclCreatedEvent,
  RbacAclUpdatedEvent,
  RbacAclDeletedEvent,
  RoleUpdatedEvent,
  RoleDeactivatedEvent,
  RoleDeletedEvent,
  PermissionAssignedToRoleEvent,
  PermissionRemovedFromRoleEvent,
  UserRoleAssignedEvent,
  UserRoleRevokedEvent,
} from '../events/exporting.event';
import {
  SagaRbacAclFailedEvent
} from '../events/rbacacl-failed.event';
import {
  CreateRbacAclCommand,
  UpdateRbacAclCommand,
  DeleteRbacAclCommand
} from '../commands/exporting.command';
import { AclResolverService } from '../services/acl-resolver.service';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class RbacAclCrudSaga {
  private readonly logger = new Logger(RbacAclCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly aclResolver: AclResolverService,
  ) {}

  // Reacción a evento de creación
  @Saga()
  onRbacAclCreated = ($events: Observable<RbacAclCreatedEvent>) => {
    return $events.pipe(
      ofType(RbacAclCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de RbacAcl: ${event.aggregateId}`);
        void this.handleRbacAclCreated(event);
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
  onRbacAclUpdated = ($events: Observable<RbacAclUpdatedEvent>) => {
    return $events.pipe(
      ofType(RbacAclUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de RbacAcl: ${event.aggregateId}`);
        void this.handleRbacAclUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onRbacAclDeleted = ($events: Observable<RbacAclDeletedEvent>) => {
    return $events.pipe(
      ofType(RbacAclDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de RbacAcl: ${event.aggregateId}`);
        void this.handleRbacAclDeleted(event);
      }),
      map(() => null),
      map(event => {
        // Ejemplo: Ejecutar comando de compensación
        // return this.commandBus.execute(new CompensateDeleteCommand(...));
        return null;
      })
    );
  };


  // --- Sagas de notificación: cambios en roles/permisos notifican a usuarios afectados ---

  @Saga()
  onRoleUpdatedNotify = ($events: Observable<RoleUpdatedEvent>) => {
    return $events.pipe(
      ofType(RoleUpdatedEvent),
      tap(event => this.logger.log(`Saga notificación: rol actualizado ${event.aggregateId}`)),
      mergeMap(event => {
        return from(
          this.aclResolver.resolveAclForAffectedUsers(
            event.aggregateId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
    );
  };

  @Saga()
  onRoleDeactivatedNotify = ($events: Observable<RoleDeactivatedEvent>) => {
    return $events.pipe(
      ofType(RoleDeactivatedEvent),
      tap(event => this.logger.log(`Saga notificación: rol desactivado ${event.aggregateId}`)),
      mergeMap(event => {
        return from(
          this.aclResolver.resolveAclForAffectedUsers(
            event.aggregateId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
    );
  };

  @Saga()
  onRoleDeletedNotify = ($events: Observable<RoleDeletedEvent>) => {
    return $events.pipe(
      ofType(RoleDeletedEvent),
      tap(event => this.logger.log(`Saga notificación: rol eliminado ${event.aggregateId}`)),
      mergeMap(event => {
        return from(
          this.aclResolver.resolveAclForAffectedUsers(
            event.aggregateId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
    );
  };

  @Saga()
  onPermissionAssignedToRoleNotify = ($events: Observable<PermissionAssignedToRoleEvent>) => {
    return $events.pipe(
      ofType(PermissionAssignedToRoleEvent),
      tap(event => this.logger.log(`Saga notificación: permiso asignado a rol ${event.aggregateId}`)),
      mergeMap(event => {
        const roleId = (event.payload?.instance as any)?.roleId;
        if (!roleId) return EMPTY;
        return from(
          this.aclResolver.resolveAclForAffectedUsers(
            roleId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
    );
  };

  @Saga()
  onPermissionRemovedFromRoleNotify = ($events: Observable<PermissionRemovedFromRoleEvent>) => {
    return $events.pipe(
      ofType(PermissionRemovedFromRoleEvent),
      tap(event => this.logger.log(`Saga notificación: permiso removido de rol ${event.aggregateId}`)),
      mergeMap(event => {
        const roleId = (event.payload?.instance as any)?.roleId;
        if (!roleId) return EMPTY;
        return from(
          this.aclResolver.resolveAclForAffectedUsers(
            roleId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
    );
  };

  @Saga()
  onUserRoleAssignedNotify = ($events: Observable<UserRoleAssignedEvent>) => {
    return $events.pipe(
      ofType(UserRoleAssignedEvent),
      tap(event => this.logger.log(`Saga notificación: rol asignado a usuario ${event.aggregateId}`)),
      mergeMap(event => {
        const userId = (event.payload?.instance as any)?.userId;
        if (!userId) return EMPTY;
        return from(
          this.aclResolver.resolveUserAcl(
            userId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
    );
  };

  @Saga()
  onUserRoleRevokedNotify = ($events: Observable<UserRoleRevokedEvent>) => {
    return $events.pipe(
      ofType(UserRoleRevokedEvent),
      tap(event => this.logger.log(`Saga notificación: rol revocado de usuario ${event.aggregateId}`)),
      mergeMap(event => {
        const userId = (event.payload?.instance as any)?.userId;
        if (!userId) return EMPTY;
        return from(
          this.aclResolver.resolveUserAcl(
            userId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
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
      .registerClient(RbacAclCrudSaga.name)
      .get(RbacAclCrudSaga.name),
  })
  private async handleRbacAclCreated(event: RbacAclCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga RbacAcl Created completada: ${event.aggregateId}`);
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
      .registerClient(RbacAclCrudSaga.name)
      .get(RbacAclCrudSaga.name),
  })
  private async handleRbacAclUpdated(event: RbacAclUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga RbacAcl Updated completada: ${event.aggregateId}`);
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
      .registerClient(RbacAclCrudSaga.name)
      .get(RbacAclCrudSaga.name),
  })
  private async handleRbacAclDeleted(event: RbacAclDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga RbacAcl Deleted completada: ${event.aggregateId}`);
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaRbacAclFailedEvent( error,event));
  }
}
