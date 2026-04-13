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
import { UserProfileCommandController } from "../controllers/userprofilecommand.controller";
import { UserProfileQueryController } from "../controllers/userprofilequery.controller";
import { UserProfileCommandService } from "../services/userprofilecommand.service";
import { UserProfileQueryService } from "../services/userprofilequery.service";

import { UserProfileCommandRepository } from "../repositories/userprofilecommand.repository";
import { UserProfileQueryRepository } from "../repositories/userprofilequery.repository";
import { UserProfileRepository } from "../repositories/userprofile.repository";
import { UserProfileResolver } from "../graphql/userprofile.resolver";
import { UserProfileAuthGuard } from "../guards/userprofileauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserProfile } from "../entities/user-profile.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateUserProfileHandler } from "../commands/handlers/createuserprofile.handler";
import { UpdateUserProfileHandler } from "../commands/handlers/updateuserprofile.handler";
import { DeleteUserProfileHandler } from "../commands/handlers/deleteuserprofile.handler";
import { GetUserProfileByIdHandler } from "../queries/handlers/getuserprofilebyid.handler";
import { GetUserProfileByFieldHandler } from "../queries/handlers/getuserprofilebyfield.handler";
import { GetAllUserProfileHandler } from "../queries/handlers/getalluserprofile.handler";
import { UserProfileCrudSaga } from "../sagas/userprofile-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { UserProfileInterceptor } from "../interceptors/userprofile.interceptor";
import { UserProfileLoggingInterceptor } from "../interceptors/userprofile.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, UserProfile]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [UserProfileCommandController, UserProfileQueryController],
  providers: [
    //Services
    EventStoreService,
    UserProfileQueryService,
    UserProfileCommandService,
  
    //Repositories
    UserProfileCommandRepository,
    UserProfileQueryRepository,
    UserProfileRepository,      
    //Resolvers
    UserProfileResolver,
    //Guards
    UserProfileAuthGuard,
    //Interceptors
    UserProfileInterceptor,
    UserProfileLoggingInterceptor,
    //CQRS Handlers
    CreateUserProfileHandler,
    UpdateUserProfileHandler,
    DeleteUserProfileHandler,
    GetUserProfileByIdHandler,
    GetUserProfileByFieldHandler,
    GetAllUserProfileHandler,
    UserProfileCrudSaga,
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
    UserProfileQueryService,
    UserProfileCommandService,
  
    //Repositories
    UserProfileCommandRepository,
    UserProfileQueryRepository,
    UserProfileRepository,      
    //Resolvers
    UserProfileResolver,
    //Guards
    UserProfileAuthGuard,
    //Interceptors
    UserProfileInterceptor,
    UserProfileLoggingInterceptor,
  ],
})
export class UserProfileModule {}

