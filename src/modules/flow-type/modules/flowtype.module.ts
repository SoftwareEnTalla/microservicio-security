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
import { FlowTypeCommandController } from "../controllers/flowtypecommand.controller";
import { FlowTypeQueryController } from "../controllers/flowtypequery.controller";
import { FlowTypeCommandService } from "../services/flowtypecommand.service";
import { FlowTypeQueryService } from "../services/flowtypequery.service";

import { FlowTypeCommandRepository } from "../repositories/flowtypecommand.repository";
import { FlowTypeQueryRepository } from "../repositories/flowtypequery.repository";
import { FlowTypeRepository } from "../repositories/flowtype.repository";
import { FlowTypeResolver } from "../graphql/flowtype.resolver";
import { FlowTypeAuthGuard } from "../guards/flowtypeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlowType } from "../entities/flow-type.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateFlowTypeHandler } from "../commands/handlers/createflowtype.handler";
import { UpdateFlowTypeHandler } from "../commands/handlers/updateflowtype.handler";
import { DeleteFlowTypeHandler } from "../commands/handlers/deleteflowtype.handler";
import { GetFlowTypeByIdHandler } from "../queries/handlers/getflowtypebyid.handler";
import { GetFlowTypeByFieldHandler } from "../queries/handlers/getflowtypebyfield.handler";
import { GetAllFlowTypeHandler } from "../queries/handlers/getallflowtype.handler";
import { FlowTypeCrudSaga } from "../sagas/flowtype-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { FlowTypeInterceptor } from "../interceptors/flowtype.interceptor";
import { FlowTypeLoggingInterceptor } from "../interceptors/flowtype.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, FlowType]), // Incluir BaseEntity para herencia
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
  controllers: [FlowTypeCommandController, FlowTypeQueryController],
  providers: [
    //Services
    EventStoreService,
    FlowTypeQueryService,
    FlowTypeCommandService,
  
    //Repositories
    FlowTypeCommandRepository,
    FlowTypeQueryRepository,
    FlowTypeRepository,      
    //Resolvers
    FlowTypeResolver,
    //Guards
    FlowTypeAuthGuard,
    //Interceptors
    FlowTypeInterceptor,
    FlowTypeLoggingInterceptor,
    //CQRS Handlers
    CreateFlowTypeHandler,
    UpdateFlowTypeHandler,
    DeleteFlowTypeHandler,
    GetFlowTypeByIdHandler,
    GetFlowTypeByFieldHandler,
    GetAllFlowTypeHandler,
    FlowTypeCrudSaga,
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
    FlowTypeQueryService,
    FlowTypeCommandService,
  
    //Repositories
    FlowTypeCommandRepository,
    FlowTypeQueryRepository,
    FlowTypeRepository,      
    //Resolvers
    FlowTypeResolver,
    //Guards
    FlowTypeAuthGuard,
    //Interceptors
    FlowTypeInterceptor,
    FlowTypeLoggingInterceptor,
  ],
})
export class FlowTypeModule {}

