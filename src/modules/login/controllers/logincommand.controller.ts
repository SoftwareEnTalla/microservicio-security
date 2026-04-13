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


import { Controller, Body, Logger, Post, Get, Put, Patch, Delete, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LoginService } from "../services/login.service";
import { Login } from "../entities/login.entity";
import { LoginResponse, FederatedLoginStartResponse, LogoutResponse } from "../types/login.types";
import { LoginAuthenticateWithPasswordDto, LoginStartFederatedLoginDto, LoginRefreshSessionDto, LoginLogoutDto } from "../dtos/all-dto";
import { LoginAuthGuard } from "../guards/loginauthguard.guard";
import { Helper } from "src/common/helpers/helpers";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';
@ApiTags("Login Command")
@Controller("logins/command")
export class LoginCommandController {
  #logger = new Logger(LoginCommandController.name);
  constructor(private readonly service: LoginService) {}
  @ApiOperation({ summary: "Autenticar localmente con identificador y contraseña" })
  @ApiBody({ type: LoginAuthenticateWithPasswordDto })
  @ApiResponse({ status: 200, type: LoginResponse<Login> })
  @Post()
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      try {
        logger.info('Información del cliente y datos a enviar:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance().registerClient(LoginCommandController.name).get(LoginCommandController.name),
  })
  async authenticateWithPassword(@Body() payload: LoginAuthenticateWithPasswordDto): Promise<LoginResponse<Login>> {
    try {
      return await this.service.authenticateWithPassword(payload);
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
  @ApiOperation({ summary: "Iniciar autenticación con proveedor externo" })
  @ApiBody({ type: LoginStartFederatedLoginDto })
  @ApiResponse({ status: 200, type: FederatedLoginStartResponse })
  @Post("federated/start")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      try {
        logger.info('Información del cliente y datos a enviar:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance().registerClient(LoginCommandController.name).get(LoginCommandController.name),
  })
  async startFederatedLogin(@Body() payload: LoginStartFederatedLoginDto): Promise<FederatedLoginStartResponse> {
    try {
      return await this.service.startFederatedLogin(payload);
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
  @ApiOperation({ summary: "Renovar una sesión vigente" })
  @ApiBody({ type: LoginRefreshSessionDto })
  @ApiResponse({ status: 200, type: LoginResponse<Login> })
  @UseGuards(LoginAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: "Autenticación requerida." })
  @Post("refresh")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      try {
        logger.info('Información del cliente y datos a enviar:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance().registerClient(LoginCommandController.name).get(LoginCommandController.name),
  })
  async refreshSession(@Body() payload: LoginRefreshSessionDto): Promise<LoginResponse<Login>> {
    try {
      return await this.service.refreshSession(payload);
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
  @ApiOperation({ summary: "Cerrar sesión" })
  @ApiBody({ type: LoginLogoutDto })
  @ApiResponse({ status: 200, type: LogoutResponse })
  @UseGuards(LoginAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: "Autenticación requerida." })
  @Post("logout")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      try {
        logger.info('Información del cliente y datos a enviar:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance().registerClient(LoginCommandController.name).get(LoginCommandController.name),
  })
  async logout(@Body() payload: LoginLogoutDto): Promise<LogoutResponse> {
    try {
      return await this.service.logout(payload);
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
}
