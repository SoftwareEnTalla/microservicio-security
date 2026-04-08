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
import { AuthenticationCommandController } from "../controllers/authenticationcommand.controller";
import { AuthenticationQueryController } from "../controllers/authenticationquery.controller";
import { AuthenticationCommandService } from "../services/authenticationcommand.service";
import { AuthenticationQueryService } from "../services/authenticationquery.service";
import { AuthenticationCommandRepository } from "../repositories/authenticationcommand.repository";
import { AuthenticationQueryRepository } from "../repositories/authenticationquery.repository";
import { AuthenticationRepository } from "../repositories/authentication.repository";
import { AuthenticationResolver } from "../graphql/authentication.resolver";
import { AuthenticationAuthGuard } from "../guards/authenticationauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Authentication } from "../entities/authentication.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateAuthenticationHandler } from "../commands/handlers/createauthentication.handler";
import { UpdateAuthenticationHandler } from "../commands/handlers/updateauthentication.handler";
import { DeleteAuthenticationHandler } from "../commands/handlers/deleteauthentication.handler";
import { GetAuthenticationByIdHandler } from "../queries/handlers/getauthenticationbyid.handler";
import { GetAuthenticationByFieldHandler } from "../queries/handlers/getauthenticationbyfield.handler";
import { GetAllAuthenticationHandler } from "../queries/handlers/getallauthentication.handler";
import { AuthenticationCrudSaga } from "../sagas/authentication-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { AuthenticationInterceptor } from "../interceptors/authentication.interceptor";
import { AuthenticationLoggingInterceptor } from "../interceptors/authentication.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, Authentication]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [AuthenticationCommandController, AuthenticationQueryController],
  providers: [
    //Services
    EventStoreService,
    AuthenticationQueryService,
    AuthenticationCommandService,
    //Repositories
    AuthenticationCommandRepository,
    AuthenticationQueryRepository,
    AuthenticationRepository,      
    //Resolvers
    AuthenticationResolver,
    //Guards
    AuthenticationAuthGuard,
    //Interceptors
    AuthenticationInterceptor,
    AuthenticationLoggingInterceptor,
    //CQRS Handlers
    CreateAuthenticationHandler,
    UpdateAuthenticationHandler,
    DeleteAuthenticationHandler,
    GetAuthenticationByIdHandler,
    GetAuthenticationByFieldHandler,
    GetAllAuthenticationHandler,
    AuthenticationCrudSaga,
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
    AuthenticationQueryService,
    AuthenticationCommandService,
    //Repositories
    AuthenticationCommandRepository,
    AuthenticationQueryRepository,
    AuthenticationRepository,      
    //Resolvers
    AuthenticationResolver,
    //Guards
    AuthenticationAuthGuard,
    //Interceptors
    AuthenticationInterceptor,
    AuthenticationLoggingInterceptor,
  ],
})
export class AuthenticationModule {}

