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
import { MfaTotpQueryService } from "../services/mfatotpquery.service";
import { FindManyOptions } from "typeorm";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { MfaTotpResponse, MfaTotpsResponse } from "../types/mfatotp.types";
import { LoggerClient } from "src/common/logger/logger.client";
import { MfaTotp } from "../entities/mfa-totp.entity";
import { MfaTotpAuthGuard } from "../guards/mfatotpauthguard.guard";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { OrderBy, valueOfOrderBy } from "src/common/types/common.types";
import { Helper } from "src/common/helpers/helpers";
import { MfaTotpDto } from "../dtos/all-dto";

import { logger } from '@core/logs/logger';

@ApiTags("MfaTotp Query")
@UseGuards(MfaTotpAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("mfatotps/query")
export class MfaTotpQueryController {
  #logger = new Logger(MfaTotpQueryController.name);

  constructor(private readonly service: MfaTotpQueryService) {}

  @Get("list")
  @ApiOperation({ summary: "Get all mfatotp with optional pagination" })
  @ApiResponse({ status: 200, type: MfaTotpsResponse })
  @ApiQuery({ name: "options", required: false, type: MfaTotpDto }) // Ajustar según el tipo real
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
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
  })
  async findAll(
    @Query("options") options?: FindManyOptions<MfaTotp>    
  ): Promise<MfaTotpsResponse<MfaTotp>> {
    try {
     
      const mfatotps = await this.service.findAll(options);
      logger.info("Retrieving all mfatotp");
      return mfatotps;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get mfatotp by ID" })
  @ApiResponse({ status: 200, type: MfaTotpResponse<MfaTotp> })
  @ApiResponse({ status: 404, description: "MfaTotp not found" })
  @ApiParam({ name: 'id', required: true, description: 'ID of the mfatotp to retrieve', type: String })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
  })
  async findById(@Param("id") id: string): Promise<MfaTotpResponse<MfaTotp>> {
    try {
      const mfatotp = await this.service.findOne({ where: { id } });
      if (!mfatotp) {
        throw new NotFoundException(
          "MfaTotp no encontrado para el id solicitado"
        );
      }
      return mfatotp;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("field/:field") // Asegúrate de que el endpoint esté definido correctamente
  @ApiOperation({ summary: "Find mfatotp by specific field" })
  @ApiQuery({ name: "value", required: true, description: 'Value to search for', type: String }) // Documenta el parámetro de consulta
  @ApiParam({ name: 'field', required: true, description: 'Field to filter mfatotp', type: String }) // Documenta el parámetro de la ruta
  @ApiResponse({ status: 200, type: MfaTotpsResponse })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
  })
  async findByField(
    @Param("field") field: string, // Obtiene el campo de la ruta
    @Query("value") value: string, // Obtiene el valor de la consulta
    @Query() paginationArgs?: PaginationArgs
  ): Promise<MfaTotpsResponse<MfaTotp>> {
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
          "MfaTotp no encontrados para la propiedad y valor especificado"
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }


  @Get("pagination")
  @ApiOperation({ summary: "Find mfatotps with pagination" })
  @ApiResponse({ status: 200, type: MfaTotpsResponse<MfaTotp> })
  @ApiQuery({ name: "options", required: false, type: MfaTotpDto }) // Ajustar según el tipo real
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
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
  })
  async findWithPagination(
    @Query() options: FindManyOptions<MfaTotp>,
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("sort") sort?: string,
    @Query("order") order?: string,
    @Query("search") search?: string,
    @Query("initDate") initDate?: Date,
    @Query("endDate") endDate?: Date
  ): Promise<MfaTotpsResponse<MfaTotp>> {
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
        throw new NotFoundException("Entidades MfaTotps no encontradas.");
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("count")
  @ApiOperation({ summary: "Count all mfatotps" })
  @ApiResponse({ status: 200, type: Number })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
  })
  async count(): Promise<number> {
    return this.service.count();
  }

  @Get("search")
  @ApiOperation({ summary: "Find and count mfatotps with conditions" })
  @ApiResponse({ status: 200, type: MfaTotpsResponse<MfaTotp> })
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
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
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
  ): Promise<MfaTotpsResponse<MfaTotp>> {
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
          "Entidades MfaTotps no encontradas para el criterio especificado."
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one")
  @ApiOperation({ summary: "Find one mfatotp with conditions" })
  @ApiResponse({ status: 200, type: MfaTotpResponse<MfaTotp> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
  })
  async findOne(
    @Query() where: Record<string, any>={}
  ): Promise<MfaTotpResponse<MfaTotp>> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        throw new NotFoundException("Entidad MfaTotp no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one-or-fail")
  @ApiOperation({ summary: "Find one mfatotp or return error" })
  @ApiResponse({ status: 200, type: MfaTotpResponse<MfaTotp> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
  })
  async findOneOrFail(
    @Query() where: Record<string, any>={}
  ): Promise<MfaTotpResponse<MfaTotp> | Error> {
    try {
      const entity = await this.service.findOne({
        where: where,
      });

      if (!entity) {
        return new NotFoundException("Entidad MfaTotp no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
}


