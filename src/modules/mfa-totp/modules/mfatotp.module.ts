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
import { MfaTotpCommandController } from "../controllers/mfatotpcommand.controller";
import { MfaTotpQueryController } from "../controllers/mfatotpquery.controller";
import { MfaTotpCommandService } from "../services/mfatotpcommand.service";
import { MfaTotpQueryService } from "../services/mfatotpquery.service";

import { MfaTotpCommandRepository } from "../repositories/mfatotpcommand.repository";
import { MfaTotpQueryRepository } from "../repositories/mfatotpquery.repository";
import { MfaTotpRepository } from "../repositories/mfatotp.repository";
import { MfaTotpResolver } from "../graphql/mfatotp.resolver";
import { MfaTotpAuthGuard } from "../guards/mfatotpauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MfaTotp } from "../entities/mfa-totp.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateMfaTotpHandler } from "../commands/handlers/createmfatotp.handler";
import { UpdateMfaTotpHandler } from "../commands/handlers/updatemfatotp.handler";
import { DeleteMfaTotpHandler } from "../commands/handlers/deletemfatotp.handler";
import { GetMfaTotpByIdHandler } from "../queries/handlers/getmfatotpbyid.handler";
import { GetMfaTotpByFieldHandler } from "../queries/handlers/getmfatotpbyfield.handler";
import { GetAllMfaTotpHandler } from "../queries/handlers/getallmfatotp.handler";
import { MfaTotpCrudSaga } from "../sagas/mfatotp-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { MfaTotpInterceptor } from "../interceptors/mfatotp.interceptor";
import { MfaTotpLoggingInterceptor } from "../interceptors/mfatotp.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, MfaTotp]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [MfaTotpCommandController, MfaTotpQueryController],
  providers: [
    //Services
    EventStoreService,
    MfaTotpQueryService,
    MfaTotpCommandService,
  
    //Repositories
    MfaTotpCommandRepository,
    MfaTotpQueryRepository,
    MfaTotpRepository,      
    //Resolvers
    MfaTotpResolver,
    //Guards
    MfaTotpAuthGuard,
    //Interceptors
    MfaTotpInterceptor,
    MfaTotpLoggingInterceptor,
    //CQRS Handlers
    CreateMfaTotpHandler,
    UpdateMfaTotpHandler,
    DeleteMfaTotpHandler,
    GetMfaTotpByIdHandler,
    GetMfaTotpByFieldHandler,
    GetAllMfaTotpHandler,
    MfaTotpCrudSaga,
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
    MfaTotpQueryService,
    MfaTotpCommandService,
  
    //Repositories
    MfaTotpCommandRepository,
    MfaTotpQueryRepository,
    MfaTotpRepository,      
    //Resolvers
    MfaTotpResolver,
    //Guards
    MfaTotpAuthGuard,
    //Interceptors
    MfaTotpInterceptor,
    MfaTotpLoggingInterceptor,
  ],
})
export class MfaTotpModule {}

