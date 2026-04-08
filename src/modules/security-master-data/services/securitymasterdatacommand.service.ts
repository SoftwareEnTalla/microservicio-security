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
import { SecurityMasterData } from "../entities/security-master-data.entity";
import { CreateSecurityMasterDataDto, UpdateSecurityMasterDataDto, DeleteSecurityMasterDataDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { SecurityMasterDataCommandRepository } from "../repositories/securitymasterdatacommand.repository";
import { SecurityMasterDataQueryRepository } from "../repositories/securitymasterdataquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { SecurityMasterDataResponse, SecurityMasterDatasResponse } from "../types/securitymasterdata.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { SecurityMasterDataQueryService } from "./securitymasterdataquery.service";
import { BaseEvent } from "../events/base.event";


@Injectable()
export class SecurityMasterDataCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(SecurityMasterDataCommandService.name);
  //Constructo del servicio SecurityMasterDataCommandService
  constructor(
    private readonly repository: SecurityMasterDataCommandRepository,
    private readonly queryRepository: SecurityMasterDataQueryRepository,
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
      .registerClient(SecurityMasterDataQueryService.name)
      .get(SecurityMasterDataQueryService.name),
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
        await this.eventStore.appendEvent('security-master-data-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: SecurityMasterData | null,
    current?: SecurityMasterData | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'create') {
      // Regla de servicio: security-master-data-must-have-category
      // Todo dato maestro de seguridad debe declarar categoría y código.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'category') === undefined || this.dslValue(entityData, currentData, inputData, 'category') === null || (typeof this.dslValue(entityData, currentData, inputData, 'category') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'category')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'category')) && this.dslValue(entityData, currentData, inputData, 'category').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'category') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'category')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'category')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'category'))).length === 0)) && !(this.dslValue(entityData, currentData, inputData, 'code') === undefined || this.dslValue(entityData, currentData, inputData, 'code') === null || (typeof this.dslValue(entityData, currentData, inputData, 'code') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'code')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'code')) && this.dslValue(entityData, currentData, inputData, 'code').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'code') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'code')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'code')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'code'))).length === 0)))) {
        throw new Error('SEC_MD_001: El dato maestro de seguridad requiere categoría y código');
      }

    }

    if (operation === 'update') {
      // Regla de servicio: security-master-data-must-have-category
      // Todo dato maestro de seguridad debe declarar categoría y código.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'category') === undefined || this.dslValue(entityData, currentData, inputData, 'category') === null || (typeof this.dslValue(entityData, currentData, inputData, 'category') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'category')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'category')) && this.dslValue(entityData, currentData, inputData, 'category').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'category') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'category')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'category')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'category'))).length === 0)) && !(this.dslValue(entityData, currentData, inputData, 'code') === undefined || this.dslValue(entityData, currentData, inputData, 'code') === null || (typeof this.dslValue(entityData, currentData, inputData, 'code') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'code')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'code')) && this.dslValue(entityData, currentData, inputData, 'code').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'code') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'code')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'code')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'code'))).length === 0)))) {
        throw new Error('SEC_MD_001: El dato maestro de seguridad requiere categoría y código');
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
      .registerClient(SecurityMasterDataCommandService.name)
      .get(SecurityMasterDataCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateSecurityMasterDataDto>("createSecurityMasterData", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createSecurityMasterDataDtoInput: CreateSecurityMasterDataDto
  ): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
    try {
      logger.info("Receiving in service:", createSecurityMasterDataDtoInput);
      const candidate = SecurityMasterData.fromDto(createSecurityMasterDataDtoInput);
      await this.applyDslServiceRules("create", createSecurityMasterDataDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createSecurityMasterDataDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el securitymasterdata no existe
      if (!entity)
        throw new NotFoundException("Entidad SecurityMasterData no encontrada.");
      // Devolver securitymasterdata
      return {
        ok: true,
        message: "SecurityMasterData obtenido con éxito.",
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
      .registerClient(SecurityMasterDataCommandService.name)
      .get(SecurityMasterDataCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<SecurityMasterData>("createSecurityMasterDatas", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createSecurityMasterDataDtosInput: CreateSecurityMasterDataDto[]
  ): Promise<SecurityMasterDatasResponse<SecurityMasterData>> {
    try {
      const entities = await this.repository.bulkCreate(
        createSecurityMasterDataDtosInput.map((entity) => SecurityMasterData.fromDto(entity))
      );

      // Respuesta si el securitymasterdata no existe
      if (!entities)
        throw new NotFoundException("Entidades SecurityMasterDatas no encontradas.");
      // Devolver securitymasterdata
      return {
        ok: true,
        message: "SecurityMasterDatas creados con éxito.",
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
      .registerClient(SecurityMasterDataCommandService.name)
      .get(SecurityMasterDataCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateSecurityMasterDataDto>("updateSecurityMasterData", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateSecurityMasterDataDto
  ): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new SecurityMasterData(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el securitymasterdata no existe
      if (!entity)
        throw new NotFoundException("Entidades SecurityMasterDatas no encontradas.");
      // Devolver securitymasterdata
      return {
        ok: true,
        message: "SecurityMasterData actualizada con éxito.",
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
      .registerClient(SecurityMasterDataCommandService.name)
      .get(SecurityMasterDataCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateSecurityMasterDataDto>("updateSecurityMasterDatas", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateSecurityMasterDataDto[]
  ): Promise<SecurityMasterDatasResponse<SecurityMasterData>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => SecurityMasterData.fromDto(entity))
      );
      // Respuesta si el securitymasterdata no existe
      if (!entities)
        throw new NotFoundException("Entidades SecurityMasterDatas no encontradas.");
      // Devolver securitymasterdata
      return {
        ok: true,
        message: "SecurityMasterDatas actualizadas con éxito.",
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
      .registerClient(SecurityMasterDataCommandService.name)
      .get(SecurityMasterDataCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteSecurityMasterDataDto>("deleteSecurityMasterData", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el securitymasterdata no existe
      if (!entity)
        throw new NotFoundException("Instancias de SecurityMasterData no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver securitymasterdata
      return {
        ok: true,
        message: "Instancia de SecurityMasterData eliminada con éxito.",
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
      .registerClient(SecurityMasterDataCommandService.name)
      .get(SecurityMasterDataCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteSecurityMasterDatas", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

