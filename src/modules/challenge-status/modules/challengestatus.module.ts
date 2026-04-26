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
import { ChallengeStatusCommandController } from "../controllers/challengestatuscommand.controller";
import { ChallengeStatusQueryController } from "../controllers/challengestatusquery.controller";
import { ChallengeStatusCommandService } from "../services/challengestatuscommand.service";
import { ChallengeStatusQueryService } from "../services/challengestatusquery.service";

import { ChallengeStatusCommandRepository } from "../repositories/challengestatuscommand.repository";
import { ChallengeStatusQueryRepository } from "../repositories/challengestatusquery.repository";
import { ChallengeStatusRepository } from "../repositories/challengestatus.repository";
import { ChallengeStatusResolver } from "../graphql/challengestatus.resolver";
import { ChallengeStatusAuthGuard } from "../guards/challengestatusauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChallengeStatus } from "../entities/challenge-status.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateChallengeStatusHandler } from "../commands/handlers/createchallengestatus.handler";
import { UpdateChallengeStatusHandler } from "../commands/handlers/updatechallengestatus.handler";
import { DeleteChallengeStatusHandler } from "../commands/handlers/deletechallengestatus.handler";
import { GetChallengeStatusByIdHandler } from "../queries/handlers/getchallengestatusbyid.handler";
import { GetChallengeStatusByFieldHandler } from "../queries/handlers/getchallengestatusbyfield.handler";
import { GetAllChallengeStatusHandler } from "../queries/handlers/getallchallengestatus.handler";
import { ChallengeStatusCrudSaga } from "../sagas/challengestatus-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { ChallengeStatusInterceptor } from "../interceptors/challengestatus.interceptor";
import { ChallengeStatusLoggingInterceptor } from "../interceptors/challengestatus.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, ChallengeStatus]), // Incluir BaseEntity para herencia
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
  controllers: [ChallengeStatusCommandController, ChallengeStatusQueryController],
  providers: [
    //Services
    EventStoreService,
    ChallengeStatusQueryService,
    ChallengeStatusCommandService,
  
    //Repositories
    ChallengeStatusCommandRepository,
    ChallengeStatusQueryRepository,
    ChallengeStatusRepository,      
    //Resolvers
    ChallengeStatusResolver,
    //Guards
    ChallengeStatusAuthGuard,
    //Interceptors
    ChallengeStatusInterceptor,
    ChallengeStatusLoggingInterceptor,
    //CQRS Handlers
    CreateChallengeStatusHandler,
    UpdateChallengeStatusHandler,
    DeleteChallengeStatusHandler,
    GetChallengeStatusByIdHandler,
    GetChallengeStatusByFieldHandler,
    GetAllChallengeStatusHandler,
    ChallengeStatusCrudSaga,
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
    ChallengeStatusQueryService,
    ChallengeStatusCommandService,
  
    //Repositories
    ChallengeStatusCommandRepository,
    ChallengeStatusQueryRepository,
    ChallengeStatusRepository,      
    //Resolvers
    ChallengeStatusResolver,
    //Guards
    ChallengeStatusAuthGuard,
    //Interceptors
    ChallengeStatusInterceptor,
    ChallengeStatusLoggingInterceptor,
  ],
})
export class ChallengeStatusModule {}

