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
import { SecurityCustomerCommandController } from "../controllers/securitycustomercommand.controller";
import { SecurityCustomerQueryController } from "../controllers/securitycustomerquery.controller";
import { SecurityCustomerCommandService } from "../services/securitycustomercommand.service";
import { SecurityCustomerQueryService } from "../services/securitycustomerquery.service";
import { SecurityCustomerCommandRepository } from "../repositories/securitycustomercommand.repository";
import { SecurityCustomerQueryRepository } from "../repositories/securitycustomerquery.repository";
import { SecurityCustomerRepository } from "../repositories/securitycustomer.repository";
import { SecurityCustomerResolver } from "../graphql/securitycustomer.resolver";
import { SecurityCustomerAuthGuard } from "../guards/securitycustomerauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityCustomer } from "../entities/security-customer.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateSecurityCustomerHandler } from "../commands/handlers/createsecuritycustomer.handler";
import { UpdateSecurityCustomerHandler } from "../commands/handlers/updatesecuritycustomer.handler";
import { DeleteSecurityCustomerHandler } from "../commands/handlers/deletesecuritycustomer.handler";
import { GetSecurityCustomerByIdHandler } from "../queries/handlers/getsecuritycustomerbyid.handler";
import { GetSecurityCustomerByFieldHandler } from "../queries/handlers/getsecuritycustomerbyfield.handler";
import { GetAllSecurityCustomerHandler } from "../queries/handlers/getallsecuritycustomer.handler";
import { SecurityCustomerCrudSaga } from "../sagas/securitycustomer-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { SecurityCustomerInterceptor } from "../interceptors/securitycustomer.interceptor";
import { SecurityCustomerLoggingInterceptor } from "../interceptors/securitycustomer.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, SecurityCustomer]), // Incluir BaseEntity para herencia
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [SecurityCustomerCommandController, SecurityCustomerQueryController],
  providers: [
    //Services
    EventStoreService,
    SecurityCustomerQueryService,
    SecurityCustomerCommandService,
    //Repositories
    SecurityCustomerCommandRepository,
    SecurityCustomerQueryRepository,
    SecurityCustomerRepository,      
    //Resolvers
    SecurityCustomerResolver,
    //Guards
    SecurityCustomerAuthGuard,
    //Interceptors
    SecurityCustomerInterceptor,
    SecurityCustomerLoggingInterceptor,
    //CQRS Handlers
    CreateSecurityCustomerHandler,
    UpdateSecurityCustomerHandler,
    DeleteSecurityCustomerHandler,
    GetSecurityCustomerByIdHandler,
    GetSecurityCustomerByFieldHandler,
    GetAllSecurityCustomerHandler,
    SecurityCustomerCrudSaga,
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
    SecurityCustomerQueryService,
    SecurityCustomerCommandService,
    //Repositories
    SecurityCustomerCommandRepository,
    SecurityCustomerQueryRepository,
    SecurityCustomerRepository,      
    //Resolvers
    SecurityCustomerResolver,
    //Guards
    SecurityCustomerAuthGuard,
    //Interceptors
    SecurityCustomerInterceptor,
    SecurityCustomerLoggingInterceptor,
  ],
})
export class SecurityCustomerModule {}

