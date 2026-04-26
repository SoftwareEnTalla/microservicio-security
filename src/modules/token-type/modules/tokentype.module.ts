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
import { TokenTypeCommandController } from "../controllers/tokentypecommand.controller";
import { TokenTypeQueryController } from "../controllers/tokentypequery.controller";
import { TokenTypeCommandService } from "../services/tokentypecommand.service";
import { TokenTypeQueryService } from "../services/tokentypequery.service";

import { TokenTypeCommandRepository } from "../repositories/tokentypecommand.repository";
import { TokenTypeQueryRepository } from "../repositories/tokentypequery.repository";
import { TokenTypeRepository } from "../repositories/tokentype.repository";
import { TokenTypeResolver } from "../graphql/tokentype.resolver";
import { TokenTypeAuthGuard } from "../guards/tokentypeauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenType } from "../entities/token-type.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateTokenTypeHandler } from "../commands/handlers/createtokentype.handler";
import { UpdateTokenTypeHandler } from "../commands/handlers/updatetokentype.handler";
import { DeleteTokenTypeHandler } from "../commands/handlers/deletetokentype.handler";
import { GetTokenTypeByIdHandler } from "../queries/handlers/gettokentypebyid.handler";
import { GetTokenTypeByFieldHandler } from "../queries/handlers/gettokentypebyfield.handler";
import { GetAllTokenTypeHandler } from "../queries/handlers/getalltokentype.handler";
import { TokenTypeCrudSaga } from "../sagas/tokentype-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { TokenTypeInterceptor } from "../interceptors/tokentype.interceptor";
import { TokenTypeLoggingInterceptor } from "../interceptors/tokentype.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, TokenType]), // Incluir BaseEntity para herencia
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
  controllers: [TokenTypeCommandController, TokenTypeQueryController],
  providers: [
    //Services
    EventStoreService,
    TokenTypeQueryService,
    TokenTypeCommandService,
  
    //Repositories
    TokenTypeCommandRepository,
    TokenTypeQueryRepository,
    TokenTypeRepository,      
    //Resolvers
    TokenTypeResolver,
    //Guards
    TokenTypeAuthGuard,
    //Interceptors
    TokenTypeInterceptor,
    TokenTypeLoggingInterceptor,
    //CQRS Handlers
    CreateTokenTypeHandler,
    UpdateTokenTypeHandler,
    DeleteTokenTypeHandler,
    GetTokenTypeByIdHandler,
    GetTokenTypeByFieldHandler,
    GetAllTokenTypeHandler,
    TokenTypeCrudSaga,
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
    TokenTypeQueryService,
    TokenTypeCommandService,
  
    //Repositories
    TokenTypeCommandRepository,
    TokenTypeQueryRepository,
    TokenTypeRepository,      
    //Resolvers
    TokenTypeResolver,
    //Guards
    TokenTypeAuthGuard,
    //Interceptors
    TokenTypeInterceptor,
    TokenTypeLoggingInterceptor,
  ],
})
export class TokenTypeModule {}

