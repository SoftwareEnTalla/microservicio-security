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
import { IdentityFederation } from "../entities/identity-federation.entity";
import { CreateIdentityFederationDto, UpdateIdentityFederationDto, DeleteIdentityFederationDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { IdentityFederationCommandRepository } from "../repositories/identityfederationcommand.repository";
import { IdentityFederationQueryRepository } from "../repositories/identityfederationquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { IdentityFederationResponse, IdentityFederationsResponse } from "../types/identityfederation.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { IdentityFederationQueryService } from "./identityfederationquery.service";
import { BaseEvent } from "../events/base.event";


@Injectable()
export class IdentityFederationCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(IdentityFederationCommandService.name);
  //Constructo del servicio IdentityFederationCommandService
  constructor(
    private readonly repository: IdentityFederationCommandRepository,
    private readonly queryRepository: IdentityFederationQueryRepository,
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
      .registerClient(IdentityFederationQueryService.name)
      .get(IdentityFederationQueryService.name),
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
        await this.eventStore.appendEvent('identity-federation-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: IdentityFederation | null,
    current?: IdentityFederation | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'create') {
      // Regla de servicio: enabled-provider-must-have-protocol
      // Toda integración federada habilitada debe declarar familia y versión de protocolo.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'protocolFamily') === undefined || this.dslValue(entityData, currentData, inputData, 'protocolFamily') === null || (typeof this.dslValue(entityData, currentData, inputData, 'protocolFamily') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'protocolFamily')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolFamily')) && this.dslValue(entityData, currentData, inputData, 'protocolFamily').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'protocolFamily') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolFamily')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'protocolFamily')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'protocolFamily'))).length === 0)) && !(this.dslValue(entityData, currentData, inputData, 'protocolVersion') === undefined || this.dslValue(entityData, currentData, inputData, 'protocolVersion') === null || (typeof this.dslValue(entityData, currentData, inputData, 'protocolVersion') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'protocolVersion')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolVersion')) && this.dslValue(entityData, currentData, inputData, 'protocolVersion').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'protocolVersion') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolVersion')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'protocolVersion')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'protocolVersion'))).length === 0)))) {
        throw new Error('FEDERATION_001: La federación requiere familia y versión de protocolo');
      }

    }

    if (operation === 'update') {
      // Regla de servicio: enabled-provider-must-have-protocol
      // Toda integración federada habilitada debe declarar familia y versión de protocolo.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'protocolFamily') === undefined || this.dslValue(entityData, currentData, inputData, 'protocolFamily') === null || (typeof this.dslValue(entityData, currentData, inputData, 'protocolFamily') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'protocolFamily')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolFamily')) && this.dslValue(entityData, currentData, inputData, 'protocolFamily').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'protocolFamily') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolFamily')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'protocolFamily')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'protocolFamily'))).length === 0)) && !(this.dslValue(entityData, currentData, inputData, 'protocolVersion') === undefined || this.dslValue(entityData, currentData, inputData, 'protocolVersion') === null || (typeof this.dslValue(entityData, currentData, inputData, 'protocolVersion') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'protocolVersion')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolVersion')) && this.dslValue(entityData, currentData, inputData, 'protocolVersion').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'protocolVersion') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'protocolVersion')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'protocolVersion')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'protocolVersion'))).length === 0)))) {
        throw new Error('FEDERATION_001: La federación requiere familia y versión de protocolo');
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
      .registerClient(IdentityFederationCommandService.name)
      .get(IdentityFederationCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateIdentityFederationDto>("createIdentityFederation", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createIdentityFederationDtoInput: CreateIdentityFederationDto
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
    try {
      logger.info("Receiving in service:", createIdentityFederationDtoInput);
      const candidate = IdentityFederation.fromDto(createIdentityFederationDtoInput);
      await this.applyDslServiceRules("create", createIdentityFederationDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createIdentityFederationDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el identityfederation no existe
      if (!entity)
        throw new NotFoundException("Entidad IdentityFederation no encontrada.");
      // Devolver identityfederation
      return {
        ok: true,
        message: "IdentityFederation obtenido con éxito.",
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
      .registerClient(IdentityFederationCommandService.name)
      .get(IdentityFederationCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<IdentityFederation>("createIdentityFederations", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createIdentityFederationDtosInput: CreateIdentityFederationDto[]
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
    try {
      const entities = await this.repository.bulkCreate(
        createIdentityFederationDtosInput.map((entity) => IdentityFederation.fromDto(entity))
      );

      // Respuesta si el identityfederation no existe
      if (!entities)
        throw new NotFoundException("Entidades IdentityFederations no encontradas.");
      // Devolver identityfederation
      return {
        ok: true,
        message: "IdentityFederations creados con éxito.",
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
      .registerClient(IdentityFederationCommandService.name)
      .get(IdentityFederationCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateIdentityFederationDto>("updateIdentityFederation", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateIdentityFederationDto
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new IdentityFederation(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el identityfederation no existe
      if (!entity)
        throw new NotFoundException("Entidades IdentityFederations no encontradas.");
      // Devolver identityfederation
      return {
        ok: true,
        message: "IdentityFederation actualizada con éxito.",
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
      .registerClient(IdentityFederationCommandService.name)
      .get(IdentityFederationCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateIdentityFederationDto>("updateIdentityFederations", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateIdentityFederationDto[]
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => IdentityFederation.fromDto(entity))
      );
      // Respuesta si el identityfederation no existe
      if (!entities)
        throw new NotFoundException("Entidades IdentityFederations no encontradas.");
      // Devolver identityfederation
      return {
        ok: true,
        message: "IdentityFederations actualizadas con éxito.",
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
      .registerClient(IdentityFederationCommandService.name)
      .get(IdentityFederationCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteIdentityFederationDto>("deleteIdentityFederation", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<IdentityFederationResponse<IdentityFederation>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el identityfederation no existe
      if (!entity)
        throw new NotFoundException("Instancias de IdentityFederation no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver identityfederation
      return {
        ok: true,
        message: "Instancia de IdentityFederation eliminada con éxito.",
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
      .registerClient(IdentityFederationCommandService.name)
      .get(IdentityFederationCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteIdentityFederations", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

