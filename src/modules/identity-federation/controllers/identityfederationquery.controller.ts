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
import { IdentityFederationQueryService } from "../services/identityfederationquery.service";
import { FindManyOptions } from "typeorm";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { IdentityFederationResponse, IdentityFederationsResponse } from "../types/identityfederation.types";
import { LoggerClient } from "src/common/logger/logger.client";
import { IdentityFederation } from "../entities/identity-federation.entity";
import { IdentityFederationAuthGuard } from "../guards/identityfederationauthguard.guard";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { OrderBy, valueOfOrderBy } from "src/common/types/common.types";
import { Helper } from "src/common/helpers/helpers";
import { IdentityFederationDto } from "../dtos/all-dto";

import { logger } from '@core/logs/logger';

@ApiTags("IdentityFederation Query")
@UseGuards(IdentityFederationAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ status: 401, description: "Autenticación requerida." })
@Controller("identityfederations/query")
export class IdentityFederationQueryController {
  #logger = new Logger(IdentityFederationQueryController.name);

  constructor(private readonly service: IdentityFederationQueryService) {}

  @Get("list")
  @ApiOperation({ summary: "Get all identityfederation with optional pagination" })
  @ApiResponse({ status: 200, type: IdentityFederationsResponse })
  @ApiQuery({ name: "options", required: false, type: IdentityFederationDto }) // Ajustar según el tipo real
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
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
  })
  async findAll(
    @Query("options") options?: FindManyOptions<IdentityFederation>    
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
    try {
     
      const identityfederations = await this.service.findAll(options);
      logger.info("Retrieving all identityfederation");
      return identityfederations;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get identityfederation by ID" })
  @ApiResponse({ status: 200, type: IdentityFederationResponse<IdentityFederation> })
  @ApiResponse({ status: 404, description: "IdentityFederation not found" })
  @ApiParam({ name: 'id', required: true, description: 'ID of the identityfederation to retrieve', type: String })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
  })
  async findById(@Param("id") id: string): Promise<IdentityFederationResponse<IdentityFederation>> {
    try {
      const identityfederation = await this.service.findOne({ where: { id } });
      if (!identityfederation) {
        throw new NotFoundException(
          "IdentityFederation no encontrado para el id solicitado"
        );
      }
      return identityfederation;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("field/:field") // Asegúrate de que el endpoint esté definido correctamente
  @ApiOperation({ summary: "Find identityfederation by specific field" })
  @ApiQuery({ name: "value", required: true, description: 'Value to search for', type: String }) // Documenta el parámetro de consulta
  @ApiParam({ name: 'field', required: true, description: 'Field to filter identityfederation', type: String }) // Documenta el parámetro de la ruta
  @ApiResponse({ status: 200, type: IdentityFederationsResponse })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
  })
  async findByField(
    @Param("field") field: string, // Obtiene el campo de la ruta
    @Query("value") value: string, // Obtiene el valor de la consulta
    @Query() paginationArgs?: PaginationArgs
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
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
          "IdentityFederation no encontrados para la propiedad y valor especificado"
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }


  @Get("pagination")
  @ApiOperation({ summary: "Find identityfederations with pagination" })
  @ApiResponse({ status: 200, type: IdentityFederationsResponse<IdentityFederation> })
  @ApiQuery({ name: "options", required: false, type: IdentityFederationDto }) // Ajustar según el tipo real
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
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
  })
  async findWithPagination(
    @Query() options: FindManyOptions<IdentityFederation>,
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("search") search?: string,
    @Query("initDate") initDate?: Date,
    @Query("endDate") endDate?: Date
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
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
        throw new NotFoundException("Entidades IdentityFederations no encontradas.");
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("count")
  @ApiOperation({ summary: "Count all identityfederations" })
  @ApiResponse({ status: 200, type: Number })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
  })
  async count(): Promise<number> {
    return this.service.count();
  }

  @Get("search")
  @ApiOperation({ summary: "Find and count identityfederations with conditions" })
  @ApiResponse({ status: 200, type: IdentityFederationsResponse<IdentityFederation> })
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
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
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
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
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
          "Entidades IdentityFederations no encontradas para el criterio especificado."
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one")
  @ApiOperation({ summary: "Find one identityfederation with conditions" })
  @ApiResponse({ status: 200, type: IdentityFederationResponse<IdentityFederation> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
  })
  async findOne(
    @Query() where: Record<string, any>={}
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        throw new NotFoundException("Entidad IdentityFederation no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one-or-fail")
  @ApiOperation({ summary: "Find one identityfederation or return error" })
  @ApiResponse({ status: 200, type: IdentityFederationResponse<IdentityFederation> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
  })
  async findOneOrFail(
    @Query() where: Record<string, any>={}
  ): Promise<IdentityFederationResponse<IdentityFederation> | Error> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        return new NotFoundException("Entidad IdentityFederation no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
}


