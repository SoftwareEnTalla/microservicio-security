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
import { AuthMethodCommandController } from "../controllers/authmethodcommand.controller";
import { AuthMethodLoggingInterceptor } from "../interceptors/authmethod.logging.interceptor";
import { CommandBus, EventBus, UnhandledExceptionBus } from "@nestjs/cqrs";
import { AuthMethodAuthGuard } from "../guards/authmethodauthguard.guard";

@Module({
  controllers: [AuthMethodCommandController],
  providers: [
    AuthMethodAuthGuard,
    AuthMethodLoggingInterceptor,
    CommandBus,
    EventBus,
    UnhandledExceptionBus,
  ],
  exports: [AuthMethodAuthGuard, CommandBus, EventBus, UnhandledExceptionBus],
})
export class AuthAuthMethodModule {}
