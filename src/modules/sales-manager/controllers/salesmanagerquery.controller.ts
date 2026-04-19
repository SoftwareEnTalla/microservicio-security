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
import { SalesManagerQueryService } from "../services/salesmanagerquery.service";
import { FindManyOptions } from "typeorm";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { SalesManagerResponse, SalesManagersResponse } from "../types/salesmanager.types";
import { LoggerClient } from "src/common/logger/logger.client";
import { SalesManager } from "../entities/sales-manager.entity";
import { SalesManagerAuthGuard } from "../guards/salesmanagerauthguard.guard";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { OrderBy, valueOfOrderBy } from "src/common/types/common.types";
import { Helper } from "src/common/helpers/helpers";
import { SalesManagerDto } from "../dtos/all-dto";
import { SalesManagerReferralService } from "../services/sales-manager-referral.service";

import { logger } from '@core/logs/logger';

@ApiTags("SalesManager Query")
@UseGuards(SalesManagerAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("salesmanagers/query")
export class SalesManagerQueryController {
  #logger = new Logger(SalesManagerQueryController.name);

  constructor(
    private readonly service: SalesManagerQueryService,
    private readonly referralService: SalesManagerReferralService,
  ) {}

  @Get(":userId/referral-tree")
  @ApiOperation({ summary: "Obtiene árbol jerárquico de referidos." })
  @ApiParam({ name: "userId", type: String })
  @ApiQuery({ name: "maxDepth", required: false, type: Number })
  async getReferralTree(
    @Param("userId") userId: string,
    @Query("maxDepth") maxDepth?: string,
  ) {
    const depth = maxDepth ? parseInt(maxDepth, 10) : 5;
    return this.referralService.buildReferralTree(userId, depth);
  }

  @Get(":userId/ancestors")
  @ApiOperation({ summary: "Lista cadena ancestor de referidos." })
  @ApiParam({ name: "userId", type: String })
  @ApiQuery({ name: "maxDepth", required: false, type: Number })
  async getAncestors(
    @Param("userId") userId: string,
    @Query("maxDepth") maxDepth?: string,
  ) {
    const depth = maxDepth ? parseInt(maxDepth, 10) : 10;
    return this.referralService.listAncestors(userId, depth);
  }

  @Get("list")
  @ApiOperation({ summary: "Get all salesmanager with optional pagination" })
  @ApiResponse({ status: 200, type: SalesManagersResponse })
  @ApiQuery({ name: "options", required: false, type: SalesManagerDto }) // Ajustar según el tipo real
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
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
  })
  async findAll(
    @Query("options") options?: FindManyOptions<SalesManager>    
  ): Promise<SalesManagersResponse<SalesManager>> {
    try {
     
      const salesmanagers = await this.service.findAll(options);
      logger.info("Retrieving all salesmanager");
      return salesmanagers;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get salesmanager by ID" })
  @ApiResponse({ status: 200, type: SalesManagerResponse<SalesManager> })
  @ApiResponse({ status: 404, description: "SalesManager not found" })
  @ApiParam({ name: 'id', required: true, description: 'ID of the salesmanager to retrieve', type: String })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
  })
  async findById(@Param("id") id: string): Promise<SalesManagerResponse<SalesManager>> {
    try {
      const salesmanager = await this.service.findOne({ where: { id } });
      if (!salesmanager) {
        throw new NotFoundException(
          "SalesManager no encontrado para el id solicitado"
        );
      }
      return salesmanager;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("field/:field") // Asegúrate de que el endpoint esté definido correctamente
  @ApiOperation({ summary: "Find salesmanager by specific field" })
  @ApiQuery({ name: "value", required: true, description: 'Value to search for', type: String }) // Documenta el parámetro de consulta
  @ApiParam({ name: 'field', required: true, description: 'Field to filter salesmanager', type: String }) // Documenta el parámetro de la ruta
  @ApiResponse({ status: 200, type: SalesManagersResponse })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
  })
  async findByField(
    @Param("field") field: string, // Obtiene el campo de la ruta
    @Query("value") value: string, // Obtiene el valor de la consulta
    @Query() paginationArgs?: PaginationArgs
  ): Promise<SalesManagersResponse<SalesManager>> {
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
          "SalesManager no encontrados para la propiedad y valor especificado"
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }


  @Get("pagination")
  @ApiOperation({ summary: "Find salesmanagers with pagination" })
  @ApiResponse({ status: 200, type: SalesManagersResponse<SalesManager> })
  @ApiQuery({ name: "options", required: false, type: SalesManagerDto }) // Ajustar según el tipo real
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
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
  })
  async findWithPagination(
    @Query() options: FindManyOptions<SalesManager>,
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("search") search?: string,
    @Query("initDate") initDate?: Date,
    @Query("endDate") endDate?: Date
  ): Promise<SalesManagersResponse<SalesManager>> {
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
        throw new NotFoundException("Entidades SalesManagers no encontradas.");
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("count")
  @ApiOperation({ summary: "Count all salesmanagers" })
  @ApiResponse({ status: 200, type: Number })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
  })
  async count(): Promise<number> {
    return this.service.count();
  }

  @Get("search")
  @ApiOperation({ summary: "Find and count salesmanagers with conditions" })
  @ApiResponse({ status: 200, type: SalesManagersResponse<SalesManager> })
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
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
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
  ): Promise<SalesManagersResponse<SalesManager>> {
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
          "Entidades SalesManagers no encontradas para el criterio especificado."
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one")
  @ApiOperation({ summary: "Find one salesmanager with conditions" })
  @ApiResponse({ status: 200, type: SalesManagerResponse<SalesManager> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
  })
  async findOne(
    @Query() where: Record<string, any>={}
  ): Promise<SalesManagerResponse<SalesManager>> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        throw new NotFoundException("Entidad SalesManager no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one-or-fail")
  @ApiOperation({ summary: "Find one salesmanager or return error" })
  @ApiResponse({ status: 200, type: SalesManagerResponse<SalesManager> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(SalesManagerQueryService.name)
      .get(SalesManagerQueryService.name),
  })
  async findOneOrFail(
    @Query() where: Record<string, any>={}
  ): Promise<SalesManagerResponse<SalesManager> | Error> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        return new NotFoundException("Entidad SalesManager no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
}


