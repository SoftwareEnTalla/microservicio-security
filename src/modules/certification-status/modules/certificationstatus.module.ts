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
import { CertificationStatusCommandController } from "../controllers/certificationstatuscommand.controller";
import { CertificationStatusQueryController } from "../controllers/certificationstatusquery.controller";
import { CertificationStatusCommandService } from "../services/certificationstatuscommand.service";
import { CertificationStatusQueryService } from "../services/certificationstatusquery.service";

import { CertificationStatusCommandRepository } from "../repositories/certificationstatuscommand.repository";
import { CertificationStatusQueryRepository } from "../repositories/certificationstatusquery.repository";
import { CertificationStatusRepository } from "../repositories/certificationstatus.repository";
import { CertificationStatusResolver } from "../graphql/certificationstatus.resolver";
import { CertificationStatusAuthGuard } from "../guards/certificationstatusauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CertificationStatus } from "../entities/certification-status.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateCertificationStatusHandler } from "../commands/handlers/createcertificationstatus.handler";
import { UpdateCertificationStatusHandler } from "../commands/handlers/updatecertificationstatus.handler";
import { DeleteCertificationStatusHandler } from "../commands/handlers/deletecertificationstatus.handler";
import { GetCertificationStatusByIdHandler } from "../queries/handlers/getcertificationstatusbyid.handler";
import { GetCertificationStatusByFieldHandler } from "../queries/handlers/getcertificationstatusbyfield.handler";
import { GetAllCertificationStatusHandler } from "../queries/handlers/getallcertificationstatus.handler";
import { CertificationStatusCrudSaga } from "../sagas/certificationstatus-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { CertificationStatusInterceptor } from "../interceptors/certificationstatus.interceptor";
import { CertificationStatusLoggingInterceptor } from "../interceptors/certificationstatus.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, CertificationStatus]), // Incluir BaseEntity para herencia
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
  controllers: [CertificationStatusCommandController, CertificationStatusQueryController],
  providers: [
    //Services
    EventStoreService,
    CertificationStatusQueryService,
    CertificationStatusCommandService,
  
    //Repositories
    CertificationStatusCommandRepository,
    CertificationStatusQueryRepository,
    CertificationStatusRepository,      
    //Resolvers
    CertificationStatusResolver,
    //Guards
    CertificationStatusAuthGuard,
    //Interceptors
    CertificationStatusInterceptor,
    CertificationStatusLoggingInterceptor,
    //CQRS Handlers
    CreateCertificationStatusHandler,
    UpdateCertificationStatusHandler,
    DeleteCertificationStatusHandler,
    GetCertificationStatusByIdHandler,
    GetCertificationStatusByFieldHandler,
    GetAllCertificationStatusHandler,
    CertificationStatusCrudSaga,
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
    CertificationStatusQueryService,
    CertificationStatusCommandService,
  
    //Repositories
    CertificationStatusCommandRepository,
    CertificationStatusQueryRepository,
    CertificationStatusRepository,      
    //Resolvers
    CertificationStatusResolver,
    //Guards
    CertificationStatusAuthGuard,
    //Interceptors
    CertificationStatusInterceptor,
    CertificationStatusLoggingInterceptor,
  ],
})
export class CertificationStatusModule {}

