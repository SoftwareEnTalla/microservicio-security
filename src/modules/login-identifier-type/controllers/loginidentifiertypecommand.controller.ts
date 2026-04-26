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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LoginIdentifierTypeCommandService } from "../services/loginidentifiertypecommand.service";
import { LoginIdentifierTypeAuthGuard } from "../guards/loginidentifiertypeauthguard.guard";

import { DeleteResult } from "typeorm";
import { Logger } from "@nestjs/common";
import { Helper } from "src/common/helpers/helpers";
import { LoginIdentifierType } from "../entities/login-identifier-type.entity";
import { LoginIdentifierTypeResponse, LoginIdentifierTypesResponse } from "../types/loginidentifiertype.types";
import { CreateLoginIdentifierTypeDto, UpdateLoginIdentifierTypeDto } from "../dtos/all-dto"; 

//Loggers
import { LoggerClient } from "src/common/logger/logger.client";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { logger } from '@core/logs/logger';

import { BadRequestException } from "@nestjs/common";

import { CommandBus } from "@nestjs/cqrs";
//import { LoginIdentifierTypeCreatedEvent } from "../events/loginidentifiertypecreated.event";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";

@ApiTags("LoginIdentifierType Command")
@UseGuards(LoginIdentifierTypeAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("loginidentifiertypes/command")
export class LoginIdentifierTypeCommandController {

  #logger = new Logger(LoginIdentifierTypeCommandController.name);

  //Constructor del controlador: LoginIdentifierTypeCommandController
  constructor(
  private readonly service: LoginIdentifierTypeCommandService,
  private readonly commandBus: CommandBus,
  private readonly eventStore: EventStoreService,
  private readonly eventPublisher: KafkaEventPublisher
  ) {
    //Coloca aquí la lógica que consideres necesaria para inicializar el controlador
  }

  @ApiOperation({ summary: "Create a new loginidentifiertype" })
  @ApiBody({ type: CreateLoginIdentifierTypeDto })
  @ApiResponse({ status: 201, type: LoginIdentifierTypeResponse<LoginIdentifierType> })
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
      .registerClient(LoginIdentifierTypeCommandController.name)
      .get(LoginIdentifierTypeCommandController.name),
  })
  async create(
    @Body() createLoginIdentifierTypeDtoInput: CreateLoginIdentifierTypeDto
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
    try {
      logger.info("Receiving in controller:", createLoginIdentifierTypeDtoInput);
      const entity = await this.service.create(createLoginIdentifierTypeDtoInput);
      logger.info("Entity created on controller:", entity);
      if (!entity) {
        throw new NotFoundException("Response loginidentifiertype entity not found.");
      } else if (!entity.data) {
        throw new NotFoundException("LoginIdentifierType entity not found on response.");
      } else if (!entity.data.id) {
        throw new NotFoundException("Id loginidentifiertype is null on order instance.");
      }     

      return entity;
    } catch (error) {
      logger.info("Error creating entity on controller:", error);
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Create multiple loginidentifiertypes" })
  @ApiBody({ type: [CreateLoginIdentifierTypeDto] })
  @ApiResponse({ status: 201, type: LoginIdentifierTypesResponse<LoginIdentifierType> })
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
      .registerClient(LoginIdentifierTypeCommandController.name)
      .get(LoginIdentifierTypeCommandController.name),
  })
  async bulkCreate(
    @Body() createLoginIdentifierTypeDtosInput: CreateLoginIdentifierTypeDto[]
  ): Promise<LoginIdentifierTypesResponse<LoginIdentifierType>> {
    try {
      const entities = await this.service.bulkCreate(createLoginIdentifierTypeDtosInput);

      if (!entities) {
        throw new NotFoundException("LoginIdentifierType entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update an loginidentifiertype" })
  @ApiParam({
    name: "id",
    description: "Identificador desde la url del endpoint",
  }) // ✅ Documentamos el ID de la URL
  @ApiBody({
    type: UpdateLoginIdentifierTypeDto,
    description: "El Payload debe incluir el mismo ID de la URL",
  })
  @ApiResponse({ status: 200, type: LoginIdentifierTypeResponse<LoginIdentifierType> })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia LoginIdentifierType a actualizar.",
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
      .registerClient(LoginIdentifierTypeCommandController.name)
      .get(LoginIdentifierTypeCommandController.name),
  })
  async update(
    @Param("id") id: string,
    @Body() body: any
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
    try {
      // Permitir body plano o anidado en 'data'
      const partialEntity = body?.data ? body.data : body;
      // ✅ Validación de coincidencia de IDs (auto-asigna id de la URL si el body no lo trae)
      if (partialEntity?.id && id !== partialEntity.id) {
        throw new BadRequestException(
          "El ID en la URL no coincide con el ID en la instancia de LoginIdentifierType a actualizar."
        );
      }
      if (partialEntity && !partialEntity.id) { partialEntity.id = id; }
      const entity = await this.service.update(id, partialEntity);

      if (!entity) {
        throw new NotFoundException("Instancia de LoginIdentifierType no encontrada.");
      }

      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update multiple loginidentifiertypes" })
  @ApiBody({ type: [UpdateLoginIdentifierTypeDto] })
  @ApiResponse({ status: 200, type: LoginIdentifierTypesResponse<LoginIdentifierType> })
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
      .registerClient(LoginIdentifierTypeCommandController.name)
      .get(LoginIdentifierTypeCommandController.name),
  })
  async bulkUpdate(
    @Body() partialEntities: UpdateLoginIdentifierTypeDto[]
  ): Promise<LoginIdentifierTypesResponse<LoginIdentifierType>> {
    try {
      const entities = await this.service.bulkUpdate(partialEntities);

      if (!entities) {
        throw new NotFoundException("LoginIdentifierType entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete an loginidentifiertype" })   
  @ApiResponse({ status: 200, type: LoginIdentifierTypeResponse<LoginIdentifierType>,description:
    "Instancia de LoginIdentifierType eliminada satisfactoriamente.", })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia LoginIdentifierType a eliminar.",
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
      .registerClient(LoginIdentifierTypeCommandController.name)
      .get(LoginIdentifierTypeCommandController.name),
  })
  async delete(@Param("id") id: string): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
    try {
       
      const result = await this.service.delete(id);

      if (!result) {
        throw new NotFoundException("LoginIdentifierType entity not found.");
      }

      return result;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete multiple loginidentifiertypes" })
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
      .registerClient(LoginIdentifierTypeCommandController.name)
      .get(LoginIdentifierTypeCommandController.name),
  })
  async bulkDelete(@Query("ids") ids: string[]): Promise<DeleteResult> {
    return await this.service.bulkDelete(ids);
  }
}

