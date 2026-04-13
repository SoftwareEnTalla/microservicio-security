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


import { DynamicModule, Module, OnModuleInit, Optional, Inject } from "@nestjs/common";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { SecurityCommandController } from "./modules/security/controllers/securitycommand.controller";
import { SecurityModule } from "./modules/security/modules/security.module";
import { CqrsModule } from "@nestjs/cqrs";
import { AppDataSource, initializeDatabase } from "./data-source";
import { SecurityQueryController } from "./modules/security/controllers/securityquery.controller";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import GraphQLJSON from "graphql-type-json";
import { SecurityCommandService } from "./modules/security/services/securitycommand.service";
import { SecurityQueryService } from "./modules/security/services/securityquery.service";
import { CacheModule } from "@nestjs/cache-manager";
import { LoggingModule } from "./modules/security/modules/logger.module";
import { ModuleRef } from "@nestjs/core";
import { ServiceRegistry } from "@core/service-registry";
import LoggerService, { logger } from "@core/logs/logger";
import { AuthenticationModule } from "./modules/authentication/modules/authentication.module";
import { AuthenticationCommandService } from "./modules/authentication/services/authenticationcommand.service";
import { AuthenticationQueryService } from "./modules/authentication/services/authenticationquery.service";
import { IdentityFederationModule } from "./modules/identity-federation/modules/identityfederation.module";
import { IdentityFederationCommandService } from "./modules/identity-federation/services/identityfederationcommand.service";
import { IdentityFederationQueryService } from "./modules/identity-federation/services/identityfederationquery.service";
import { LoginModule } from "./modules/login/modules/login.module";
import { LoginCommandService } from "./modules/login/services/logincommand.service";
import { LoginQueryService } from "./modules/login/services/loginquery.service";
import { MfaTotpModule } from "./modules/mfa-totp/modules/mfatotp.module";
import { MfaTotpCommandService } from "./modules/mfa-totp/services/mfatotpcommand.service";
import { MfaTotpQueryService } from "./modules/mfa-totp/services/mfatotpquery.service";
import { RbacAclModule } from "./modules/rbac-acl/modules/rbacacl.module";
import { RbacAclCommandService } from "./modules/rbac-acl/services/rbacaclcommand.service";
import { RbacAclQueryService } from "./modules/rbac-acl/services/rbacaclquery.service";
import { SalesManagerModule } from "./modules/sales-manager/modules/salesmanager.module";
import { SalesManagerCommandService } from "./modules/sales-manager/services/salesmanagercommand.service";
import { SalesManagerQueryService } from "./modules/sales-manager/services/salesmanagerquery.service";
import { SecurityCustomerModule } from "./modules/security-customer/modules/securitycustomer.module";
import { SecurityCustomerCommandService } from "./modules/security-customer/services/securitycustomercommand.service";
import { SecurityCustomerQueryService } from "./modules/security-customer/services/securitycustomerquery.service";
import { SecurityMasterDataModule } from "./modules/security-master-data/modules/securitymasterdata.module";
import { SecurityMasterDataCommandService } from "./modules/security-master-data/services/securitymasterdatacommand.service";
import { SecurityMasterDataQueryService } from "./modules/security-master-data/services/securitymasterdataquery.service";
import { SecurityMerchantModule } from "./modules/security-merchant/modules/securitymerchant.module";
import { SecurityMerchantCommandService } from "./modules/security-merchant/services/securitymerchantcommand.service";
import { SecurityMerchantQueryService } from "./modules/security-merchant/services/securitymerchantquery.service";
import { SessionTokenModule } from "./modules/session-token/modules/sessiontoken.module";
import { SessionTokenCommandService } from "./modules/session-token/services/sessiontokencommand.service";
import { SessionTokenQueryService } from "./modules/session-token/services/sessiontokenquery.service";
import { SystemAdminPolicyModule } from "./modules/system-admin-policy/modules/systemadminpolicy.module";
import { SystemAdminPolicyCommandService } from "./modules/system-admin-policy/services/systemadminpolicycommand.service";
import { SystemAdminPolicyQueryService } from "./modules/system-admin-policy/services/systemadminpolicyquery.service";
import { UserProfileModule } from "./modules/user-profile/modules/userprofile.module";
import { UserProfileCommandService } from "./modules/user-profile/services/userprofilecommand.service";
import { UserProfileQueryService } from "./modules/user-profile/services/userprofilequery.service";
import { UserModule } from "./modules/user/modules/user.module";
import { UserCommandService } from "./modules/user/services/usercommand.service";
import { UserQueryService } from "./modules/user/services/userquery.service";

/*
//TODO unused for while dependencies
import { I18nModule } from "nestjs-i18n";
import { join } from "path";
import { CustomI18nLoader } from "./core/loaders/custom-I18n-Loader";
import { TranslocoService } from "@jsverse/transloco";
import { HeaderResolver, AcceptLanguageResolver } from "nestjs-i18n";
import { TranslocoWrapperService } from "./core/services/transloco-wrapper.service";
import { TranslocoModule } from "@ngneat/transloco";
import LoggerService, { logger } from "@core/logs/logger";

*/

