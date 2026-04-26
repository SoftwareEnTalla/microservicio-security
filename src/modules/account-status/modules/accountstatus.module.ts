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
import { AccountStatusCommandController } from "../controllers/accountstatuscommand.controller";
import { AccountStatusQueryController } from "../controllers/accountstatusquery.controller";
import { AccountStatusCommandService } from "../services/accountstatuscommand.service";
import { AccountStatusQueryService } from "../services/accountstatusquery.service";

import { AccountStatusCommandRepository } from "../repositories/accountstatuscommand.repository";
import { AccountStatusQueryRepository } from "../repositories/accountstatusquery.repository";
import { AccountStatusRepository } from "../repositories/accountstatus.repository";
import { AccountStatusResolver } from "../graphql/accountstatus.resolver";
import { AccountStatusAuthGuard } from "../guards/accountstatusauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountStatus } from "../entities/account-status.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateAccountStatusHandler } from "../commands/handlers/createaccountstatus.handler";
import { UpdateAccountStatusHandler } from "../commands/handlers/updateaccountstatus.handler";
import { DeleteAccountStatusHandler } from "../commands/handlers/deleteaccountstatus.handler";
import { GetAccountStatusByIdHandler } from "../queries/handlers/getaccountstatusbyid.handler";
import { GetAccountStatusByFieldHandler } from "../queries/handlers/getaccountstatusbyfield.handler";
import { GetAllAccountStatusHandler } from "../queries/handlers/getallaccountstatus.handler";
import { AccountStatusCrudSaga } from "../sagas/accountstatus-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { AccountStatusInterceptor } from "../interceptors/accountstatus.interceptor";
import { AccountStatusLoggingInterceptor } from "../interceptors/accountstatus.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, AccountStatus]), // Incluir BaseEntity para herencia
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
  controllers: [AccountStatusCommandController, AccountStatusQueryController],
  providers: [
    //Services
    EventStoreService,
    AccountStatusQueryService,
    AccountStatusCommandService,
  
    //Repositories
    AccountStatusCommandRepository,
    AccountStatusQueryRepository,
    AccountStatusRepository,      
    //Resolvers
    AccountStatusResolver,
    //Guards
    AccountStatusAuthGuard,
    //Interceptors
    AccountStatusInterceptor,
    AccountStatusLoggingInterceptor,
    //CQRS Handlers
    CreateAccountStatusHandler,
    UpdateAccountStatusHandler,
    DeleteAccountStatusHandler,
    GetAccountStatusByIdHandler,
    GetAccountStatusByFieldHandler,
    GetAllAccountStatusHandler,
    AccountStatusCrudSaga,
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
    AccountStatusQueryService,
    AccountStatusCommandService,
  
    //Repositories
    AccountStatusCommandRepository,
    AccountStatusQueryRepository,
    AccountStatusRepository,      
    //Resolvers
    AccountStatusResolver,
    //Guards
    AccountStatusAuthGuard,
    //Interceptors
    AccountStatusInterceptor,
    AccountStatusLoggingInterceptor,
  ],
})
export class AccountStatusModule {}

