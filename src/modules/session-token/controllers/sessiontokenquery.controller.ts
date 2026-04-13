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


import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Logger,
  UseGuards,
} from "@nestjs/common";
import { SessionTokenQueryService } from "../services/sessiontokenquery.service";
import { FindManyOptions } from "typeorm";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { SessionTokenResponse, SessionTokensResponse } from "../types/sessiontoken.types";
import { LoggerClient } from "src/common/logger/logger.client";
import { SessionToken } from "../entities/session-token.entity";
import { SessionTokenAuthGuard } from "../guards/sessiontokenauthguard.guard";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { OrderBy, valueOfOrderBy } from "src/common/types/common.types";
import { Helper } from "src/common/helpers/helpers";
import { SessionTokenDto } from "../dtos/all-dto";

import { logger } from '@core/logs/logger';

@ApiTags("SessionToken Query")
@UseGuards(SessionTokenAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("sessiontokens/query")
export class SessionTokenQueryController {
  #logger = new Logger(SessionTokenQueryController.name);

  constructor(private readonly service: SessionTokenQueryService) {}

  @Get("list")
  @ApiOperation({ summary: "Get all sessiontoken with optional pagination" })
  @ApiResponse({ status: 200, type: SessionTokensResponse })
  @ApiQuery({ name: "options", required: false, type: SessionTokenDto }) // Ajustar según el tipo real
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "size", required: false, type: Number })
  @ApiQuery({ name: "sort", required: false, type: String })
  @ApiQuery({ name: "order", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "initDate", required: false, type: Date })
  @ApiQuery({ name: "endDate", required: false, type: Date })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async findAll(
    @Query("options") options?: FindManyOptions<SessionToken>    
  ): Promise<SessionTokensResponse<SessionToken>> {
    try {
     
      const sessiontokens = await this.service.findAll(options);
      logger.info("Retrieving all sessiontoken");
      return sessiontokens;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get sessiontoken by ID" })
  @ApiResponse({ status: 200, type: SessionTokenResponse<SessionToken> })
  @ApiResponse({ status: 404, description: "SessionToken not found" })
  @ApiParam({ name: 'id', required: true, description: 'ID of the sessiontoken to retrieve', type: String })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async findById(@Param("id") id: string): Promise<SessionTokenResponse<SessionToken>> {
    try {
      const sessiontoken = await this.service.findOne({ where: { id } });
      if (!sessiontoken) {
        throw new NotFoundException(
          "SessionToken no encontrado para el id solicitado"
        );
      }
      return sessiontoken;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("field/:field") // Asegúrate de que el endpoint esté definido correctamente
  @ApiOperation({ summary: "Find sessiontoken by specific field" })
  @ApiQuery({ name: "value", required: true, description: 'Value to search for', type: String }) // Documenta el parámetro de consulta
  @ApiParam({ name: 'field', required: true, description: 'Field to filter sessiontoken', type: String }) // Documenta el parámetro de la ruta
  @ApiResponse({ status: 200, type: SessionTokensResponse })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async findByField(
    @Param("field") field: string, // Obtiene el campo de la ruta
    @Query("value") value: string, // Obtiene el valor de la consulta
    @Query() paginationArgs?: PaginationArgs
  ): Promise<SessionTokensResponse<SessionToken>> {
    try {
      const entities = await this.service.findAndCount({
        where: { [field]: value },
        skip:
          ((paginationArgs ? paginationArgs.page : 1) - 1) *
          (paginationArgs ? paginationArgs.size : 25),
        take: paginationArgs ? paginationArgs.size : 25,
      });

      if (!entities) {
        throw new NotFoundException(
          "SessionToken no encontrados para la propiedad y valor especificado"
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }


  @Get("pagination")
  @ApiOperation({ summary: "Find sessiontokens with pagination" })
  @ApiResponse({ status: 200, type: SessionTokensResponse<SessionToken> })
  @ApiQuery({ name: "options", required: false, type: SessionTokenDto }) // Ajustar según el tipo real
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "size", required: false, type: Number })
  @ApiQuery({ name: "sort", required: false, type: String })
  @ApiQuery({ name: "order", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "initDate", required: false, type: Date })
  @ApiQuery({ name: "endDate", required: false, type: Date })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async findWithPagination(
    @Query() options: FindManyOptions<SessionToken>,
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("search") search?: string,
    @Query("initDate") initDate?: Date,
    @Query("endDate") endDate?: Date
  ): Promise<SessionTokensResponse<SessionToken>> {
    try {
     const paginationArgs: PaginationArgs = PaginationArgs.createPaginator(
        page || 1,
        size || 25,
        sort || "createdAt", // Asigna valor por defecto
        valueOfOrderBy(order || OrderBy.asc), // Asigna valor por defecto
        search || "", // Asigna valor por defecto
        initDate || undefined, // Puede ser undefined si no se proporciona
        endDate || undefined // Puede ser undefined si no se proporciona
      );
      const entities = await this.service.findWithPagination(
        options,
        paginationArgs
      );
      if (!entities) {
        throw new NotFoundException("Entidades SessionTokens no encontradas.");
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("count")
  @ApiOperation({ summary: "Count all sessiontokens" })
  @ApiResponse({ status: 200, type: Number })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async count(): Promise<number> {
    return this.service.count();
  }

  @Get("search")
  @ApiOperation({ summary: "Find and count sessiontokens with conditions" })
  @ApiResponse({ status: 200, type: SessionTokensResponse<SessionToken> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "size", required: false, type: Number })
  @ApiQuery({ name: "sort", required: false, type: String })
  @ApiQuery({ name: "order", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "initDate", required: false, type: Date })
  @ApiQuery({ name: "endDate", required: false, type: Date })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async findAndCount(
    @Query() where: Record<string, any>={},
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("search") search?: string,
    @Query("initDate") initDate?: Date,
    @Query("endDate") endDate?: Date
  ): Promise<SessionTokensResponse<SessionToken>> {
    try {
      const paginationArgs: PaginationArgs = PaginationArgs.createPaginator(
        page || 1,
        size || 25,
        sort || "createdAt", // Asigna valor por defecto
        valueOfOrderBy(order || OrderBy.asc), // Asigna valor por defecto
        search || "", // Asigna valor por defecto
        initDate || undefined, // Puede ser undefined si no se proporciona
        endDate || undefined // Puede ser undefined si no se proporciona
      );
      const entities = await this.service.findAndCount({
        where: where,
        paginationArgs: paginationArgs,
      });

      if (!entities) {
        throw new NotFoundException(
          "Entidades SessionTokens no encontradas para el criterio especificado."
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one")
  @ApiOperation({ summary: "Find one sessiontoken with conditions" })
  @ApiResponse({ status: 200, type: SessionTokenResponse<SessionToken> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async findOne(
    @Query() where: Record<string, any>={}
  ): Promise<SessionTokenResponse<SessionToken>> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        throw new NotFoundException("Entidad SessionToken no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one-or-fail")
  @ApiOperation({ summary: "Find one sessiontoken or return error" })
  @ApiResponse({ status: 200, type: SessionTokenResponse<SessionToken> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SessionTokenQueryService.name)
      .get(SessionTokenQueryService.name),
  })
  async findOneOrFail(
    @Query() where: Record<string, any>={}
  ): Promise<SessionTokenResponse<SessionToken> | Error> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        return new NotFoundException("Entidad SessionToken no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
}


