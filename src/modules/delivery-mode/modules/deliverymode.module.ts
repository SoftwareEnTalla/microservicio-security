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
import { DeliveryModeCommandController } from "../controllers/deliverymodecommand.controller";
import { DeliveryModeQueryController } from "../controllers/deliverymodequery.controller";
import { DeliveryModeCommandService } from "../services/deliverymodecommand.service";
import { DeliveryModeQueryService } from "../services/deliverymodequery.service";

import { DeliveryModeCommandRepository } from "../repositories/deliverymodecommand.repository";
import { DeliveryModeQueryRepository } from "../repositories/deliverymodequery.repository";
import { DeliveryModeRepository } from "../repositories/deliverymode.repository";
import { DeliveryModeResolver } from "../graphql/deliverymode.resolver";
import { DeliveryModeAuthGuard } from "../guards/deliverymodeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeliveryMode } from "../entities/delivery-mode.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateDeliveryModeHandler } from "../commands/handlers/createdeliverymode.handler";
import { UpdateDeliveryModeHandler } from "../commands/handlers/updatedeliverymode.handler";
import { DeleteDeliveryModeHandler } from "../commands/handlers/deletedeliverymode.handler";
import { GetDeliveryModeByIdHandler } from "../queries/handlers/getdeliverymodebyid.handler";
import { GetDeliveryModeByFieldHandler } from "../queries/handlers/getdeliverymodebyfield.handler";
import { GetAllDeliveryModeHandler } from "../queries/handlers/getalldeliverymode.handler";
import { DeliveryModeCrudSaga } from "../sagas/deliverymode-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { DeliveryModeInterceptor } from "../interceptors/deliverymode.interceptor";
import { DeliveryModeLoggingInterceptor } from "../interceptors/deliverymode.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, DeliveryMode]), // Incluir BaseEntity para herencia
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
  controllers: [DeliveryModeCommandController, DeliveryModeQueryController],
  providers: [
    //Services
    EventStoreService,
    DeliveryModeQueryService,
    DeliveryModeCommandService,
  
    //Repositories
    DeliveryModeCommandRepository,
    DeliveryModeQueryRepository,
    DeliveryModeRepository,      
    //Resolvers
    DeliveryModeResolver,
    //Guards
    DeliveryModeAuthGuard,
    //Interceptors
    DeliveryModeInterceptor,
    DeliveryModeLoggingInterceptor,
    //CQRS Handlers
    CreateDeliveryModeHandler,
    UpdateDeliveryModeHandler,
    DeleteDeliveryModeHandler,
    GetDeliveryModeByIdHandler,
    GetDeliveryModeByFieldHandler,
    GetAllDeliveryModeHandler,
    DeliveryModeCrudSaga,
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
    DeliveryModeQueryService,
    DeliveryModeCommandService,
  
    //Repositories
    DeliveryModeCommandRepository,
    DeliveryModeQueryRepository,
    DeliveryModeRepository,      
    //Resolvers
    DeliveryModeResolver,
    //Guards
    DeliveryModeAuthGuard,
    //Interceptors
    DeliveryModeInterceptor,
    DeliveryModeLoggingInterceptor,
  ],
})
export class DeliveryModeModule {}

