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
import { CatalogSyncLog } from "../entities/catalog-sync-log.entity";
import { CreateCatalogSyncLogDto, UpdateCatalogSyncLogDto, DeleteCatalogSyncLogDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { CatalogSyncLogCommandRepository } from "../repositories/catalogsynclogcommand.repository";
import { CatalogSyncLogQueryRepository } from "../repositories/catalogsynclogquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { CatalogSyncLogResponse, CatalogSyncLogsResponse } from "../types/catalogsynclog.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { CatalogSyncLogQueryService } from "./catalogsynclogquery.service";
import { BaseEvent } from "../events/base.event";


@Injectable()
export class CatalogSyncLogCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(CatalogSyncLogCommandService.name);
  //Constructo del servicio CatalogSyncLogCommandService
  constructor(
    private readonly repository: CatalogSyncLogCommandRepository,
    private readonly queryRepository: CatalogSyncLogQueryRepository,
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
      .registerClient(CatalogSyncLogQueryService.name)
      .get(CatalogSyncLogQueryService.name),
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
        await this.eventStore.appendEvent('catalog-sync-log-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: CatalogSyncLog | null,
    current?: CatalogSyncLog | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'create') {
      // Regla de servicio: sync-log-requires-category
      // El log de sync requiere categoryCode.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'categoryCode') === undefined || this.dslValue(entityData, currentData, inputData, 'categoryCode') === null || (typeof this.dslValue(entityData, currentData, inputData, 'categoryCode') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'categoryCode')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'categoryCode')) && this.dslValue(entityData, currentData, inputData, 'categoryCode').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'categoryCode') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'categoryCode')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'categoryCode')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'categoryCode'))).length === 0)))) {
        throw new Error('CAT_SYNC_001: categoryCode requerido');
      }

      // Regla de servicio: sync-log-requires-synced-at
      // El log de sync requiere syncedAt.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'syncedAt') === undefined || this.dslValue(entityData, currentData, inputData, 'syncedAt') === null || (typeof this.dslValue(entityData, currentData, inputData, 'syncedAt') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'syncedAt')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'syncedAt')) && this.dslValue(entityData, currentData, inputData, 'syncedAt').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'syncedAt') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'syncedAt')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'syncedAt')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'syncedAt'))).length === 0)))) {
        throw new Error('CAT_SYNC_002: syncedAt requerido');
      }

    }

    if (operation === 'update') {
      // Regla de servicio: sync-log-requires-category
      // El log de sync requiere categoryCode.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'categoryCode') === undefined || this.dslValue(entityData, currentData, inputData, 'categoryCode') === null || (typeof this.dslValue(entityData, currentData, inputData, 'categoryCode') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'categoryCode')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'categoryCode')) && this.dslValue(entityData, currentData, inputData, 'categoryCode').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'categoryCode') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'categoryCode')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'categoryCode')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'categoryCode'))).length === 0)))) {
        throw new Error('CAT_SYNC_001: categoryCode requerido');
      }

      // Regla de servicio: sync-log-requires-synced-at
      // El log de sync requiere syncedAt.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'syncedAt') === undefined || this.dslValue(entityData, currentData, inputData, 'syncedAt') === null || (typeof this.dslValue(entityData, currentData, inputData, 'syncedAt') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'syncedAt')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'syncedAt')) && this.dslValue(entityData, currentData, inputData, 'syncedAt').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'syncedAt') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'syncedAt')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'syncedAt')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'syncedAt'))).length === 0)))) {
        throw new Error('CAT_SYNC_002: syncedAt requerido');
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
      .registerClient(CatalogSyncLogCommandService.name)
      .get(CatalogSyncLogCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateCatalogSyncLogDto>("createCatalogSyncLog", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createCatalogSyncLogDtoInput: CreateCatalogSyncLogDto
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
    try {
      logger.info("Receiving in service:", createCatalogSyncLogDtoInput);
      const candidate = CatalogSyncLog.fromDto(createCatalogSyncLogDtoInput);
      await this.applyDslServiceRules("create", createCatalogSyncLogDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createCatalogSyncLogDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el catalogsynclog no existe
      if (!entity)
        throw new NotFoundException("Entidad CatalogSyncLog no encontrada.");
      // Devolver catalogsynclog
      return {
        ok: true,
        message: "CatalogSyncLog obtenido con éxito.",
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
      .registerClient(CatalogSyncLogCommandService.name)
      .get(CatalogSyncLogCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CatalogSyncLog>("createCatalogSyncLogs", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createCatalogSyncLogDtosInput: CreateCatalogSyncLogDto[]
  ): Promise<CatalogSyncLogsResponse<CatalogSyncLog>> {
    try {
      const entities = await this.repository.bulkCreate(
        createCatalogSyncLogDtosInput.map((entity) => CatalogSyncLog.fromDto(entity))
      );

      // Respuesta si el catalogsynclog no existe
      if (!entities)
        throw new NotFoundException("Entidades CatalogSyncLogs no encontradas.");
      // Devolver catalogsynclog
      return {
        ok: true,
        message: "CatalogSyncLogs creados con éxito.",
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
      .registerClient(CatalogSyncLogCommandService.name)
      .get(CatalogSyncLogCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateCatalogSyncLogDto>("updateCatalogSyncLog", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateCatalogSyncLogDto
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new CatalogSyncLog(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el catalogsynclog no existe
      if (!entity)
        throw new NotFoundException("Entidades CatalogSyncLogs no encontradas.");
      // Devolver catalogsynclog
      return {
        ok: true,
        message: "CatalogSyncLog actualizada con éxito.",
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
      .registerClient(CatalogSyncLogCommandService.name)
      .get(CatalogSyncLogCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateCatalogSyncLogDto>("updateCatalogSyncLogs", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateCatalogSyncLogDto[]
  ): Promise<CatalogSyncLogsResponse<CatalogSyncLog>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => CatalogSyncLog.fromDto(entity))
      );
      // Respuesta si el catalogsynclog no existe
      if (!entities)
        throw new NotFoundException("Entidades CatalogSyncLogs no encontradas.");
      // Devolver catalogsynclog
      return {
        ok: true,
        message: "CatalogSyncLogs actualizadas con éxito.",
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
      .registerClient(CatalogSyncLogCommandService.name)
      .get(CatalogSyncLogCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteCatalogSyncLogDto>("deleteCatalogSyncLog", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el catalogsynclog no existe
      if (!entity)
        throw new NotFoundException("Instancias de CatalogSyncLog no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver catalogsynclog
      return {
        ok: true,
        message: "Instancia de CatalogSyncLog eliminada con éxito.",
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
      .registerClient(CatalogSyncLogCommandService.name)
      .get(CatalogSyncLogCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteCatalogSyncLogs", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

