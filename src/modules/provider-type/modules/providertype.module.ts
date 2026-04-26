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
import { ProviderTypeCommandController } from "../controllers/providertypecommand.controller";
import { ProviderTypeQueryController } from "../controllers/providertypequery.controller";
import { ProviderTypeCommandService } from "../services/providertypecommand.service";
import { ProviderTypeQueryService } from "../services/providertypequery.service";

import { ProviderTypeCommandRepository } from "../repositories/providertypecommand.repository";
import { ProviderTypeQueryRepository } from "../repositories/providertypequery.repository";
import { ProviderTypeRepository } from "../repositories/providertype.repository";
import { ProviderTypeResolver } from "../graphql/providertype.resolver";
import { ProviderTypeAuthGuard } from "../guards/providertypeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProviderType } from "../entities/provider-type.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateProviderTypeHandler } from "../commands/handlers/createprovidertype.handler";
import { UpdateProviderTypeHandler } from "../commands/handlers/updateprovidertype.handler";
import { DeleteProviderTypeHandler } from "../commands/handlers/deleteprovidertype.handler";
import { GetProviderTypeByIdHandler } from "../queries/handlers/getprovidertypebyid.handler";
import { GetProviderTypeByFieldHandler } from "../queries/handlers/getprovidertypebyfield.handler";
import { GetAllProviderTypeHandler } from "../queries/handlers/getallprovidertype.handler";
import { ProviderTypeCrudSaga } from "../sagas/providertype-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { ProviderTypeInterceptor } from "../interceptors/providertype.interceptor";
import { ProviderTypeLoggingInterceptor } from "../interceptors/providertype.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, ProviderType]), // Incluir BaseEntity para herencia
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
  controllers: [ProviderTypeCommandController, ProviderTypeQueryController],
  providers: [
    //Services
    EventStoreService,
    ProviderTypeQueryService,
    ProviderTypeCommandService,
  
    //Repositories
    ProviderTypeCommandRepository,
    ProviderTypeQueryRepository,
    ProviderTypeRepository,      
    //Resolvers
    ProviderTypeResolver,
    //Guards
    ProviderTypeAuthGuard,
    //Interceptors
    ProviderTypeInterceptor,
    ProviderTypeLoggingInterceptor,
    //CQRS Handlers
    CreateProviderTypeHandler,
    UpdateProviderTypeHandler,
    DeleteProviderTypeHandler,
    GetProviderTypeByIdHandler,
    GetProviderTypeByFieldHandler,
    GetAllProviderTypeHandler,
    ProviderTypeCrudSaga,
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
    ProviderTypeQueryService,
    ProviderTypeCommandService,
  
    //Repositories
    ProviderTypeCommandRepository,
    ProviderTypeQueryRepository,
    ProviderTypeRepository,      
    //Resolvers
    ProviderTypeResolver,
    //Guards
    ProviderTypeAuthGuard,
    //Interceptors
    ProviderTypeInterceptor,
    ProviderTypeLoggingInterceptor,
  ],
})
export class ProviderTypeModule {}

