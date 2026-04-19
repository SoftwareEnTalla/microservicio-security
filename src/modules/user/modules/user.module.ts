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
import { UserCommandController } from "../controllers/usercommand.controller";
import { UserQueryController } from "../controllers/userquery.controller";
import { UserCommandService } from "../services/usercommand.service";
import { UserQueryService } from "../services/userquery.service";
import { UserService } from "../services/user.service";
import { SuperAdminBootstrapService } from "../services/super-admin-bootstrap.service";
import { PasswordPolicyService } from "../../../common/services/password-policy.service";

import { UserCommandRepository } from "../repositories/usercommand.repository";
import { UserQueryRepository } from "../repositories/userquery.repository";
import { UserRepository } from "../repositories/user.repository";
import { UserResolver } from "../graphql/user.resolver";
import { UserAuthGuard } from "../guards/userauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { BaseEntity } from "../entities/base.entity";
import { MfaTotp } from "../../mfa-totp/entities/mfa-totp.entity";
import { BaseEntity as MfaTotpBaseEntity } from "../../mfa-totp/entities/base.entity";
import { SystemAdminPolicy } from "../../system-admin-policy/entities/system-admin-policy.entity";
import { BaseEntity as SystemAdminPolicyBaseEntity } from "../../system-admin-policy/entities/base.entity";
import { AdminActionAuditService } from "../../system-admin-policy/services/admin-action-audit.service";
import { SystemAdminGuard } from "../../system-admin-policy/guards/system-admin.guard";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateUserHandler } from "../commands/handlers/createuser.handler";
import { UpdateUserHandler } from "../commands/handlers/updateuser.handler";
import { DeleteUserHandler } from "../commands/handlers/deleteuser.handler";
import { GetUserByIdHandler } from "../queries/handlers/getuserbyid.handler";
import { GetUserByFieldHandler } from "../queries/handlers/getuserbyfield.handler";
import { GetAllUserHandler } from "../queries/handlers/getalluser.handler";
import { UserCrudSaga } from "../sagas/user-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { UserInterceptor } from "../interceptors/user.interceptor";
import { UserLoggingInterceptor } from "../interceptors/user.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, User, MfaTotpBaseEntity, MfaTotp, SystemAdminPolicyBaseEntity, SystemAdminPolicy]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [UserCommandController, UserQueryController],
  providers: [
    //Services
    EventStoreService,
    UserService,
    SuperAdminBootstrapService,
    PasswordPolicyService,
    UserQueryService,
    UserCommandService,
    AdminActionAuditService,
  
    //Repositories
    UserCommandRepository,
    UserQueryRepository,
    UserRepository,      
    //Resolvers
    UserResolver,
    //Guards
    UserAuthGuard,
    SystemAdminGuard,
    //Interceptors
    UserInterceptor,
    UserLoggingInterceptor,
    //CQRS Handlers
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUserByIdHandler,
    GetUserByFieldHandler,
    GetAllUserHandler,
    UserCrudSaga,
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
    UserService,
    SuperAdminBootstrapService,
    PasswordPolicyService,
    UserQueryService,
    UserCommandService,
  
    //Repositories
    UserCommandRepository,
    UserQueryRepository,
    UserRepository,      
    //Resolvers
    UserResolver,
    //Guards
    UserAuthGuard,
    //Interceptors
    UserInterceptor,
    UserLoggingInterceptor,
  ],
})
export class UserModule {}

