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
import { RbacAclCommandController } from "../controllers/rbacaclcommand.controller";
import { RbacAclQueryController } from "../controllers/rbacaclquery.controller";
import { RbacAclCommandService } from "../services/rbacaclcommand.service";
import { RbacAclQueryService } from "../services/rbacaclquery.service";

import { RbacAclCommandRepository } from "../repositories/rbacaclcommand.repository";
import { RbacAclQueryRepository } from "../repositories/rbacaclquery.repository";
import { RbacAclRepository } from "../repositories/rbacacl.repository";
import { RbacAclResolver } from "../graphql/rbacacl.resolver";
import { RbacAclAuthGuard } from "../guards/rbacaclauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RbacAcl } from "../entities/rbac-acl.entity";
import { BaseEntity } from "../entities/base.entity";
import { Role } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";
import { RolePermission } from "../entities/role-permission.entity";
import { UserRoleAssignment } from "../entities/user-role-assignment.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateRbacAclHandler } from "../commands/handlers/createrbacacl.handler";
import { UpdateRbacAclHandler } from "../commands/handlers/updaterbacacl.handler";
import { DeleteRbacAclHandler } from "../commands/handlers/deleterbacacl.handler";
import { GetRbacAclByIdHandler } from "../queries/handlers/getrbacaclbyid.handler";
import { GetRbacAclByFieldHandler } from "../queries/handlers/getrbacaclbyfield.handler";
import { GetAllRbacAclHandler } from "../queries/handlers/getallrbacacl.handler";
import { RbacAclCrudSaga } from "../sagas/rbacacl-crud.saga";
import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { RbacAclInterceptor } from "../interceptors/rbacacl.interceptor";
import { RbacAclLoggingInterceptor } from "../interceptors/rbacacl.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

// RBAC v2 services
import { RoleCommandService } from "../services/role-command.service";
import { PermissionCommandService } from "../services/permission-command.service";
import { RbacAssignmentService } from "../services/rbac-assignment.service";
import { AclResolverService } from "../services/acl-resolver.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, RbacAcl, Role, Permission, RolePermission, UserRoleAssignment]),
    CacheModule.register(), // Importa el módulo de caché
  ],
  controllers: [RbacAclCommandController, RbacAclQueryController],
  providers: [
    //Services
    EventStoreService,
    RbacAclQueryService,
    RbacAclCommandService,
    // RBAC v2 services
    RoleCommandService,
    PermissionCommandService,
    RbacAssignmentService,
    AclResolverService,
  
    //Repositories
    RbacAclCommandRepository,
    RbacAclQueryRepository,
    RbacAclRepository,      
    //Resolvers
    RbacAclResolver,
    //Guards
    RbacAclAuthGuard,
    //Interceptors
    RbacAclInterceptor,
    RbacAclLoggingInterceptor,
    //CQRS Handlers
    CreateRbacAclHandler,
    UpdateRbacAclHandler,
    DeleteRbacAclHandler,
    GetRbacAclByIdHandler,
    GetRbacAclByFieldHandler,
    GetAllRbacAclHandler,
    RbacAclCrudSaga,
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
    RbacAclQueryService,
    RbacAclCommandService,
    // RBAC v2 services
    RoleCommandService,
    PermissionCommandService,
    RbacAssignmentService,
    AclResolverService,
  
    //Repositories
    RbacAclCommandRepository,
    RbacAclQueryRepository,
    RbacAclRepository,      
    //Resolvers
    RbacAclResolver,
    //Guards
    RbacAclAuthGuard,
    //Interceptors
    RbacAclInterceptor,
    RbacAclLoggingInterceptor,
  ],
})
export class RbacAclModule {}

