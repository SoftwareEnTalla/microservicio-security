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
import { UserTypeCommandController } from "../controllers/usertypecommand.controller";
import { UserTypeQueryController } from "../controllers/usertypequery.controller";
import { UserTypeCommandService } from "../services/usertypecommand.service";
import { UserTypeQueryService } from "../services/usertypequery.service";

import { UserTypeCommandRepository } from "../repositories/usertypecommand.repository";
import { UserTypeQueryRepository } from "../repositories/usertypequery.repository";
import { UserTypeRepository } from "../repositories/usertype.repository";
import { UserTypeResolver } from "../graphql/usertype.resolver";
import { UserTypeAuthGuard } from "../guards/usertypeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserType } from "../entities/user-type.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateUserTypeHandler } from "../commands/handlers/createusertype.handler";
import { UpdateUserTypeHandler } from "../commands/handlers/updateusertype.handler";
import { DeleteUserTypeHandler } from "../commands/handlers/deleteusertype.handler";
import { GetUserTypeByIdHandler } from "../queries/handlers/getusertypebyid.handler";
import { GetUserTypeByFieldHandler } from "../queries/handlers/getusertypebyfield.handler";
import { GetAllUserTypeHandler } from "../queries/handlers/getallusertype.handler";
import { UserTypeCrudSaga } from "../sagas/usertype-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { UserTypeInterceptor } from "../interceptors/usertype.interceptor";
import { UserTypeLoggingInterceptor } from "../interceptors/usertype.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, UserType]), // Incluir BaseEntity para herencia
    CacheModule.registerAsync({
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: { host: process.env.REDIS_HOST || "data-center-redis", port: parseInt(process.env.REDIS_PORT || "6379", 10) },
            ttl: parseInt(process.env.REDIS_TTL || "60", 10),
          });
          return { store: store as any, isGlobal: true };
        } catch {
          return { isGlobal: true }; // fallback in-memory
        }
      },
    }),
  ],
  controllers: [UserTypeCommandController, UserTypeQueryController],
  providers: [
    //Services
    EventStoreService,
    UserTypeQueryService,
    UserTypeCommandService,
  
    //Repositories
    UserTypeCommandRepository,
    UserTypeQueryRepository,
    UserTypeRepository,      
    //Resolvers
    UserTypeResolver,
    //Guards
    UserTypeAuthGuard,
    //Interceptors
    UserTypeInterceptor,
    UserTypeLoggingInterceptor,
    //CQRS Handlers
    CreateUserTypeHandler,
    UpdateUserTypeHandler,
    DeleteUserTypeHandler,
    GetUserTypeByIdHandler,
    GetUserTypeByFieldHandler,
    GetAllUserTypeHandler,
    UserTypeCrudSaga,
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
    UserTypeQueryService,
    UserTypeCommandService,
  
    //Repositories
    UserTypeCommandRepository,
    UserTypeQueryRepository,
    UserTypeRepository,      
    //Resolvers
    UserTypeResolver,
    //Guards
    UserTypeAuthGuard,
    //Interceptors
    UserTypeInterceptor,
    UserTypeLoggingInterceptor,
  ],
})
export class UserTypeModule {}

