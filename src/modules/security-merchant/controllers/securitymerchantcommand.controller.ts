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
import { SecurityMerchantCommandService } from "../services/securitymerchantcommand.service";
import { SecurityMerchantAuthGuard } from "../guards/securitymerchantauthguard.guard";

import { DeleteResult } from "typeorm";
import { Logger } from "@nestjs/common";
import { Helper } from "src/common/helpers/helpers";
import { SecurityMerchant } from "../entities/security-merchant.entity";
import { SecurityMerchantResponse, SecurityMerchantsResponse } from "../types/securitymerchant.types";
import { CreateSecurityMerchantDto, UpdateSecurityMerchantDto } from "../dtos/all-dto"; 
import { MerchantApprovalService } from "../services/merchant-approval.service";

//Loggers
import { LoggerClient } from "src/common/logger/logger.client";
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { logger } from '@core/logs/logger';

import { BadRequestException } from "@nestjs/common";

import { CommandBus } from "@nestjs/cqrs";
//import { SecurityMerchantCreatedEvent } from "../events/securitymerchantcreated.event";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";

@ApiTags("SecurityMerchant Command")
@UseGuards(SecurityMerchantAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Autenticación requerida." })
@Controller("securitymerchants/command")
export class SecurityMerchantCommandController {

  #logger = new Logger(SecurityMerchantCommandController.name);

  //Constructor del controlador: SecurityMerchantCommandController
  constructor(
  private readonly service: SecurityMerchantCommandService,
  private readonly commandBus: CommandBus,
  private readonly eventStore: EventStoreService,
  private readonly eventPublisher: KafkaEventPublisher,
  private readonly approvalService: MerchantApprovalService,
  ) {
    //Coloca aquí la lógica que consideres necesaria para inicializar el controlador
  }

  @ApiOperation({ summary: "Solicitar aprobación operativa del merchant" })
  @Post(":id/approval/request")
  async requestApproval(@Param("id") id: string) {
    try {
      return await this.approvalService.requestApproval(id);
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @ApiOperation({ summary: "Aprobar merchant (solo administrador)" })
  @Post(":id/approval/approve")
  async approveMerchant(
    @Param("id") id: string,
    @Body() body: { approvedBy?: string } = {},
  ) {
    try {
      return await this.approvalService.approve(id, (body?.approvedBy || "admin").trim());
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @ApiOperation({ summary: "Rechazar merchant (solo administrador)" })
  @Post(":id/approval/reject")
  async rejectMerchant(
    @Param("id") id: string,
    @Body() body: { reason: string; rejectedBy?: string },
  ) {
    try {
      return await this.approvalService.reject(
        id,
        (body?.reason || "").trim(),
        (body?.rejectedBy || "admin").trim(),
      );
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  @ApiOperation({ summary: "Create a new securitymerchant" })
  @ApiBody({ type: CreateSecurityMerchantDto })
  @ApiResponse({ status: 201, type: SecurityMerchantResponse<SecurityMerchant> })
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
      .registerClient(SecurityMerchantCommandController.name)
      .get(SecurityMerchantCommandController.name),
  })
  async create(
    @Body() createSecurityMerchantDtoInput: CreateSecurityMerchantDto
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    try {
      logger.info("Receiving in controller:", createSecurityMerchantDtoInput);
      const entity = await this.service.create(createSecurityMerchantDtoInput);
      logger.info("Entity created on controller:", entity);
      if (!entity) {
        throw new NotFoundException("Response securitymerchant entity not found.");
      } else if (!entity.data) {
        throw new NotFoundException("SecurityMerchant entity not found on response.");
      } else if (!entity.data.id) {
        throw new NotFoundException("Id securitymerchant is null on order instance.");
      }     

      return entity;
    } catch (error) {
      logger.info("Error creating entity on controller:", error);
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Create multiple securitymerchants" })
  @ApiBody({ type: [CreateSecurityMerchantDto] })
  @ApiResponse({ status: 201, type: SecurityMerchantsResponse<SecurityMerchant> })
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
      .registerClient(SecurityMerchantCommandController.name)
      .get(SecurityMerchantCommandController.name),
  })
  async bulkCreate(
    @Body() createSecurityMerchantDtosInput: CreateSecurityMerchantDto[]
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
    try {
      const entities = await this.service.bulkCreate(createSecurityMerchantDtosInput);

      if (!entities) {
        throw new NotFoundException("SecurityMerchant entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update an securitymerchant" })
  @ApiParam({
    name: "id",
    description: "Identificador desde la url del endpoint",
  }) // ✅ Documentamos el ID de la URL
  @ApiBody({
    type: UpdateSecurityMerchantDto,
    description: "El Payload debe incluir el mismo ID de la URL",
  })
  @ApiResponse({ status: 200, type: SecurityMerchantResponse<SecurityMerchant> })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia SecurityMerchant a actualizar.",
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
      .registerClient(SecurityMerchantCommandController.name)
      .get(SecurityMerchantCommandController.name),
  })
  async update(
    @Param("id") id: string,
    @Body() body: any
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    try {
      // Permitir body plano o anidado en 'data'
      const partialEntity = body?.data ? body.data : body;
      // ✅ Validación de coincidencia de IDs
      if (partialEntity?.id && id !== partialEntity.id) {

        throw new BadRequestException(

          "El ID en la URL no coincide con el ID en la instancia de SecurityMerchant a actualizar."

        );

      }

      if (partialEntity && !partialEntity.id) { partialEntity.id = id; }
      const entity = await this.service.update(id, partialEntity);

      if (!entity) {
        throw new NotFoundException("Instancia de SecurityMerchant no encontrada.");
      }

      return entity;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Update multiple securitymerchants" })
  @ApiBody({ type: [UpdateSecurityMerchantDto] })
  @ApiResponse({ status: 200, type: SecurityMerchantsResponse<SecurityMerchant> })
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
      .registerClient(SecurityMerchantCommandController.name)
      .get(SecurityMerchantCommandController.name),
  })
  async bulkUpdate(
    @Body() partialEntities: UpdateSecurityMerchantDto[]
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
    try {
      const entities = await this.service.bulkUpdate(partialEntities);

      if (!entities) {
        throw new NotFoundException("SecurityMerchant entities not found.");
      }

      return entities;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete an securitymerchant" })   
  @ApiResponse({ status: 200, type: SecurityMerchantResponse<SecurityMerchant>,description:
    "Instancia de SecurityMerchant eliminada satisfactoriamente.", })
  @ApiResponse({
    status: 400,
    description:
      "EL ID en la URL no coincide con la instancia SecurityMerchant a eliminar.",
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
      .registerClient(SecurityMerchantCommandController.name)
      .get(SecurityMerchantCommandController.name),
  })
  async delete(@Param("id") id: string): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    try {
       
      const result = await this.service.delete(id);

      if (!result) {
        throw new NotFoundException("SecurityMerchant entity not found.");
      }

      return result;
    } catch (error) {
      logger.error(error);
      return Helper.throwCachedError(error);
    }
  }

  
  
  @ApiOperation({ summary: "Delete multiple securitymerchants" })
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
      .registerClient(SecurityMerchantCommandController.name)
      .get(SecurityMerchantCommandController.name),
  })
  async bulkDelete(@Query("ids") ids: string[]): Promise<DeleteResult> {
    return await this.service.bulkDelete(ids);
  }
}

