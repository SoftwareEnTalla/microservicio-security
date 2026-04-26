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


import { CreateSystemAdminPolicyDecisionDto } from '../dtos/all-dto';
import { SystemAdminPolicyDecision } from '../entities/system-admin-policy-decision.entity';
import { BaseEvent, PayloadEvent } from './base.event'; 
import { v4 as uuidv4 } from "uuid";

export class SystemAdminPolicyDecisionCreatedEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<CreateSystemAdminPolicyDecisionDto|SystemAdminPolicyDecision>
  ) {
    super(aggregateId);
  }

  
         // Método estático para construcción consistente del evento
        static create(
          instanceId: string,
          instance: CreateSystemAdminPolicyDecisionDto|SystemAdminPolicyDecision,
          userId: string,
          correlationId: string=uuidv4()
        ): SystemAdminPolicyDecisionCreatedEvent {
          return new SystemAdminPolicyDecisionCreatedEvent(instanceId, {
            instance: instance,
            metadata: {
              initiatedBy: userId,
              correlationId:correlationId || uuidv4(),
            },
          });
        }
        

}
