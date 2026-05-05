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
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  Get,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { UserAuthGuard } from "../guards/userauthguard.guard";
import { SystemAdminGuard } from "../../system-admin-policy/guards/system-admin.guard";

import { DeleteResult } from "typeorm";
import { Logger } from "@nestjs/common";
import { Helper } from "src/common/helpers/helpers";
import { User } from "../entities/user.entity";
import { UserResponse, UsersResponse } from "../types/user.types";
import { CreateUserMinimalDto, UpdateUserMinimalDto } from "../dtos/all-dto"; 

//Loggers
import { LoggerClient } from "src/common/logger/logger.client";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { logger } from '@core/logs/logger';

import { BadRequestException } from "@nestjs/common";
import { Public } from "src/common/horizontal/public.decorator";
import { HttpLoggerClient } from "src/common/logger/http-logger.client";
import { getRemoteApiLoggerUrl } from "src/common/logger/loggers.functions";

@ApiTags("User Command")
@UseGuards(UserAuthGuard, SystemAdminGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("users/command")
export class UserCommandController {

  #logger = new Logger(UserCommandController.name);

  //Constructor del controlador: UserCommandController
  constructor(
  private readonly service: UserService,
  ) {
    //Coloca aquí la lógica que consideres necesaria para inicializar el controlador
  }

  private async emitPublicSignupTrace(status: "success" | "error", requestPath?: string, errorMessage?: string): Promise<void> {
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
          className: UserCommandController.name,
          functionName: `${UserCommandController.name}.signup`,
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

  @ApiOperation({ summary: "Crear un usuario con los datos mínimos de la historia de usuario" })
  @ApiBody({ type: CreateUserMinimalDto })
  @ApiResponse({ status: 201, type: UserResponse<User> })
  @Post()
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(UserCommandController.name)
      .get(UserCommandController.name),
  })
  async create(
    @Body() createUserDtoInput: CreateUserMinimalDto
  ): Promise<UserResponse<User>> {
    try {
      logger.info("Receiving in controller:", createUserDtoInput);
      const entity = await this.service.create(createUserDtoInput);
      logger.info("Entity created on controller:", entity);
      if (!entity) {
        throw new NotFoundException("Response user entity not found.");
      } else if (!entity.data) {
        throw new NotFoundException("User entity not found on response.");
      } else if (!entity.data.id) {
        throw new NotFoundException("Id user is null on order instance.");
      }     

      return entity;
    } catch (error) {
      logger.info("Error creating entity on controller:", error);
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @ApiOperation({ summary: "Registro público de cuenta base" })
  @ApiBody({ type: CreateUserMinimalDto })
  @ApiResponse({ status: 201, type: UserResponse<User> })
  @Public()
  @Post("signup")
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
    client: LoggerClient.getInstance()
      .registerClient(UserCommandController.name)
      .get(UserCommandController.name),
  })
  async signup(
    @Body() createUserDtoInput: CreateUserMinimalDto,
    @Req() req?: any,
  ): Promise<UserResponse<User>> {
    try {
      const response = await this.service.create(createUserDtoInput);
      await this.emitPublicSignupTrace("success", req?.originalUrl || req?.url);
      return response;
    } catch (error) {
      await this.emitPublicSignupTrace(
        "error",
        req?.originalUrl || req?.url,
        error instanceof Error ? error.message : String(error),
      );
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Crear múltiples usuarios con payload mínimo" })
  @ApiBody({ type: [CreateUserMinimalDto] })
  @ApiResponse({ status: 201, type: UsersResponse<User> })
  @Post("bulk")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(UserCommandController.name)
      .get(UserCommandController.name),
  })
  async bulkCreate(
    @Body() createUserDtosInput: CreateUserMinimalDto[]
  ): Promise<UsersResponse<User>> {
    try {
      const entities = await this.service.bulkCreate(createUserDtosInput);

      if (!entities) {
        throw new NotFoundException("User entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Actualizar un usuario" })
  @ApiParam({
    name: "id",
    description: "Identificador desde la url del endpoint",
  }) // ✅ Documentamos el ID de la URL
  @ApiBody({
    type: UpdateUserMinimalDto,
    description: "Payload parcial del usuario. El ID del body es opcional si ya viene en la URL.",
  })
  @ApiResponse({ status: 200, type: UserResponse<User> })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia User a actualizar.",
  }) // ✅ Nuevo status para el error de validación
  @Put(":id")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(UserCommandController.name)
      .get(UserCommandController.name),
  })
  async update(
    @Param("id") id: string,
    @Body() body: any
  ): Promise<UserResponse<User>> {
    try {
      // Permitir body plano o anidado en 'data'
      const partialEntity = body?.data ? body.data : body;
      // ✅ Validación de coincidencia de IDs
      if (partialEntity.id && id !== partialEntity.id) {
        throw new BadRequestException(
          "El ID en la URL no coincide con el ID en la instancia de User a actualizar."
        );
      }
      const entity = await this.service.update(id, partialEntity);

      if (!entity) {
        throw new NotFoundException("Instancia de User no encontrada.");
      }

      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Actualizar múltiples usuarios" })
  @ApiBody({ type: [UpdateUserMinimalDto] })
  @ApiResponse({ status: 200, type: UsersResponse<User> })
  @Put("bulk")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(UserCommandController.name)
      .get(UserCommandController.name),
  })
  async bulkUpdate(
    @Body() partialEntities: UpdateUserMinimalDto[]
  ): Promise<UsersResponse<User>> {
    try {
      const entities = await this.service.bulkUpdate(partialEntities);

      if (!entities) {
        throw new NotFoundException("User entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete an user" })   
  @ApiResponse({ status: 200, type: UserResponse<User>,description:
    "Instancia de User eliminada satisfactoriamente.", })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia User a eliminar.",
  }) // ✅ Nuevo status para el error de validación
  @Delete(":id")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(UserCommandController.name)
      .get(UserCommandController.name),
  })
  async delete(@Param("id") id: string): Promise<UserResponse<User>> {
    try {
       
      const result = await this.service.delete(id);

      if (!result) {
        throw new NotFoundException("User entity not found.");
      }

      return result;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Eliminar múltiples usuarios" })
  @ApiResponse({ status: 200, type: DeleteResult })
  @Delete("bulk")
  @LogExecutionTime({
    layer: "controller",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(UserCommandController.name)
      .get(UserCommandController.name),
  })
  async bulkDelete(@Query("ids") ids: string[]): Promise<DeleteResult> {
    const deleted = await this.service.bulkDelete(ids);
    return { raw: [], affected: deleted } as DeleteResult;
  }
}