@Module({
  imports: [
    // Se importa/registra el módulo de caché
    CacheModule.register(),

    /**
     * ConfigModule - Configuración global de variables de entorno
     *
     * Configuración centralizada para el manejo de variables de entorno.
     * Se establece como global para estar disponible en toda la aplicación.
     */
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en todos los módulos sin necesidad de importar
      envFilePath: ".env", // Ubicación del archivo .env
      cache: true, // Mejora rendimiento cacheando las variables
      expandVariables: true, // Permite usar variables anidadas (ej: )
    }),

    /**
     * TypeOrmModule - Configuración de la base de datos
     *
     * Conexión asíncrona con PostgreSQL y configuración avanzada.
     * Se inicializa primero la conexión a la base de datos.
     */
    // TypeORM solo si INCLUDING_DATA_BASE_SYSTEM=true
    ...(process.env.INCLUDING_DATA_BASE_SYSTEM === 'true'
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async () => {
              const dataSource = await initializeDatabase();
              return {
                ...dataSource.options,
                autoLoadEntities: true,
                retryAttempts: 5,
                retryDelay: 3000,
                synchronize: process.env.NODE_ENV !== "production",
                logging: process.env.DB_LOGGING === "true",
              };
            },
          }),
        ]
      : []),

    /**
     * Módulos Security de la aplicación
     */
    CqrsModule,
    SecurityModule,
        AuthenticationModule,
    IdentityFederationModule,
    LoginModule,
    MfaTotpModule,
    RbacAclModule,
    SalesManagerModule,
    SecurityCustomerModule,
    SecurityMasterDataModule,
    SecurityMerchantModule,
    SessionTokenModule,
    SystemAdminPolicyModule,
    UserProfileModule,
    UserModule,    
    /**
     * Módulo Logger de la aplicación
     */
    LoggingModule,

    // GraphQL solo si GRAPHQL_ENABLED=true
    ...(process.env.GRAPHQL_ENABLED === 'true'
      ? [
          GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            buildSchemaOptions: {
              dateScalarMode: "timestamp",
            },
            resolvers: { JSON: GraphQLJSON },
          }),
        ]
      : []),
  ],

  /**
   * Controladores de Security
   *
   * Registro de controladores a nivel de aplicación.
   */
  controllers: [
  //No se recomienda habilitar los controladores si ya fueron declarados en el módulo: SecurityModule
  /*
  
  SecurityCommandController, 
  SecurityQueryController
  
  */
  ],

  /**
   * Proveedores (Servicios, Repositorios, etc.) de Security
   *
   * Registro de servicios globales y configuración de inyección de dependencias.
   */
  providers: [
    // Configuración de Base de datos
    ...(process.env.INCLUDING_DATA_BASE_SYSTEM === 'true'
      ? [
          {
            provide: DataSource,
            useValue: AppDataSource,
          },
        ]
      : []),
    // Se importan los servicios del módulo
    SecurityCommandService,
    SecurityQueryService,
    LoggerService
  ],

  /**
   * Exportaciones de módulos y servicios
   *
   * Hace disponibles módulos y servicios para otros módulos que importen este módulo.
   */
  exports: [SecurityCommandService, SecurityQueryService,LoggerService],
})
export class SecurityAppModule implements OnModuleInit {
  /**
   * Constructor del módulo principal
   * @param dataSource Instancia inyectada del DataSource
   * @param translocoService Servicio para manejo de idiomas
   */
  constructor(
    private moduleRef: ModuleRef,
    @Optional() @Inject(DataSource) private readonly dataSource?: DataSource
  ) {
    if (process.env.INCLUDING_DATA_BASE_SYSTEM === 'true') {
      this.checkDatabaseConnection();
    }
    this.setupLanguageChangeHandling();
    this.onModuleInit();
  }
  onModuleInit() {
    //Inicializar servicios del microservicio
    ServiceRegistry.getInstance().setModuleRef(this.moduleRef);
    ServiceRegistry.getInstance().registryAll([
      SecurityCommandService,
      SecurityQueryService,
      AuthenticationCommandService,
      AuthenticationQueryService,
      IdentityFederationCommandService,
      IdentityFederationQueryService,
      LoginCommandService,
      LoginQueryService,
      MfaTotpCommandService,
      MfaTotpQueryService,
      RbacAclCommandService,
      RbacAclQueryService,
      SalesManagerCommandService,
      SalesManagerQueryService,
      SecurityCustomerCommandService,
      SecurityCustomerQueryService,
      SecurityMasterDataCommandService,
      SecurityMasterDataQueryService,
      SecurityMerchantCommandService,
      SecurityMerchantQueryService,
      SessionTokenCommandService,
      SessionTokenQueryService,
      SystemAdminPolicyCommandService,
      SystemAdminPolicyQueryService,
      UserProfileCommandService,
      UserProfileQueryService,
      UserCommandService,
      UserQueryService,    
    ]);
    const loggerService = ServiceRegistry.getInstance().get(
      "LoggerService"
    ) as LoggerService;
    if (loggerService) 
    loggerService.log(ServiceRegistry.getInstance());
  }
  /**
   * Verifica la conexión a la base de datos al iniciar
   *
   * Realiza una consulta simple para confirmar que la conexión está activa.
   * Termina la aplicación si no puede establecer conexión.
   */
  private async checkDatabaseConnection() {
    try {
      if (!this.dataSource) return;
      await this.dataSource.query("SELECT 1");
      logger.log("✅ Conexión a la base de datos verificada correctamente");
    } catch (error) {
      logger.error(
        "❌ Error crítico: No se pudo conectar a la base de datos",
        error
      );
      process.exit(1); // Termina la aplicación con código de error
    }
  }

  /**
   * Configura el manejo de cambios de idioma
   *
   * Suscribe a eventos de cambio de idioma para mantener consistencia.
   */
  private setupLanguageChangeHandling() {}
}


