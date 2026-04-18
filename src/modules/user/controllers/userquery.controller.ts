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
import { UserService } from "../services/user.service";
import { UserQueryService } from "../services/userquery.service";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { UserResponse, UsersResponse } from "../types/user.types";
import { LoggerClient } from "src/common/logger/logger.client";
import { User } from "../entities/user.entity";
import { UserAuthGuard } from "../guards/userauthguard.guard";
import { Helper } from "src/common/helpers/helpers";
import { UserListQueryDto } from "../dtos/all-dto";

import { logger } from '@core/logs/logger';

@ApiTags("User Query")
@UseGuards(UserAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("users/query")
export class UserQueryController {
  #logger = new Logger(UserQueryController.name);

  constructor(private readonly service: UserService) {}

  @Get("list")
  @ApiOperation({ summary: "Listar usuarios con filtros opcionales" })
  @ApiResponse({ status: 200, type: UsersResponse })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "size", required: false, type: Number })
  @ApiQuery({ name: "sort", required: false, type: String })
  @ApiQuery({ name: "order", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "id", required: false, type: String })
  @ApiQuery({ name: "code", required: false, type: String })
  @ApiQuery({ name: "username", required: false, type: String })
  @ApiQuery({ name: "email", required: false, type: String })
  @ApiQuery({ name: "phone", required: false, type: String })
  @ApiQuery({ name: "identifierType", required: false, type: String })
  @ApiQuery({ name: "identifierValue", required: false, type: String })
  @ApiQuery({ name: "accountStatus", required: false, type: String })
  @ApiQuery({ name: "userType", required: false, type: String })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiQuery({ name: "termsAccepted", required: false, type: Boolean })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async findAll(
    @Query() filters?: UserListQueryDto
  ): Promise<UsersResponse<User>> {
    try {
      const users = await this.service.findAll(filters);
      logger.info("Retrieving all user");
      return users;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, type: UserResponse<User> })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiParam({ name: 'id', required: true, description: 'ID of the user to retrieve', type: String })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async findById(@Param("id") id: string): Promise<UserResponse<User>> {
    try {
      const user = await this.service.findById(id);
      if (!user) {
        throw new NotFoundException(
          "User no encontrado para el id solicitado"
        );
      }
      return user;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("field/:field") // Asegúrate de que el endpoint esté definido correctamente
  @ApiOperation({ summary: "Find user by specific field" })
  @ApiQuery({ name: "value", required: true, description: 'Value to search for', type: String }) // Documenta el parámetro de consulta
  @ApiParam({ name: 'field', required: true, description: 'Field to filter user', type: String }) // Documenta el parámetro de la ruta
  @ApiResponse({ status: 200, type: UsersResponse })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async findByField(
    @Param("field") field: string, // Obtiene el campo de la ruta
    @Query("value") value: string, // Obtiene el valor de la consulta
    @Query("page") page?: number,
    @Query("size") size?: number,
  ): Promise<UsersResponse<User>> {
    try {
      const entities = await this.service.findByField(field, value, page, size);

      if (!entities) {
        throw new NotFoundException(
          "User no encontrados para la propiedad y valor especificado"
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }


  @Get("pagination")
  @ApiOperation({ summary: "Find users with pagination" })
  @ApiResponse({ status: 200, type: UsersResponse<User> })
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
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async findWithPagination(
    @Query() filters: UserListQueryDto,
  ): Promise<UsersResponse<User>> {
    try {
      const entities = await this.service.findAll(filters);
      if (!entities) {
        throw new NotFoundException("Entidades Users no encontradas.");
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("count")
  @ApiOperation({ summary: "Count all users" })
  @ApiResponse({ status: 200, type: Number })
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async count(): Promise<number> {
    return this.service.count();
  }

  @Get("search")
  @ApiOperation({ summary: "Find and count users with conditions" })
  @ApiResponse({ status: 200, type: UsersResponse<User> })
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
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async findAndCount(
    @Query() where: Record<string, any>={},
  ): Promise<UsersResponse<User>> {
    try {
      const entities = await this.service.findAndCount(where);

      if (!entities) {
        throw new NotFoundException(
          "Entidades Users no encontradas para el criterio especificado."
        );
      }
      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one")
  @ApiOperation({ summary: "Find one user with conditions" })
  @ApiResponse({ status: 200, type: UserResponse<User> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async findOne(
    @Query() where: Record<string, any>={}
  ): Promise<UserResponse<User>> {
    try {
      const entity = await this.service.findOne(where);

      if (!entity) {
        throw new NotFoundException("Entidad User no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @Get("find-one-or-fail")
  @ApiOperation({ summary: "Find one user or return error" })
  @ApiResponse({ status: 200, type: UserResponse<User> })
  @ApiQuery({ name: "where", required: true, type: Object }) // Ajustar según el tipo real
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      return await client.send(logData);
    },
    client: LoggerClient.getInstance()
      .registerClient(UserQueryService.name)
      .get(UserQueryService.name),
  })
  async findOneOrFail(
    @Query() where: Record<string, any>={}
  ): Promise<UserResponse<User> | Error> {
    try {
      const entity = await this.service.findOneOrFail(where);

      if (!entity) {
        return new NotFoundException("Entidad User no encontrada.");
      }
      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }
}


