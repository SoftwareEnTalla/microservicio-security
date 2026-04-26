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
import { LoginIdentifierTypeCommandController } from "../controllers/loginidentifiertypecommand.controller";
import { LoginIdentifierTypeQueryController } from "../controllers/loginidentifiertypequery.controller";
import { LoginIdentifierTypeCommandService } from "../services/loginidentifiertypecommand.service";
import { LoginIdentifierTypeQueryService } from "../services/loginidentifiertypequery.service";

import { LoginIdentifierTypeCommandRepository } from "../repositories/loginidentifiertypecommand.repository";
import { LoginIdentifierTypeQueryRepository } from "../repositories/loginidentifiertypequery.repository";
import { LoginIdentifierTypeRepository } from "../repositories/loginidentifiertype.repository";
import { LoginIdentifierTypeResolver } from "../graphql/loginidentifiertype.resolver";
import { LoginIdentifierTypeAuthGuard } from "../guards/loginidentifiertypeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoginIdentifierType } from "../entities/login-identifier-type.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateLoginIdentifierTypeHandler } from "../commands/handlers/createloginidentifiertype.handler";
import { UpdateLoginIdentifierTypeHandler } from "../commands/handlers/updateloginidentifiertype.handler";
import { DeleteLoginIdentifierTypeHandler } from "../commands/handlers/deleteloginidentifiertype.handler";
import { GetLoginIdentifierTypeByIdHandler } from "../queries/handlers/getloginidentifiertypebyid.handler";
import { GetLoginIdentifierTypeByFieldHandler } from "../queries/handlers/getloginidentifiertypebyfield.handler";
import { GetAllLoginIdentifierTypeHandler } from "../queries/handlers/getallloginidentifiertype.handler";
import { LoginIdentifierTypeCrudSaga } from "../sagas/loginidentifiertype-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { LoginIdentifierTypeInterceptor } from "../interceptors/loginidentifiertype.interceptor";
import { LoginIdentifierTypeLoggingInterceptor } from "../interceptors/loginidentifiertype.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, LoginIdentifierType]), // Incluir BaseEntity para herencia
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
  controllers: [LoginIdentifierTypeCommandController, LoginIdentifierTypeQueryController],
  providers: [
    //Services
    EventStoreService,
    LoginIdentifierTypeQueryService,
    LoginIdentifierTypeCommandService,
  
    //Repositories
    LoginIdentifierTypeCommandRepository,
    LoginIdentifierTypeQueryRepository,
    LoginIdentifierTypeRepository,      
    //Resolvers
    LoginIdentifierTypeResolver,
    //Guards
    LoginIdentifierTypeAuthGuard,
    //Interceptors
    LoginIdentifierTypeInterceptor,
    LoginIdentifierTypeLoggingInterceptor,
    //CQRS Handlers
    CreateLoginIdentifierTypeHandler,
    UpdateLoginIdentifierTypeHandler,
    DeleteLoginIdentifierTypeHandler,
    GetLoginIdentifierTypeByIdHandler,
    GetLoginIdentifierTypeByFieldHandler,
    GetAllLoginIdentifierTypeHandler,
    LoginIdentifierTypeCrudSaga,
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
    LoginIdentifierTypeQueryService,
    LoginIdentifierTypeCommandService,
  
    //Repositories
    LoginIdentifierTypeCommandRepository,
    LoginIdentifierTypeQueryRepository,
    LoginIdentifierTypeRepository,      
    //Resolvers
    LoginIdentifierTypeResolver,
    //Guards
    LoginIdentifierTypeAuthGuard,
    //Interceptors
    LoginIdentifierTypeInterceptor,
    LoginIdentifierTypeLoggingInterceptor,
  ],
})
export class LoginIdentifierTypeModule {}

