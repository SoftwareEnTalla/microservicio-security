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


import { CreateAuthMethodDto } from '../dtos/all-dto';
import { AuthMethod } from '../entities/auth-method.entity';
import { BaseEvent, PayloadEvent } from './base.event'; 
import { v4 as uuidv4 } from "uuid";

export class AuthMethodCreatedEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<CreateAuthMethodDto|AuthMethod>
  ) {
    super(aggregateId);
  }

  
         // Método estático para construcción consistente del evento
        static create(
          instanceId: string,
          instance: CreateAuthMethodDto|AuthMethod,
          userId: string,
          correlationId: string=uuidv4()
        ): AuthMethodCreatedEvent {
          return new AuthMethodCreatedEvent(instanceId, {
            instance: instance,
            metadata: {
              initiatedBy: userId,
              correlationId:correlationId || uuidv4(),
            },
          });
        }
        

}
