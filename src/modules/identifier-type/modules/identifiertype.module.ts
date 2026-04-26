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
import { IdentifierTypeCommandController } from "../controllers/identifiertypecommand.controller";
import { IdentifierTypeQueryController } from "../controllers/identifiertypequery.controller";
import { IdentifierTypeCommandService } from "../services/identifiertypecommand.service";
import { IdentifierTypeQueryService } from "../services/identifiertypequery.service";

import { IdentifierTypeCommandRepository } from "../repositories/identifiertypecommand.repository";
import { IdentifierTypeQueryRepository } from "../repositories/identifiertypequery.repository";
import { IdentifierTypeRepository } from "../repositories/identifiertype.repository";
import { IdentifierTypeResolver } from "../graphql/identifiertype.resolver";
import { IdentifierTypeAuthGuard } from "../guards/identifiertypeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IdentifierType } from "../entities/identifier-type.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateIdentifierTypeHandler } from "../commands/handlers/createidentifiertype.handler";
import { UpdateIdentifierTypeHandler } from "../commands/handlers/updateidentifiertype.handler";
import { DeleteIdentifierTypeHandler } from "../commands/handlers/deleteidentifiertype.handler";
import { GetIdentifierTypeByIdHandler } from "../queries/handlers/getidentifiertypebyid.handler";
import { GetIdentifierTypeByFieldHandler } from "../queries/handlers/getidentifiertypebyfield.handler";
import { GetAllIdentifierTypeHandler } from "../queries/handlers/getallidentifiertype.handler";
import { IdentifierTypeCrudSaga } from "../sagas/identifiertype-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { IdentifierTypeInterceptor } from "../interceptors/identifiertype.interceptor";
import { IdentifierTypeLoggingInterceptor } from "../interceptors/identifiertype.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, IdentifierType]), // Incluir BaseEntity para herencia
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
  controllers: [IdentifierTypeCommandController, IdentifierTypeQueryController],
  providers: [
    //Services
    EventStoreService,
    IdentifierTypeQueryService,
    IdentifierTypeCommandService,
  
    //Repositories
    IdentifierTypeCommandRepository,
    IdentifierTypeQueryRepository,
    IdentifierTypeRepository,      
    //Resolvers
    IdentifierTypeResolver,
    //Guards
    IdentifierTypeAuthGuard,
    //Interceptors
    IdentifierTypeInterceptor,
    IdentifierTypeLoggingInterceptor,
    //CQRS Handlers
    CreateIdentifierTypeHandler,
    UpdateIdentifierTypeHandler,
    DeleteIdentifierTypeHandler,
    GetIdentifierTypeByIdHandler,
    GetIdentifierTypeByFieldHandler,
    GetAllIdentifierTypeHandler,
    IdentifierTypeCrudSaga,
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
    IdentifierTypeQueryService,
    IdentifierTypeCommandService,
  
    //Repositories
    IdentifierTypeCommandRepository,
    IdentifierTypeQueryRepository,
    IdentifierTypeRepository,      
    //Resolvers
    IdentifierTypeResolver,
    //Guards
    IdentifierTypeAuthGuard,
    //Interceptors
    IdentifierTypeInterceptor,
    IdentifierTypeLoggingInterceptor,
  ],
})
export class IdentifierTypeModule {}

