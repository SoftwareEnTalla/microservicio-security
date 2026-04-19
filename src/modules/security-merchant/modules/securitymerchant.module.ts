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
import { SecurityMerchantCommandController } from "../controllers/securitymerchantcommand.controller";
import { SecurityMerchantQueryController } from "../controllers/securitymerchantquery.controller";
import { SecurityMerchantCommandService } from "../services/securitymerchantcommand.service";
import { SecurityMerchantQueryService } from "../services/securitymerchantquery.service";

import { SecurityMerchantCommandRepository } from "../repositories/securitymerchantcommand.repository";
import { SecurityMerchantQueryRepository } from "../repositories/securitymerchantquery.repository";
import { SecurityMerchantRepository } from "../repositories/securitymerchant.repository";
import { SecurityMerchantResolver } from "../graphql/securitymerchant.resolver";
import { SecurityMerchantAuthGuard } from "../guards/securitymerchantauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityMerchant } from "../entities/security-merchant.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSecurityMerchantHandler } from "../commands/handlers/createsecuritymerchant.handler";
import { UpdateSecurityMerchantHandler } from "../commands/handlers/updatesecuritymerchant.handler";
import { DeleteSecurityMerchantHandler } from "../commands/handlers/deletesecuritymerchant.handler";
import { GetSecurityMerchantByIdHandler } from "../queries/handlers/getsecuritymerchantbyid.handler";
import { GetSecurityMerchantByFieldHandler } from "../queries/handlers/getsecuritymerchantbyfield.handler";
import { GetAllSecurityMerchantHandler } from "../queries/handlers/getallsecuritymerchant.handler";
import { SecurityMerchantCrudSaga } from "../sagas/securitymerchant-crud.saga";
import { SecurityMerchantSyncCreatedSaga } from "../sagas/security-merchant-sync-created.saga";
import { SecurityMerchantSyncUpdatedSaga } from "../sagas/security-merchant-sync-updated.saga";import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SecurityMerchantInterceptor } from "../interceptors/securitymerchant.interceptor";
import { SecurityMerchantLoggingInterceptor } from "../interceptors/securitymerchant.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";
import { MerchantApprovalService } from "../services/merchant-approval.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, SecurityMerchant]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [SecurityMerchantCommandController, SecurityMerchantQueryController],
  providers: [
    //Services
    EventStoreService,
    SecurityMerchantQueryService,
    SecurityMerchantCommandService,
    MerchantApprovalService,
  
    //Repositories
    SecurityMerchantCommandRepository,
    SecurityMerchantQueryRepository,
    SecurityMerchantRepository,      
    //Resolvers
    SecurityMerchantResolver,
    //Guards
    SecurityMerchantAuthGuard,
    //Interceptors
    SecurityMerchantInterceptor,
    SecurityMerchantLoggingInterceptor,
    //CQRS Handlers
    CreateSecurityMerchantHandler,
    UpdateSecurityMerchantHandler,
    DeleteSecurityMerchantHandler,
    GetSecurityMerchantByIdHandler,
    GetSecurityMerchantByFieldHandler,
    GetAllSecurityMerchantHandler,
    SecurityMerchantCrudSaga,
    SecurityMerchantSyncCreatedSaga,
    SecurityMerchantSyncUpdatedSaga,    //Configurations
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
    SecurityMerchantQueryService,
    SecurityMerchantCommandService,
    MerchantApprovalService,
  
    //Repositories
    SecurityMerchantCommandRepository,
    SecurityMerchantQueryRepository,
    SecurityMerchantRepository,      
    //Resolvers
    SecurityMerchantResolver,
    //Guards
    SecurityMerchantAuthGuard,
    //Interceptors
    SecurityMerchantInterceptor,
    SecurityMerchantLoggingInterceptor,
  ],
})
export class SecurityMerchantModule {}

