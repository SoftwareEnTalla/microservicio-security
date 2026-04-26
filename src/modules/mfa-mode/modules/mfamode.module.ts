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
import { MfaModeCommandController } from "../controllers/mfamodecommand.controller";
import { MfaModeQueryController } from "../controllers/mfamodequery.controller";
import { MfaModeCommandService } from "../services/mfamodecommand.service";
import { MfaModeQueryService } from "../services/mfamodequery.service";

import { MfaModeCommandRepository } from "../repositories/mfamodecommand.repository";
import { MfaModeQueryRepository } from "../repositories/mfamodequery.repository";
import { MfaModeRepository } from "../repositories/mfamode.repository";
import { MfaModeResolver } from "../graphql/mfamode.resolver";
import { MfaModeAuthGuard } from "../guards/mfamodeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MfaMode } from "../entities/mfa-mode.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateMfaModeHandler } from "../commands/handlers/createmfamode.handler";
import { UpdateMfaModeHandler } from "../commands/handlers/updatemfamode.handler";
import { DeleteMfaModeHandler } from "../commands/handlers/deletemfamode.handler";
import { GetMfaModeByIdHandler } from "../queries/handlers/getmfamodebyid.handler";
import { GetMfaModeByFieldHandler } from "../queries/handlers/getmfamodebyfield.handler";
import { GetAllMfaModeHandler } from "../queries/handlers/getallmfamode.handler";
import { MfaModeCrudSaga } from "../sagas/mfamode-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { MfaModeInterceptor } from "../interceptors/mfamode.interceptor";
import { MfaModeLoggingInterceptor } from "../interceptors/mfamode.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, MfaMode]), // Incluir BaseEntity para herencia
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
  controllers: [MfaModeCommandController, MfaModeQueryController],
  providers: [
    //Services
    EventStoreService,
    MfaModeQueryService,
    MfaModeCommandService,
  
    //Repositories
    MfaModeCommandRepository,
    MfaModeQueryRepository,
    MfaModeRepository,      
    //Resolvers
    MfaModeResolver,
    //Guards
    MfaModeAuthGuard,
    //Interceptors
    MfaModeInterceptor,
    MfaModeLoggingInterceptor,
    //CQRS Handlers
    CreateMfaModeHandler,
    UpdateMfaModeHandler,
    DeleteMfaModeHandler,
    GetMfaModeByIdHandler,
    GetMfaModeByFieldHandler,
    GetAllMfaModeHandler,
    MfaModeCrudSaga,
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
    MfaModeQueryService,
    MfaModeCommandService,
  
    //Repositories
    MfaModeCommandRepository,
    MfaModeQueryRepository,
    MfaModeRepository,      
    //Resolvers
    MfaModeResolver,
    //Guards
    MfaModeAuthGuard,
    //Interceptors
    MfaModeInterceptor,
    MfaModeLoggingInterceptor,
  ],
})
export class MfaModeModule {}

