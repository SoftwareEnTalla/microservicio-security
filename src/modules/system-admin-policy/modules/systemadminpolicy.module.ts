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


import { Module } from "@nestjs/common";
import { SystemAdminPolicyCommandController } from "../controllers/systemadminpolicycommand.controller";
import { SystemAdminPolicyQueryController } from "../controllers/systemadminpolicyquery.controller";
import { SystemAdminPolicyCommandService } from "../services/systemadminpolicycommand.service";
import { SystemAdminPolicyQueryService } from "../services/systemadminpolicyquery.service";

import { SystemAdminPolicyCommandRepository } from "../repositories/systemadminpolicycommand.repository";
import { SystemAdminPolicyQueryRepository } from "../repositories/systemadminpolicyquery.repository";
import { SystemAdminPolicyRepository } from "../repositories/systemadminpolicy.repository";
import { SystemAdminPolicyResolver } from "../graphql/systemadminpolicy.resolver";
import { SystemAdminPolicyAuthGuard } from "../guards/systemadminpolicyauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SystemAdminPolicy } from "../entities/system-admin-policy.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSystemAdminPolicyHandler } from "../commands/handlers/createsystemadminpolicy.handler";
import { UpdateSystemAdminPolicyHandler } from "../commands/handlers/updatesystemadminpolicy.handler";
import { DeleteSystemAdminPolicyHandler } from "../commands/handlers/deletesystemadminpolicy.handler";
import { GetSystemAdminPolicyByIdHandler } from "../queries/handlers/getsystemadminpolicybyid.handler";
import { GetSystemAdminPolicyByFieldHandler } from "../queries/handlers/getsystemadminpolicybyfield.handler";
import { GetAllSystemAdminPolicyHandler } from "../queries/handlers/getallsystemadminpolicy.handler";
import { SystemAdminPolicyCrudSaga } from "../sagas/systemadminpolicy-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SystemAdminPolicyInterceptor } from "../interceptors/systemadminpolicy.interceptor";
import { SystemAdminPolicyLoggingInterceptor } from "../interceptors/systemadminpolicy.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, SystemAdminPolicy]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [SystemAdminPolicyCommandController, SystemAdminPolicyQueryController],
  providers: [
    //Services
    EventStoreService,
    SystemAdminPolicyQueryService,
    SystemAdminPolicyCommandService,
  
    //Repositories
    SystemAdminPolicyCommandRepository,
    SystemAdminPolicyQueryRepository,
    SystemAdminPolicyRepository,      
    //Resolvers
    SystemAdminPolicyResolver,
    //Guards
    SystemAdminPolicyAuthGuard,
    //Interceptors
    SystemAdminPolicyInterceptor,
    SystemAdminPolicyLoggingInterceptor,
    //CQRS Handlers
    CreateSystemAdminPolicyHandler,
    UpdateSystemAdminPolicyHandler,
    DeleteSystemAdminPolicyHandler,
    GetSystemAdminPolicyByIdHandler,
    GetSystemAdminPolicyByFieldHandler,
    GetAllSystemAdminPolicyHandler,
    SystemAdminPolicyCrudSaga,
    //Configurations
    {
      provide: 'EVENT_SOURCING_CONFIG',
      useFactory: () => ({
        enabled: process.env.EVENT_SOURCING_ENABLED !== 'false',
        kafkaEnabled: process.env.KAFKA_ENABLED !== 'false',
        eventStoreEnabled: process.env.EVENT_STORE_ENABLED === 'true',
        publishEvents: true,
        useProjections: true,
        topics: EVENT_TOPICS
      })
    },
  ],
  exports: [
    CqrsModule,
    KafkaModule,
    //Services
    EventStoreService,
    SystemAdminPolicyQueryService,
    SystemAdminPolicyCommandService,
  
    //Repositories
    SystemAdminPolicyCommandRepository,
    SystemAdminPolicyQueryRepository,
    SystemAdminPolicyRepository,      
    //Resolvers
    SystemAdminPolicyResolver,
    //Guards
    SystemAdminPolicyAuthGuard,
    //Interceptors
    SystemAdminPolicyInterceptor,
    SystemAdminPolicyLoggingInterceptor,
  ],
})
export class SystemAdminPolicyModule {}

