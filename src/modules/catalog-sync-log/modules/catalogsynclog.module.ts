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
import { CatalogSyncLogCommandController } from "../controllers/catalogsynclogcommand.controller";
import { CatalogSyncLogQueryController } from "../controllers/catalogsynclogquery.controller";
import { CatalogSyncLogCommandService } from "../services/catalogsynclogcommand.service";
import { CatalogSyncLogQueryService } from "../services/catalogsynclogquery.service";

import { CatalogSyncLogCommandRepository } from "../repositories/catalogsynclogcommand.repository";
import { CatalogSyncLogQueryRepository } from "../repositories/catalogsynclogquery.repository";
import { CatalogSyncLogRepository } from "../repositories/catalogsynclog.repository";
import { CatalogSyncLogResolver } from "../graphql/catalogsynclog.resolver";
import { CatalogSyncLogAuthGuard } from "../guards/catalogsynclogauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CatalogSyncLog } from "../entities/catalog-sync-log.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateCatalogSyncLogHandler } from "../commands/handlers/createcatalogsynclog.handler";
import { UpdateCatalogSyncLogHandler } from "../commands/handlers/updatecatalogsynclog.handler";
import { DeleteCatalogSyncLogHandler } from "../commands/handlers/deletecatalogsynclog.handler";
import { GetCatalogSyncLogByIdHandler } from "../queries/handlers/getcatalogsynclogbyid.handler";
import { GetCatalogSyncLogByFieldHandler } from "../queries/handlers/getcatalogsynclogbyfield.handler";
import { GetAllCatalogSyncLogHandler } from "../queries/handlers/getallcatalogsynclog.handler";
import { CatalogSyncLogCrudSaga } from "../sagas/catalogsynclog-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { CatalogSyncLogInterceptor } from "../interceptors/catalogsynclog.interceptor";
import { CatalogSyncLogLoggingInterceptor } from "../interceptors/catalogsynclog.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, CatalogSyncLog]), // Incluir BaseEntity para herencia
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
  controllers: [CatalogSyncLogCommandController, CatalogSyncLogQueryController],
  providers: [
    //Services
    EventStoreService,
    CatalogSyncLogQueryService,
    CatalogSyncLogCommandService,
  
    //Repositories
    CatalogSyncLogCommandRepository,
    CatalogSyncLogQueryRepository,
    CatalogSyncLogRepository,      
    //Resolvers
    CatalogSyncLogResolver,
    //Guards
    CatalogSyncLogAuthGuard,
    //Interceptors
    CatalogSyncLogInterceptor,
    CatalogSyncLogLoggingInterceptor,
    //CQRS Handlers
    CreateCatalogSyncLogHandler,
    UpdateCatalogSyncLogHandler,
    DeleteCatalogSyncLogHandler,
    GetCatalogSyncLogByIdHandler,
    GetCatalogSyncLogByFieldHandler,
    GetAllCatalogSyncLogHandler,
    CatalogSyncLogCrudSaga,
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
    CatalogSyncLogQueryService,
    CatalogSyncLogCommandService,
  
    //Repositories
    CatalogSyncLogCommandRepository,
    CatalogSyncLogQueryRepository,
    CatalogSyncLogRepository,      
    //Resolvers
    CatalogSyncLogResolver,
    //Guards
    CatalogSyncLogAuthGuard,
    //Interceptors
    CatalogSyncLogInterceptor,
    CatalogSyncLogLoggingInterceptor,
  ],
})
export class CatalogSyncLogModule {}

