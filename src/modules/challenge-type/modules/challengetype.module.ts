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
import { ChallengeTypeCommandController } from "../controllers/challengetypecommand.controller";
import { ChallengeTypeQueryController } from "../controllers/challengetypequery.controller";
import { ChallengeTypeCommandService } from "../services/challengetypecommand.service";
import { ChallengeTypeQueryService } from "../services/challengetypequery.service";

import { ChallengeTypeCommandRepository } from "../repositories/challengetypecommand.repository";
import { ChallengeTypeQueryRepository } from "../repositories/challengetypequery.repository";
import { ChallengeTypeRepository } from "../repositories/challengetype.repository";
import { ChallengeTypeResolver } from "../graphql/challengetype.resolver";
import { ChallengeTypeAuthGuard } from "../guards/challengetypeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChallengeType } from "../entities/challenge-type.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateChallengeTypeHandler } from "../commands/handlers/createchallengetype.handler";
import { UpdateChallengeTypeHandler } from "../commands/handlers/updatechallengetype.handler";
import { DeleteChallengeTypeHandler } from "../commands/handlers/deletechallengetype.handler";
import { GetChallengeTypeByIdHandler } from "../queries/handlers/getchallengetypebyid.handler";
import { GetChallengeTypeByFieldHandler } from "../queries/handlers/getchallengetypebyfield.handler";
import { GetAllChallengeTypeHandler } from "../queries/handlers/getallchallengetype.handler";
import { ChallengeTypeCrudSaga } from "../sagas/challengetype-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { ChallengeTypeInterceptor } from "../interceptors/challengetype.interceptor";
import { ChallengeTypeLoggingInterceptor } from "../interceptors/challengetype.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, ChallengeType]), // Incluir BaseEntity para herencia
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
  controllers: [ChallengeTypeCommandController, ChallengeTypeQueryController],
  providers: [
    //Services
    EventStoreService,
    ChallengeTypeQueryService,
    ChallengeTypeCommandService,
  
    //Repositories
    ChallengeTypeCommandRepository,
    ChallengeTypeQueryRepository,
    ChallengeTypeRepository,      
    //Resolvers
    ChallengeTypeResolver,
    //Guards
    ChallengeTypeAuthGuard,
    //Interceptors
    ChallengeTypeInterceptor,
    ChallengeTypeLoggingInterceptor,
    //CQRS Handlers
    CreateChallengeTypeHandler,
    UpdateChallengeTypeHandler,
    DeleteChallengeTypeHandler,
    GetChallengeTypeByIdHandler,
    GetChallengeTypeByFieldHandler,
    GetAllChallengeTypeHandler,
    ChallengeTypeCrudSaga,
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
    ChallengeTypeQueryService,
    ChallengeTypeCommandService,
  
    //Repositories
    ChallengeTypeCommandRepository,
    ChallengeTypeQueryRepository,
    ChallengeTypeRepository,      
    //Resolvers
    ChallengeTypeResolver,
    //Guards
    ChallengeTypeAuthGuard,
    //Interceptors
    ChallengeTypeInterceptor,
    ChallengeTypeLoggingInterceptor,
  ],
})
export class ChallengeTypeModule {}

