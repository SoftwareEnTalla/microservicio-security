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
import { CertificationStatusCommandService } from "../services/certificationstatuscommand.service";
import { CertificationStatusAuthGuard } from "../guards/certificationstatusauthguard.guard";

import { DeleteResult } from "typeorm";
import { Logger } from "@nestjs/common";
import { Helper } from "src/common/helpers/helpers";
import { CertificationStatus } from "../entities/certification-status.entity";
import { CertificationStatusResponse, CertificationStatussResponse } from "../types/certificationstatus.types";
import { CreateCertificationStatusDto, UpdateCertificationStatusDto } from "../dtos/all-dto"; 

//Loggers
import { LoggerClient } from "src/common/logger/logger.client";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { logger } from '@core/logs/logger';

import { BadRequestException } from "@nestjs/common";

import { CommandBus } from "@nestjs/cqrs";
//import { CertificationStatusCreatedEvent } from "../events/certificationstatuscreated.event";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";

@ApiTags("CertificationStatus Command")
@UseGuards(CertificationStatusAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("certificationstatuss/command")
export class CertificationStatusCommandController {

  #logger = new Logger(CertificationStatusCommandController.name);

  //Constructor del controlador: CertificationStatusCommandController
  constructor(
  private readonly service: CertificationStatusCommandService,
  private readonly commandBus: CommandBus,
  private readonly eventStore: EventStoreService,
  private readonly eventPublisher: KafkaEventPublisher
  ) {
    //Coloca aquí la lógica que consideres necesaria para inicializar el controlador
  }

  @ApiOperation({ summary: "Create a new certificationstatus" })
  @ApiBody({ type: CreateCertificationStatusDto })
  @ApiResponse({ status: 201, type: CertificationStatusResponse<CertificationStatus> })
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
      .registerClient(CertificationStatusCommandController.name)
      .get(CertificationStatusCommandController.name),
  })
  async create(
    @Body() createCertificationStatusDtoInput: CreateCertificationStatusDto
  ): Promise<CertificationStatusResponse<CertificationStatus>> {
    try {
      logger.info("Receiving in controller:", createCertificationStatusDtoInput);
      const entity = await this.service.create(createCertificationStatusDtoInput);
      logger.info("Entity created on controller:", entity);
      if (!entity) {
        throw new NotFoundException("Response certificationstatus entity not found.");
      } else if (!entity.data) {
        throw new NotFoundException("CertificationStatus entity not found on response.");
      } else if (!entity.data.id) {
        throw new NotFoundException("Id certificationstatus is null on order instance.");
      }     

      return entity;
    } catch (error) {
      logger.info("Error creating entity on controller:", error);
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Create multiple certificationstatuss" })
  @ApiBody({ type: [CreateCertificationStatusDto] })
  @ApiResponse({ status: 201, type: CertificationStatussResponse<CertificationStatus> })
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
      .registerClient(CertificationStatusCommandController.name)
      .get(CertificationStatusCommandController.name),
  })
  async bulkCreate(
    @Body() createCertificationStatusDtosInput: CreateCertificationStatusDto[]
  ): Promise<CertificationStatussResponse<CertificationStatus>> {
    try {
      const entities = await this.service.bulkCreate(createCertificationStatusDtosInput);

      if (!entities) {
        throw new NotFoundException("CertificationStatus entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update an certificationstatus" })
  @ApiParam({
    name: "id",
    description: "Identificador desde la url del endpoint",
  }) // ✅ Documentamos el ID de la URL
  @ApiBody({
    type: UpdateCertificationStatusDto,
    description: "El Payload debe incluir el mismo ID de la URL",
  })
  @ApiResponse({ status: 200, type: CertificationStatusResponse<CertificationStatus> })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia CertificationStatus a actualizar.",
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
      .registerClient(CertificationStatusCommandController.name)
      .get(CertificationStatusCommandController.name),
  })
  async update(
    @Param("id") id: string,
    @Body() body: any
  ): Promise<CertificationStatusResponse<CertificationStatus>> {
    try {
      // Permitir body plano o anidado en 'data'
      const partialEntity = body?.data ? body.data : body;
      // ✅ Validación de coincidencia de IDs (auto-asigna id de la URL si el body no lo trae)
      if (partialEntity?.id && id !== partialEntity.id) {
        throw new BadRequestException(
          "El ID en la URL no coincide con el ID en la instancia de CertificationStatus a actualizar."
        );
      }
      if (partialEntity && !partialEntity.id) { partialEntity.id = id; }
      const entity = await this.service.update(id, partialEntity);

      if (!entity) {
        throw new NotFoundException("Instancia de CertificationStatus no encontrada.");
      }

      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update multiple certificationstatuss" })
  @ApiBody({ type: [UpdateCertificationStatusDto] })
  @ApiResponse({ status: 200, type: CertificationStatussResponse<CertificationStatus> })
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
      .registerClient(CertificationStatusCommandController.name)
      .get(CertificationStatusCommandController.name),
  })
  async bulkUpdate(
    @Body() partialEntities: UpdateCertificationStatusDto[]
  ): Promise<CertificationStatussResponse<CertificationStatus>> {
    try {
      const entities = await this.service.bulkUpdate(partialEntities);

      if (!entities) {
        throw new NotFoundException("CertificationStatus entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete an certificationstatus" })   
  @ApiResponse({ status: 200, type: CertificationStatusResponse<CertificationStatus>,description:
    "Instancia de CertificationStatus eliminada satisfactoriamente.", })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia CertificationStatus a eliminar.",
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
      .registerClient(CertificationStatusCommandController.name)
      .get(CertificationStatusCommandController.name),
  })
  async delete(@Param("id") id: string): Promise<CertificationStatusResponse<CertificationStatus>> {
    try {
       
      const result = await this.service.delete(id);

      if (!result) {
        throw new NotFoundException("CertificationStatus entity not found.");
      }

      return result;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete multiple certificationstatuss" })
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
      .registerClient(CertificationStatusCommandController.name)
      .get(CertificationStatusCommandController.name),
  })
  async bulkDelete(@Query("ids") ids: string[]): Promise<DeleteResult> {
    return await this.service.bulkDelete(ids);
  }
}

