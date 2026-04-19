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
import { SalesManagerCommandController } from "../controllers/salesmanagercommand.controller";
import { SalesManagerQueryController } from "../controllers/salesmanagerquery.controller";
import { SalesManagerCommandService } from "../services/salesmanagercommand.service";
import { SalesManagerQueryService } from "../services/salesmanagerquery.service";

import { SalesManagerCommandRepository } from "../repositories/salesmanagercommand.repository";
import { SalesManagerQueryRepository } from "../repositories/salesmanagerquery.repository";
import { SalesManagerRepository } from "../repositories/salesmanager.repository";
import { SalesManagerResolver } from "../graphql/salesmanager.resolver";
import { SalesManagerAuthGuard } from "../guards/salesmanagerauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SalesManager } from "../entities/sales-manager.entity";
import { BaseEntity } from "../entities/base.entity";
import { User } from "../../user/entities/user.entity";
import { BaseEntity as UserBaseEntity } from "../../user/entities/base.entity";
import { SalesManagerReferralService } from "../services/sales-manager-referral.service";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSalesManagerHandler } from "../commands/handlers/createsalesmanager.handler";
import { UpdateSalesManagerHandler } from "../commands/handlers/updatesalesmanager.handler";
import { DeleteSalesManagerHandler } from "../commands/handlers/deletesalesmanager.handler";
import { GetSalesManagerByIdHandler } from "../queries/handlers/getsalesmanagerbyid.handler";
import { GetSalesManagerByFieldHandler } from "../queries/handlers/getsalesmanagerbyfield.handler";
import { GetAllSalesManagerHandler } from "../queries/handlers/getallsalesmanager.handler";
import { SalesManagerCrudSaga } from "../sagas/salesmanager-crud.saga";
import { SecuritySalesManagerSyncCreatedSaga } from "../sagas/security-sales-manager-sync-created.saga";
import { SecuritySalesManagerSyncUpdatedSaga } from "../sagas/security-sales-manager-sync-updated.saga";import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SalesManagerInterceptor } from "../interceptors/salesmanager.interceptor";
import { SalesManagerLoggingInterceptor } from "../interceptors/salesmanager.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, SalesManager, UserBaseEntity, User]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [SalesManagerCommandController, SalesManagerQueryController],
  providers: [
    //Services
    EventStoreService,
    SalesManagerQueryService,
    SalesManagerCommandService,
    SalesManagerReferralService,
  
    //Repositories
    SalesManagerCommandRepository,
    SalesManagerQueryRepository,
    SalesManagerRepository,      
    //Resolvers
    SalesManagerResolver,
    //Guards
    SalesManagerAuthGuard,
    //Interceptors
    SalesManagerInterceptor,
    SalesManagerLoggingInterceptor,
    //CQRS Handlers
    CreateSalesManagerHandler,
    UpdateSalesManagerHandler,
    DeleteSalesManagerHandler,
    GetSalesManagerByIdHandler,
    GetSalesManagerByFieldHandler,
    GetAllSalesManagerHandler,
    SalesManagerCrudSaga,
    SecuritySalesManagerSyncCreatedSaga,
    SecuritySalesManagerSyncUpdatedSaga,    //Configurations
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
    SalesManagerQueryService,
    SalesManagerCommandService,
    SalesManagerReferralService,
  
    //Repositories
    SalesManagerCommandRepository,
    SalesManagerQueryRepository,
    SalesManagerRepository,      
    //Resolvers
    SalesManagerResolver,
    //Guards
    SalesManagerAuthGuard,
    //Interceptors
    SalesManagerInterceptor,
    SalesManagerLoggingInterceptor,
  ],
})
export class SalesManagerModule {}

