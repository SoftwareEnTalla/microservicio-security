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
import { LoginCommandController } from "../controllers/logincommand.controller";
import { LoginQueryController } from "../controllers/loginquery.controller";
import { LoginCommandService } from "../services/logincommand.service";
import { LoginQueryService } from "../services/loginquery.service";
import { LoginService } from "../services/login.service";
import { LoginCommandRepository } from "../repositories/logincommand.repository";
import { LoginQueryRepository } from "../repositories/loginquery.repository";
import { LoginRepository } from "../repositories/login.repository";
import { LoginResolver } from "../graphql/login.resolver";
import { LoginAuthGuard } from "../guards/loginauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Login } from "../entities/login.entity";
import { BaseEntity } from "../entities/base.entity";
import { User } from "../../user/entities/user.entity";
import { SessionToken } from "../../session-token/entities/session-token.entity";
import { MfaTotp } from "../../mfa-totp/entities/mfa-totp.entity";
import { BaseEntity as MfaTotpBaseEntity } from "../../mfa-totp/entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateLoginHandler } from "../commands/handlers/createlogin.handler";
import { UpdateLoginHandler } from "../commands/handlers/updatelogin.handler";
import { DeleteLoginHandler } from "../commands/handlers/deletelogin.handler";
import { GetLoginByIdHandler } from "../queries/handlers/getloginbyid.handler";
import { GetLoginByFieldHandler } from "../queries/handlers/getloginbyfield.handler";
import { GetAllLoginHandler } from "../queries/handlers/getalllogin.handler";
import { LoginCrudSaga } from "../sagas/login-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { LoginInterceptor } from "../interceptors/login.interceptor";
import { LoginLoggingInterceptor } from "../interceptors/login.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, Login, User, SessionToken, MfaTotpBaseEntity, MfaTotp]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [LoginCommandController, LoginQueryController],
  providers: [
    //Services
    EventStoreService,
    LoginQueryService,
    LoginCommandService,
      LoginService,
    //Repositories
    LoginCommandRepository,
    LoginQueryRepository,
    LoginRepository,      
    //Resolvers
    LoginResolver,
    //Guards
    LoginAuthGuard,
    //Interceptors
    LoginInterceptor,
    LoginLoggingInterceptor,
    //CQRS Handlers
    CreateLoginHandler,
    UpdateLoginHandler,
    DeleteLoginHandler,
    GetLoginByIdHandler,
    GetLoginByFieldHandler,
    GetAllLoginHandler,
    LoginCrudSaga,
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
    LoginQueryService,
    LoginCommandService,
      LoginService,
    //Repositories
    LoginCommandRepository,
    LoginQueryRepository,
    LoginRepository,      
    //Resolvers
    LoginResolver,
    //Guards
    LoginAuthGuard,
    //Interceptors
    LoginInterceptor,
    LoginLoggingInterceptor,
  ],
})
export class LoginModule {}

