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


import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { DeleteResult, UpdateResult } from "typeorm";
import { SecurityMerchant } from "../entities/security-merchant.entity";
import { CreateSecurityMerchantDto, UpdateSecurityMerchantDto, DeleteSecurityMerchantDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { SecurityMerchantCommandRepository } from "../repositories/securitymerchantcommand.repository";
import { SecurityMerchantQueryRepository } from "../repositories/securitymerchantquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { SecurityMerchantResponse, SecurityMerchantsResponse } from "../types/securitymerchant.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { SecurityMerchantQueryService } from "./securitymerchantquery.service";
import { BaseEvent } from "../events/base.event";


@Injectable()
export class SecurityMerchantCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(SecurityMerchantCommandService.name);
  //Constructo del servicio SecurityMerchantCommandService
  constructor(
    private readonly repository: SecurityMerchantCommandRepository,
    private readonly queryRepository: SecurityMerchantQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
    private moduleRef: ModuleRef
  ) {
    //Inicialice aquí propiedades o atributos
  }


  @LogExecutionTime({
    layer: "service",
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
      .registerClient(SecurityMerchantQueryService.name)
      .get(SecurityMerchantQueryService.name),
  })
  onModuleInit() {
    //Se ejecuta en la inicialización del módulo
  }

  private dslValue(entityData: Record<string, any>, currentData: Record<string, any>, inputData: Record<string, any>, field: string): any {
    return entityData?.[field] ?? currentData?.[field] ?? inputData?.[field];
  }

  private async publishDslDomainEvents(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventPublisher.publish(event as any);
      if (process.env.EVENT_STORE_ENABLED === "true") {
        await this.eventStore.appendEvent('security-merchant-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: SecurityMerchant | null,
    current?: SecurityMerchant | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'create') {
      // Regla de servicio: approved-merchant-must-have-code
      // Todo merchant aprobado debe tener código comercial.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'merchantCode') === undefined || this.dslValue(entityData, currentData, inputData, 'merchantCode') === null || (typeof this.dslValue(entityData, currentData, inputData, 'merchantCode') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'merchantCode')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'merchantCode')) && this.dslValue(entityData, currentData, inputData, 'merchantCode').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'merchantCode') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'merchantCode')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'merchantCode')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'merchantCode'))).length === 0)))) {
        throw new Error('SEC_MERCHANT_001: El merchant requiere merchantCode');
      }

    }

    if (operation === 'update') {
      // Regla de servicio: approved-merchant-must-have-code
      // Todo merchant aprobado debe tener código comercial.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'merchantCode') === undefined || this.dslValue(entityData, currentData, inputData, 'merchantCode') === null || (typeof this.dslValue(entityData, currentData, inputData, 'merchantCode') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'merchantCode')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'merchantCode')) && this.dslValue(entityData, currentData, inputData, 'merchantCode').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'merchantCode') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'merchantCode')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'merchantCode')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'merchantCode'))).length === 0)))) {
        throw new Error('SEC_MERCHANT_001: El merchant requiere merchantCode');
      }

    }
    if (publishEvents) {
      await this.publishDslDomainEvents(pendingEvents);
    }
  }

  @LogExecutionTime({
    layer: "service",
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
      .registerClient(SecurityMerchantCommandService.name)
      .get(SecurityMerchantCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateSecurityMerchantDto>("createSecurityMerchant", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createSecurityMerchantDtoInput: CreateSecurityMerchantDto
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    try {
      logger.info("Receiving in service:", createSecurityMerchantDtoInput);
      const candidate = SecurityMerchant.fromDto(createSecurityMerchantDtoInput);
      await this.applyDslServiceRules("create", createSecurityMerchantDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createSecurityMerchantDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el securitymerchant no existe
      if (!entity)
        throw new NotFoundException("Entidad SecurityMerchant no encontrada.");
      // Devolver securitymerchant
      return {
        ok: true,
        message: "SecurityMerchant obtenido con éxito.",
        data: entity,
      };
    } catch (error) {
      logger.info("Error creating entity on service:", error);
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
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
      .registerClient(SecurityMerchantCommandService.name)
      .get(SecurityMerchantCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<SecurityMerchant>("createSecurityMerchants", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createSecurityMerchantDtosInput: CreateSecurityMerchantDto[]
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
    try {
      const entities = await this.repository.bulkCreate(
        createSecurityMerchantDtosInput.map((entity) => SecurityMerchant.fromDto(entity))
      );

      // Respuesta si el securitymerchant no existe
      if (!entities)
        throw new NotFoundException("Entidades SecurityMerchants no encontradas.");
      // Devolver securitymerchant
      return {
        ok: true,
        message: "SecurityMerchants creados con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
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
      .registerClient(SecurityMerchantCommandService.name)
      .get(SecurityMerchantCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateSecurityMerchantDto>("updateSecurityMerchant", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateSecurityMerchantDto
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new SecurityMerchant(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el securitymerchant no existe
      if (!entity)
        throw new NotFoundException("Entidades SecurityMerchants no encontradas.");
      // Devolver securitymerchant
      return {
        ok: true,
        message: "SecurityMerchant actualizada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
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
      .registerClient(SecurityMerchantCommandService.name)
      .get(SecurityMerchantCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateSecurityMerchantDto>("updateSecurityMerchants", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateSecurityMerchantDto[]
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => SecurityMerchant.fromDto(entity))
      );
      // Respuesta si el securitymerchant no existe
      if (!entities)
        throw new NotFoundException("Entidades SecurityMerchants no encontradas.");
      // Devolver securitymerchant
      return {
        ok: true,
        message: "SecurityMerchants actualizadas con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

   @LogExecutionTime({
    layer: "service",
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
      .registerClient(SecurityMerchantCommandService.name)
      .get(SecurityMerchantCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteSecurityMerchantDto>("deleteSecurityMerchant", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el securitymerchant no existe
      if (!entity)
        throw new NotFoundException("Instancias de SecurityMerchant no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver securitymerchant
      return {
        ok: true,
        message: "Instancia de SecurityMerchant eliminada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

  @LogExecutionTime({
    layer: "service",
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
      .registerClient(SecurityMerchantCommandService.name)
      .get(SecurityMerchantCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteSecurityMerchants", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

