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
import { IdentityFederationCommandController } from "../controllers/identityfederationcommand.controller";
import { IdentityFederationQueryController } from "../controllers/identityfederationquery.controller";
import { IdentityFederationCommandService } from "../services/identityfederationcommand.service";
import { IdentityFederationQueryService } from "../services/identityfederationquery.service";
import { IdentityFederationCommandRepository } from "../repositories/identityfederationcommand.repository";
import { IdentityFederationQueryRepository } from "../repositories/identityfederationquery.repository";
import { IdentityFederationRepository } from "../repositories/identityfederation.repository";
import { IdentityFederationResolver } from "../graphql/identityfederation.resolver";
import { IdentityFederationAuthGuard } from "../guards/identityfederationauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IdentityFederation } from "../entities/identity-federation.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateIdentityFederationHandler } from "../commands/handlers/createidentityfederation.handler";
import { UpdateIdentityFederationHandler } from "../commands/handlers/updateidentityfederation.handler";
import { DeleteIdentityFederationHandler } from "../commands/handlers/deleteidentityfederation.handler";
import { GetIdentityFederationByIdHandler } from "../queries/handlers/getidentityfederationbyid.handler";
import { GetIdentityFederationByFieldHandler } from "../queries/handlers/getidentityfederationbyfield.handler";
import { GetAllIdentityFederationHandler } from "../queries/handlers/getallidentityfederation.handler";
import { IdentityFederationCrudSaga } from "../sagas/identityfederation-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { IdentityFederationInterceptor } from "../interceptors/identityfederation.interceptor";
import { IdentityFederationLoggingInterceptor } from "../interceptors/identityfederation.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, IdentityFederation]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [IdentityFederationCommandController, IdentityFederationQueryController],
  providers: [
    //Services
    EventStoreService,
    IdentityFederationQueryService,
    IdentityFederationCommandService,
    //Repositories
    IdentityFederationCommandRepository,
    IdentityFederationQueryRepository,
    IdentityFederationRepository,      
    //Resolvers
    IdentityFederationResolver,
    //Guards
    IdentityFederationAuthGuard,
    //Interceptors
    IdentityFederationInterceptor,
    IdentityFederationLoggingInterceptor,
    //CQRS Handlers
    CreateIdentityFederationHandler,
    UpdateIdentityFederationHandler,
    DeleteIdentityFederationHandler,
    GetIdentityFederationByIdHandler,
    GetIdentityFederationByFieldHandler,
    GetAllIdentityFederationHandler,
    IdentityFederationCrudSaga,
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
    IdentityFederationQueryService,
    IdentityFederationCommandService,
    //Repositories
    IdentityFederationCommandRepository,
    IdentityFederationQueryRepository,
    IdentityFederationRepository,      
    //Resolvers
    IdentityFederationResolver,
    //Guards
    IdentityFederationAuthGuard,
    //Interceptors
    IdentityFederationInterceptor,
    IdentityFederationLoggingInterceptor,
  ],
})
export class IdentityFederationModule {}

