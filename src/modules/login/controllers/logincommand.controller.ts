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


import { Controller, Body, Logger, Post, Get, Put, Patch, Delete, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LoginService } from "../services/login.service";
import { Login } from "../entities/login.entity";
import { LoginResponse, FederatedLoginStartResponse, LogoutResponse } from "../types/login.types";
import { LoginAuthenticateWithPasswordDto, LoginStartFederatedLoginDto, LoginRefreshSessionDto, LoginLogoutDto, LoginFederatedCallbackDto } from "../dtos/all-dto";
import { LoginAuthGuard } from "../guards/loginauthguard.guard";
import { Public } from "src/common/horizontal/public.decorator";
import { Helper } from "src/common/helpers/helpers";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { HttpLoggerClient } from "src/common/logger/http-logger.client";
import { getRemoteApiLoggerUrl } from "src/common/logger/loggers.functions";
import { logger } from '@core/logs/logger';
@ApiTags("Login Command")
@Controller("logins/command")
export class LoginCommandController {
  #logger = new Logger(LoginCommandController.name);
  constructor(private readonly service: LoginService) {}

  private async emitPublicTrace(status: "success" | "error", requestPath?: string, errorMessage?: string): Promise<void> {
    const client = new HttpLoggerClient(getRemoteApiLoggerUrl(), false);
    try {
      const connected = await client.connect();
      if (!connected) {
        return;
      }

      await client.send({
        endpoint: getRemoteApiLoggerUrl(),
        method: "POST",
        headers: {
          "x-trace-source": "security-service",
          ...(requestPath ? { "x-trace-public-path": requestPath } : {}),
        },
        body: {
          layer: "controller",
          className: LoginCommandController.name,
          functionName: `${LoginCommandController.name}.authenticateWithPassword`,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 0,
          durationUnit: "ms",
          status,
          ...(errorMessage ? { error: { message: errorMessage } } : {}),
        },
      });
    } catch (traceError) {
      logger.error(traceError);
    } finally {
      await client.close();
    }
  }

  @ApiOperation({ summary: "Autenticar localmente con identificador y contraseña" })
  @ApiBody({ type: LoginAuthenticateWithPasswordDto })
  @ApiResponse({ status: 200, type: LoginResponse<Login> })
  @Public()
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
  async authenticateWithPassword(@Body() payload: LoginAuthenticateWithPasswordDto, @Req() req?: any): Promise<LoginResponse<Login>> {
    try {
      if (req) {
        payload.ipAddress = payload.ipAddress || (req.ip || req.headers?.["x-forwarded-for"] || "");
        payload.userAgent = payload.userAgent || (req.headers?.["user-agent"] || "");
      }
      const response = await this.service.authenticateWithPassword(payload);
      await this.emitPublicTrace("success", req?.originalUrl || req?.url);
      return response;
    } catch (error) {
      await this.emitPublicTrace(
        "error",
        req?.originalUrl || req?.url,
        error instanceof Error ? error.message : String(error),
      );
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
  @ApiOperation({ summary: "Iniciar autenticación con proveedor externo" })
  @ApiBody({ type: LoginStartFederatedLoginDto })
  @ApiResponse({ status: 200, type: FederatedLoginStartResponse })
  @Public()
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

  @ApiOperation({ summary: "Finalizar autenticación federada tras callback del IdP" })
  @ApiBody({ type: LoginFederatedCallbackDto })
  @ApiResponse({ status: 200, type: LoginResponse<Login> })
  @Public()
  @Post("federated/callback")
  async finalizeFederatedLogin(@Body() payload: LoginFederatedCallbackDto): Promise<LoginResponse<Login>> {
    try {
      return await this.service.finalizeFederatedLogin(payload);
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
