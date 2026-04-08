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
import { SecurityMasterDataCommandController } from "../controllers/securitymasterdatacommand.controller";
import { SecurityMasterDataQueryController } from "../controllers/securitymasterdataquery.controller";
import { SecurityMasterDataCommandService } from "../services/securitymasterdatacommand.service";
import { SecurityMasterDataQueryService } from "../services/securitymasterdataquery.service";
import { SecurityMasterDataCommandRepository } from "../repositories/securitymasterdatacommand.repository";
import { SecurityMasterDataQueryRepository } from "../repositories/securitymasterdataquery.repository";
import { SecurityMasterDataRepository } from "../repositories/securitymasterdata.repository";
import { SecurityMasterDataResolver } from "../graphql/securitymasterdata.resolver";
import { SecurityMasterDataAuthGuard } from "../guards/securitymasterdataauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityMasterData } from "../entities/security-master-data.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSecurityMasterDataHandler } from "../commands/handlers/createsecuritymasterdata.handler";
import { UpdateSecurityMasterDataHandler } from "../commands/handlers/updatesecuritymasterdata.handler";
import { DeleteSecurityMasterDataHandler } from "../commands/handlers/deletesecuritymasterdata.handler";
import { GetSecurityMasterDataByIdHandler } from "../queries/handlers/getsecuritymasterdatabyid.handler";
import { GetSecurityMasterDataByFieldHandler } from "../queries/handlers/getsecuritymasterdatabyfield.handler";
import { GetAllSecurityMasterDataHandler } from "../queries/handlers/getallsecuritymasterdata.handler";
import { SecurityMasterDataCrudSaga } from "../sagas/securitymasterdata-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SecurityMasterDataInterceptor } from "../interceptors/securitymasterdata.interceptor";
import { SecurityMasterDataLoggingInterceptor } from "../interceptors/securitymasterdata.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, SecurityMasterData]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [SecurityMasterDataCommandController, SecurityMasterDataQueryController],
  providers: [
    //Services
    EventStoreService,
    SecurityMasterDataQueryService,
    SecurityMasterDataCommandService,
    //Repositories
    SecurityMasterDataCommandRepository,
    SecurityMasterDataQueryRepository,
    SecurityMasterDataRepository,      
    //Resolvers
    SecurityMasterDataResolver,
    //Guards
    SecurityMasterDataAuthGuard,
    //Interceptors
    SecurityMasterDataInterceptor,
    SecurityMasterDataLoggingInterceptor,
    //CQRS Handlers
    CreateSecurityMasterDataHandler,
    UpdateSecurityMasterDataHandler,
    DeleteSecurityMasterDataHandler,
    GetSecurityMasterDataByIdHandler,
    GetSecurityMasterDataByFieldHandler,
    GetAllSecurityMasterDataHandler,
    SecurityMasterDataCrudSaga,
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
    SecurityMasterDataQueryService,
    SecurityMasterDataCommandService,
    //Repositories
    SecurityMasterDataCommandRepository,
    SecurityMasterDataQueryRepository,
    SecurityMasterDataRepository,      
    //Resolvers
    SecurityMasterDataResolver,
    //Guards
    SecurityMasterDataAuthGuard,
    //Interceptors
    SecurityMasterDataInterceptor,
    SecurityMasterDataLoggingInterceptor,
  ],
})
export class SecurityMasterDataModule {}

