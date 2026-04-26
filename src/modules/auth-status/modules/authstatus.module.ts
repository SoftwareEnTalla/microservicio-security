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
import { AuthStatusCommandController } from "../controllers/authstatuscommand.controller";
import { AuthStatusQueryController } from "../controllers/authstatusquery.controller";
import { AuthStatusCommandService } from "../services/authstatuscommand.service";
import { AuthStatusQueryService } from "../services/authstatusquery.service";

import { AuthStatusCommandRepository } from "../repositories/authstatuscommand.repository";
import { AuthStatusQueryRepository } from "../repositories/authstatusquery.repository";
import { AuthStatusRepository } from "../repositories/authstatus.repository";
import { AuthStatusResolver } from "../graphql/authstatus.resolver";
import { AuthStatusAuthGuard } from "../guards/authstatusauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthStatus } from "../entities/auth-status.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateAuthStatusHandler } from "../commands/handlers/createauthstatus.handler";
import { UpdateAuthStatusHandler } from "../commands/handlers/updateauthstatus.handler";
import { DeleteAuthStatusHandler } from "../commands/handlers/deleteauthstatus.handler";
import { GetAuthStatusByIdHandler } from "../queries/handlers/getauthstatusbyid.handler";
import { GetAuthStatusByFieldHandler } from "../queries/handlers/getauthstatusbyfield.handler";
import { GetAllAuthStatusHandler } from "../queries/handlers/getallauthstatus.handler";
import { AuthStatusCrudSaga } from "../sagas/authstatus-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { AuthStatusInterceptor } from "../interceptors/authstatus.interceptor";
import { AuthStatusLoggingInterceptor } from "../interceptors/authstatus.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, AuthStatus]), // Incluir BaseEntity para herencia
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
  controllers: [AuthStatusCommandController, AuthStatusQueryController],
  providers: [
    //Services
    EventStoreService,
    AuthStatusQueryService,
    AuthStatusCommandService,
  
    //Repositories
    AuthStatusCommandRepository,
    AuthStatusQueryRepository,
    AuthStatusRepository,      
    //Resolvers
    AuthStatusResolver,
    //Guards
    AuthStatusAuthGuard,
    //Interceptors
    AuthStatusInterceptor,
    AuthStatusLoggingInterceptor,
    //CQRS Handlers
    CreateAuthStatusHandler,
    UpdateAuthStatusHandler,
    DeleteAuthStatusHandler,
    GetAuthStatusByIdHandler,
    GetAuthStatusByFieldHandler,
    GetAllAuthStatusHandler,
    AuthStatusCrudSaga,
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
    AuthStatusQueryService,
    AuthStatusCommandService,
  
    //Repositories
    AuthStatusCommandRepository,
    AuthStatusQueryRepository,
    AuthStatusRepository,      
    //Resolvers
    AuthStatusResolver,
    //Guards
    AuthStatusAuthGuard,
    //Interceptors
    AuthStatusInterceptor,
    AuthStatusLoggingInterceptor,
  ],
})
export class AuthStatusModule {}

