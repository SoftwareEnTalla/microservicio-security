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
import { AuthMethodCommandController } from "../controllers/authmethodcommand.controller";
import { AuthMethodQueryController } from "../controllers/authmethodquery.controller";
import { AuthMethodCommandService } from "../services/authmethodcommand.service";
import { AuthMethodQueryService } from "../services/authmethodquery.service";

import { AuthMethodCommandRepository } from "../repositories/authmethodcommand.repository";
import { AuthMethodQueryRepository } from "../repositories/authmethodquery.repository";
import { AuthMethodRepository } from "../repositories/authmethod.repository";
import { AuthMethodResolver } from "../graphql/authmethod.resolver";
import { AuthMethodAuthGuard } from "../guards/authmethodauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthMethod } from "../entities/auth-method.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateAuthMethodHandler } from "../commands/handlers/createauthmethod.handler";
import { UpdateAuthMethodHandler } from "../commands/handlers/updateauthmethod.handler";
import { DeleteAuthMethodHandler } from "../commands/handlers/deleteauthmethod.handler";
import { GetAuthMethodByIdHandler } from "../queries/handlers/getauthmethodbyid.handler";
import { GetAuthMethodByFieldHandler } from "../queries/handlers/getauthmethodbyfield.handler";
import { GetAllAuthMethodHandler } from "../queries/handlers/getallauthmethod.handler";
import { AuthMethodCrudSaga } from "../sagas/authmethod-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { AuthMethodInterceptor } from "../interceptors/authmethod.interceptor";
import { AuthMethodLoggingInterceptor } from "../interceptors/authmethod.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, AuthMethod]), // Incluir BaseEntity para herencia
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
  controllers: [AuthMethodCommandController, AuthMethodQueryController],
  providers: [
    //Services
    EventStoreService,
    AuthMethodQueryService,
    AuthMethodCommandService,
  
    //Repositories
    AuthMethodCommandRepository,
    AuthMethodQueryRepository,
    AuthMethodRepository,      
    //Resolvers
    AuthMethodResolver,
    //Guards
    AuthMethodAuthGuard,
    //Interceptors
    AuthMethodInterceptor,
    AuthMethodLoggingInterceptor,
    //CQRS Handlers
    CreateAuthMethodHandler,
    UpdateAuthMethodHandler,
    DeleteAuthMethodHandler,
    GetAuthMethodByIdHandler,
    GetAuthMethodByFieldHandler,
    GetAllAuthMethodHandler,
    AuthMethodCrudSaga,
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
    AuthMethodQueryService,
    AuthMethodCommandService,
  
    //Repositories
    AuthMethodCommandRepository,
    AuthMethodQueryRepository,
    AuthMethodRepository,      
    //Resolvers
    AuthMethodResolver,
    //Guards
    AuthMethodAuthGuard,
    //Interceptors
    AuthMethodInterceptor,
    AuthMethodLoggingInterceptor,
  ],
})
export class AuthMethodModule {}

