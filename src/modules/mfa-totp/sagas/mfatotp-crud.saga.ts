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
  MfaTotpCreatedEvent,
  MfaTotpUpdatedEvent,
  MfaTotpDeletedEvent,

} from '../events/exporting.event';
import {
  SagaMfaTotpFailedEvent
} from '../events/mfatotp-failed.event';
import {
  CreateMfaTotpCommand,
  UpdateMfaTotpCommand,
  DeleteMfaTotpCommand
} from '../commands/exporting.command';

@Injectable()
export class MfaTotpCrudSaga {
  private readonly logger = new Logger(MfaTotpCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onMfaTotpCreated = ($events: Observable<MfaTotpCreatedEvent>) => {
    return $events.pipe(
      ofType(MfaTotpCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de MfaTotp: ${event.aggregateId}`);
        // Lógica post-creación (ej: enviar notificación)
      }),
      map(event => {
        // Ejecutar comandos adicionales si es necesario
        return null;
      })
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onMfaTotpUpdated = ($events: Observable<MfaTotpUpdatedEvent>) => {
    return $events.pipe(
      ofType(MfaTotpUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de MfaTotp: ${event.aggregateId}`);
        // Lógica post-actualización (ej: actualizar caché)
      })
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onMfaTotpDeleted = ($events: Observable<MfaTotpDeletedEvent>) => {
    return $events.pipe(
      ofType(MfaTotpDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de MfaTotp: ${event.aggregateId}`);
        // Lógica post-eliminación (ej: limpiar relaciones)
      }),
      map(event => {
        // Ejemplo: Ejecutar comando de compensación
        // return this.commandBus.execute(new CompensateDeleteCommand(...));
        return null;
      })
    );
  };


  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaMfaTotpFailedEvent( error,event));
  }
}
