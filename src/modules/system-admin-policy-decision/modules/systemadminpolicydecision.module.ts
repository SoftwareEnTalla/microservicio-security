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
import { SystemAdminPolicyDecisionCommandController } from "../controllers/systemadminpolicydecisioncommand.controller";
import { SystemAdminPolicyDecisionQueryController } from "../controllers/systemadminpolicydecisionquery.controller";
import { SystemAdminPolicyDecisionCommandService } from "../services/systemadminpolicydecisioncommand.service";
import { SystemAdminPolicyDecisionQueryService } from "../services/systemadminpolicydecisionquery.service";

import { SystemAdminPolicyDecisionCommandRepository } from "../repositories/systemadminpolicydecisioncommand.repository";
import { SystemAdminPolicyDecisionQueryRepository } from "../repositories/systemadminpolicydecisionquery.repository";
import { SystemAdminPolicyDecisionRepository } from "../repositories/systemadminpolicydecision.repository";
import { SystemAdminPolicyDecisionResolver } from "../graphql/systemadminpolicydecision.resolver";
import { SystemAdminPolicyDecisionAuthGuard } from "../guards/systemadminpolicydecisionauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SystemAdminPolicyDecision } from "../entities/system-admin-policy-decision.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSystemAdminPolicyDecisionHandler } from "../commands/handlers/createsystemadminpolicydecision.handler";
import { UpdateSystemAdminPolicyDecisionHandler } from "../commands/handlers/updatesystemadminpolicydecision.handler";
import { DeleteSystemAdminPolicyDecisionHandler } from "../commands/handlers/deletesystemadminpolicydecision.handler";
import { GetSystemAdminPolicyDecisionByIdHandler } from "../queries/handlers/getsystemadminpolicydecisionbyid.handler";
import { GetSystemAdminPolicyDecisionByFieldHandler } from "../queries/handlers/getsystemadminpolicydecisionbyfield.handler";
import { GetAllSystemAdminPolicyDecisionHandler } from "../queries/handlers/getallsystemadminpolicydecision.handler";
import { SystemAdminPolicyDecisionCrudSaga } from "../sagas/systemadminpolicydecision-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SystemAdminPolicyDecisionInterceptor } from "../interceptors/systemadminpolicydecision.interceptor";
import { SystemAdminPolicyDecisionLoggingInterceptor } from "../interceptors/systemadminpolicydecision.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, SystemAdminPolicyDecision]), // Incluir BaseEntity para herencia
    CacheModule.registerAsync({
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: { host: process.env.REDIS_HOST || "data-center-redis", port: parseInt(process.env.REDIS_PORT || "6379", 10) },
            ttl: parseInt(process.env.REDIS_TTL || "60", 10),
          });
          return { store: store as any, isGlobal: true };
        } catch {
          return { isGlobal: true }; // fallback in-memory
        }
      },
    }),
  ],
  controllers: [SystemAdminPolicyDecisionCommandController, SystemAdminPolicyDecisionQueryController],
  providers: [
    //Services
    EventStoreService,
    SystemAdminPolicyDecisionQueryService,
    SystemAdminPolicyDecisionCommandService,
  
    //Repositories
    SystemAdminPolicyDecisionCommandRepository,
    SystemAdminPolicyDecisionQueryRepository,
    SystemAdminPolicyDecisionRepository,      
    //Resolvers
    SystemAdminPolicyDecisionResolver,
    //Guards
    SystemAdminPolicyDecisionAuthGuard,
    //Interceptors
    SystemAdminPolicyDecisionInterceptor,
    SystemAdminPolicyDecisionLoggingInterceptor,
    //CQRS Handlers
    CreateSystemAdminPolicyDecisionHandler,
    UpdateSystemAdminPolicyDecisionHandler,
    DeleteSystemAdminPolicyDecisionHandler,
    GetSystemAdminPolicyDecisionByIdHandler,
    GetSystemAdminPolicyDecisionByFieldHandler,
    GetAllSystemAdminPolicyDecisionHandler,
    SystemAdminPolicyDecisionCrudSaga,
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
    SystemAdminPolicyDecisionQueryService,
    SystemAdminPolicyDecisionCommandService,
  
    //Repositories
    SystemAdminPolicyDecisionCommandRepository,
    SystemAdminPolicyDecisionQueryRepository,
    SystemAdminPolicyDecisionRepository,      
    //Resolvers
    SystemAdminPolicyDecisionResolver,
    //Guards
    SystemAdminPolicyDecisionAuthGuard,
    //Interceptors
    SystemAdminPolicyDecisionInterceptor,
    SystemAdminPolicyDecisionLoggingInterceptor,
  ],
})
export class SystemAdminPolicyDecisionModule {}

