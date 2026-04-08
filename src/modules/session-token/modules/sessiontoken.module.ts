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
import { SessionTokenCommandController } from "../controllers/sessiontokencommand.controller";
import { SessionTokenQueryController } from "../controllers/sessiontokenquery.controller";
import { SessionTokenCommandService } from "../services/sessiontokencommand.service";
import { SessionTokenQueryService } from "../services/sessiontokenquery.service";
import { SessionTokenCommandRepository } from "../repositories/sessiontokencommand.repository";
import { SessionTokenQueryRepository } from "../repositories/sessiontokenquery.repository";
import { SessionTokenRepository } from "../repositories/sessiontoken.repository";
import { SessionTokenResolver } from "../graphql/sessiontoken.resolver";
import { SessionTokenAuthGuard } from "../guards/sessiontokenauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SessionToken } from "../entities/session-token.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSessionTokenHandler } from "../commands/handlers/createsessiontoken.handler";
import { UpdateSessionTokenHandler } from "../commands/handlers/updatesessiontoken.handler";
import { DeleteSessionTokenHandler } from "../commands/handlers/deletesessiontoken.handler";
import { GetSessionTokenByIdHandler } from "../queries/handlers/getsessiontokenbyid.handler";
import { GetSessionTokenByFieldHandler } from "../queries/handlers/getsessiontokenbyfield.handler";
import { GetAllSessionTokenHandler } from "../queries/handlers/getallsessiontoken.handler";
import { SessionTokenCrudSaga } from "../sagas/sessiontoken-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SessionTokenInterceptor } from "../interceptors/sessiontoken.interceptor";
import { SessionTokenLoggingInterceptor } from "../interceptors/sessiontoken.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, SessionToken]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [SessionTokenCommandController, SessionTokenQueryController],
  providers: [
    //Services
    EventStoreService,
    SessionTokenQueryService,
    SessionTokenCommandService,
    //Repositories
    SessionTokenCommandRepository,
    SessionTokenQueryRepository,
    SessionTokenRepository,      
    //Resolvers
    SessionTokenResolver,
    //Guards
    SessionTokenAuthGuard,
    //Interceptors
    SessionTokenInterceptor,
    SessionTokenLoggingInterceptor,
    //CQRS Handlers
    CreateSessionTokenHandler,
    UpdateSessionTokenHandler,
    DeleteSessionTokenHandler,
    GetSessionTokenByIdHandler,
    GetSessionTokenByFieldHandler,
    GetAllSessionTokenHandler,
    SessionTokenCrudSaga,
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
    SessionTokenQueryService,
    SessionTokenCommandService,
    //Repositories
    SessionTokenCommandRepository,
    SessionTokenQueryRepository,
    SessionTokenRepository,      
    //Resolvers
    SessionTokenResolver,
    //Guards
    SessionTokenAuthGuard,
    //Interceptors
    SessionTokenInterceptor,
    SessionTokenLoggingInterceptor,
  ],
})
export class SessionTokenModule {}

