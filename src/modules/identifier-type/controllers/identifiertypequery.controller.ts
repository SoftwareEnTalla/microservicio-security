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
import { IdentifierTypeQueryService } from "../services/identifiertypequery.service";
import { FindManyOptions } from "typeorm";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { IdentifierTypeResponse, IdentifierTypesResponse } from "../types/identifiertype.types";
import { LoggerClient } from "src/common/logger/logger.client";
import { IdentifierType } from "../entities/identifier-type.entity";
import { IdentifierTypeAuthGuard } from "../guards/identifiertypeauthguard.guard";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { OrderBy, valueOfOrderBy } from "src/common/types/common.types";
import { Helper } from "src/common/helpers/helpers";
import { IdentifierTypeDto } from "../dtos/all-dto";

import { logger } from '@core/logs/logger';

/**
 * Parseo tolerante del query param 'where':
 *  - Si llega como ?where={JSON}, lo parsea a objeto.
 *  - Si llega como query params planos (?isActive=true) descarta claves
 *    reservadas de paginación y devuelve el resto como where plano.
 *  - Nunca devuelve un objeto envuelto en { where: ... } (evita double-wrap).
 */
function parseWhereParam(all: Record<string, any> = {}): Record<string, any> {
  if (!all || typeof all !== "object") return {};
  const raw = (all as any).where;
  if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try { return JSON.parse(raw); } catch { /* fallthrough */ }
  }
  if (raw && typeof raw === "object") return raw as Record<string, any>;
  const reserved = new Set(["where","page","size","sort","order","search","initDate","endDate","options"]);
  const rest: Record<string, any> = {};
  for (const k of Object.keys(all)) if (!reserved.has(k)) rest[k] = (all as any)[k];
  return rest;
}

@ApiTags("IdentifierType Query")
@UseGuards(IdentifierTypeAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("identifiertypes/query")
export class IdentifierTypeQueryController {
  #logger = new Logger(IdentifierTypeQueryController.name);

  constructor(private readonly service: IdentifierTypeQueryService) {}

  @Get("list")
  @ApiOperation({ summary: "Get all identifiertype with optional pagination" })
  @ApiResponse({ status: 200, type: IdentifierTypesResponse })
  @ApiQuery({ name: "options", required: false, type: IdentifierTypeDto }) // Ajustar según el tipo real
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
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async findAll(
    @Query("options") options?: FindManyOptions<IdentifierType>    
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
    try {
     
      const identifiertypes = await this.service.findAll(options);
      logger.info("Retrieving all identifiertype");
      return identifiertypes;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("field/:field") // Asegúrate de que el endpoint esté definido correctamente
  @ApiOperation({ summary: "Find identifiertype by specific field" })
  @ApiQuery({ name: "value", required: true, description: 'Value to search for', type: String }) // Documenta el parámetro de consulta
  @ApiParam({ name: 'field', required: true, description: 'Field to filter identifiertype', type: String }) // Documenta el parámetro de la ruta
  @ApiResponse({ status: 200, type: IdentifierTypesResponse })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async findByField(
    @Param("field") field: string, // Obtiene el campo de la ruta
    @Query("value") value: string, // Obtiene el valor de la consulta
    @Query() paginationArgs?: PaginationArgs
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
    try {
      const entities = await this.service.findAndCount(
        { [field]: value },
        paginationArgs
      );

      if (!entities) {
        throw new NotFoundException(
          "IdentifierType no encontrados para la propiedad y valor especificado"
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }


  @Get("pagination")
  @ApiOperation({ summary: "Find identifiertypes with pagination" })
  @ApiResponse({ status: 200, type: IdentifierTypesResponse<IdentifierType> })
  @ApiQuery({ name: "options", required: false, type: IdentifierTypeDto }) // Ajustar según el tipo real
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
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async findWithPagination(
    @Query() options: FindManyOptions<IdentifierType>,
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("search") search?: string,
    @Query("initDate") initDate?: Date,
    @Query("endDate") endDate?: Date
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
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
        throw new NotFoundException("Entidades IdentifierTypes no encontradas.");
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("count")
  @ApiOperation({ summary: "Count all identifiertypes" })
  @ApiResponse({ status: 200, type: Number })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async count(): Promise<number> {
    return this.service.count();
  }

  @Get("search")
  @ApiOperation({ summary: "Find and count identifiertypes with conditions" })
  @ApiResponse({ status: 200, type: IdentifierTypesResponse<IdentifierType> })
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
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async findAndCount(
    @Query() all: Record<string, any> = {},
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("search") search?: string,
    @Query("initDate") initDate?: Date,
    @Query("endDate") endDate?: Date
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
    try {
      // Parseo tolerante de ?where=JSON o query params planos
      const where: Record<string, any> = parseWhereParam(all);
      const paginationArgs: PaginationArgs = PaginationArgs.createPaginator(
        page || 1,
        size || 25,
        sort || "createdAt", // Asigna valor por defecto
        valueOfOrderBy(order || OrderBy.asc), // Asigna valor por defecto
        search || "", // Asigna valor por defecto
        initDate || undefined, // Puede ser undefined si no se proporciona
        endDate || undefined // Puede ser undefined si no se proporciona
      );
      const entities = await this.service.findAndCount(where, paginationArgs);

      if (!entities) {
        throw new NotFoundException(
          "Entidades IdentifierTypes no encontradas para el criterio especificado."
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one")
  @ApiOperation({ summary: "Find one identifiertype with conditions" })
  @ApiResponse({ status: 200, type: IdentifierTypeResponse<IdentifierType> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async findOne(
    @Query() all: Record<string, any> = {}
  ): Promise<IdentifierTypeResponse<IdentifierType>> {
    try {
      const where: Record<string, any> = parseWhereParam(all);
      const entity = await this.service.findOne(where);

      if (!entity) {
        throw new NotFoundException("Entidad IdentifierType no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one-or-fail")
  @ApiOperation({ summary: "Find one identifiertype or return error" })
  @ApiResponse({ status: 200, type: IdentifierTypeResponse<IdentifierType> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async findOneOrFail(
    @Query() all: Record<string, any> = {}
  ): Promise<IdentifierTypeResponse<IdentifierType> | Error> {
    try {
      const where: Record<string, any> = parseWhereParam(all);
      const entity = await this.service.findOne(where);

      if (!entity) {
        return new NotFoundException("Entidad IdentifierType no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  // NOTA: @Get(":id") se declara al FINAL para que los endpoints estáticos
  // (/count, /search, /pagination, /find-one, /find-one-or-fail, /field/:field)
  // sean registrados antes y no sean capturados por el parámetro dinámico :id.
  @Get(":id")
  @ApiOperation({ summary: "Get identifiertype by ID" })
  @ApiResponse({ status: 200, type: IdentifierTypeResponse<IdentifierType> })
  @ApiResponse({ status: 404, description: "IdentifierType not found" })
  @ApiParam({ name: 'id', required: true, description: 'ID of the identifiertype to retrieve', type: String })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(IdentifierTypeQueryService.name)
      .get(IdentifierTypeQueryService.name),
  })
  async findById(@Param("id") id: string): Promise<IdentifierTypeResponse<IdentifierType>> {
    try {
      const identifiertype = await this.service.findOne({ where: { id } });
      if (!identifiertype) {
        throw new NotFoundException(
          "IdentifierType no encontrado para el id solicitado"
        );
      }
      return identifiertype;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
}


