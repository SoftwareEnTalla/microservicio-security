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
import { SecurityCommandController } from "../controllers/securitycommand.controller";
import { SecurityQueryController } from "../controllers/securityquery.controller";
import { SecurityCommandService } from "../services/securitycommand.service";
import { SecurityQueryService } from "../services/securityquery.service";
import { SecurityCommandRepository } from "../repositories/securitycommand.repository";
import { SecurityQueryRepository } from "../repositories/securityquery.repository";
import { SecurityRepository } from "../repositories/security.repository";
import { SecurityResolver } from "../graphql/security.resolver";
import { SecurityAuthGuard } from "../guards/securityauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Security } from "../entities/security.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSecurityHandler } from "../commands/handlers/createsecurity.handler";
import { UpdateSecurityHandler } from "../commands/handlers/updatesecurity.handler";
import { DeleteSecurityHandler } from "../commands/handlers/deletesecurity.handler";
import { GetSecurityByIdHandler } from "../queries/handlers/getsecuritybyid.handler";
import { GetSecurityByFieldHandler } from "../queries/handlers/getsecuritybyfield.handler";
import { GetAllSecurityHandler } from "../queries/handlers/getallsecurity.handler";
import { SecurityCrudSaga } from "../sagas/security-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SecurityInterceptor } from "../interceptors/security.interceptor";
import { SecurityLoggingInterceptor } from "../interceptors/security.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, Security]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [SecurityCommandController, SecurityQueryController],
  providers: [
    //Services
    EventStoreService,
    SecurityQueryService,
    SecurityCommandService,
    //Repositories
    SecurityCommandRepository,
    SecurityQueryRepository,
    SecurityRepository,      
    //Resolvers
    SecurityResolver,
    //Guards
    SecurityAuthGuard,
    //Interceptors
    SecurityInterceptor,
    SecurityLoggingInterceptor,
    //CQRS Handlers
    CreateSecurityHandler,
    UpdateSecurityHandler,
    DeleteSecurityHandler,
    GetSecurityByIdHandler,
    GetSecurityByFieldHandler,
    GetAllSecurityHandler,
    SecurityCrudSaga,
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
    SecurityQueryService,
    SecurityCommandService,
    //Repositories
    SecurityCommandRepository,
    SecurityQueryRepository,
    SecurityRepository,      
    //Resolvers
    SecurityResolver,
    //Guards
    SecurityAuthGuard,
    //Interceptors
    SecurityInterceptor,
    SecurityLoggingInterceptor,
  ],
})
export class SecurityModule {}

