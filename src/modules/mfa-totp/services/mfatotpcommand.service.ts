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
import { MfaTotp } from "../entities/mfa-totp.entity";
import { CreateMfaTotpDto, UpdateMfaTotpDto, DeleteMfaTotpDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { MfaTotpCommandRepository } from "../repositories/mfatotpcommand.repository";
import { MfaTotpQueryRepository } from "../repositories/mfatotpquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { MfaTotpResponse, MfaTotpsResponse } from "../types/mfatotp.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { MfaTotpQueryService } from "./mfatotpquery.service";
import { BaseEvent } from "../events/base.event";
import { ActivationPinGeneratedEvent } from '../events/activationpingenerated.event';
import { ActivationPinVerifiedEvent } from '../events/activationpinverified.event';

@Injectable()
export class MfaTotpCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(MfaTotpCommandService.name);
  //Constructo del servicio MfaTotpCommandService
  constructor(
    private readonly repository: MfaTotpCommandRepository,
    private readonly queryRepository: MfaTotpQueryRepository,
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
      .registerClient(MfaTotpQueryService.name)
      .get(MfaTotpQueryService.name),
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
        await this.eventStore.appendEvent('mfa-totp-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: MfaTotp | null,
    current?: MfaTotp | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'create') {
      // Regla de servicio: totp-enabled-requires-secret
      // No se puede habilitar TOTP sin una referencia válida al secreto.
      if (!(this.dslValue(entityData, currentData, inputData, 'totpEnabled') === true && !(this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === undefined || this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === null || (typeof this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')) && this.dslValue(entityData, currentData, inputData, 'totpSecretRef').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'totpSecretRef'))).length === 0)))) {
        throw new Error('MFA_001: TOTP habilitado requiere secreto configurado');
      }

    }

    if (operation === 'update') {
      // Regla de servicio: totp-enabled-requires-secret
      // No se puede habilitar TOTP sin una referencia válida al secreto.
      if (!(this.dslValue(entityData, currentData, inputData, 'totpEnabled') === true && !(this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === undefined || this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === null || (typeof this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')) && this.dslValue(entityData, currentData, inputData, 'totpSecretRef').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'totpSecretRef') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'totpSecretRef')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'totpSecretRef'))).length === 0)))) {
        throw new Error('MFA_001: TOTP habilitado requiere secreto configurado');
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
      .registerClient(MfaTotpCommandService.name)
      .get(MfaTotpCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateMfaTotpDto>("createMfaTotp", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createMfaTotpDtoInput: CreateMfaTotpDto
  ): Promise<MfaTotpResponse<MfaTotp>> {
    try {
      logger.info("Receiving in service:", createMfaTotpDtoInput);
      const candidate = MfaTotp.fromDto(createMfaTotpDtoInput);
      await this.applyDslServiceRules("create", createMfaTotpDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createMfaTotpDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el mfatotp no existe
      if (!entity)
        throw new NotFoundException("Entidad MfaTotp no encontrada.");
      // Devolver mfatotp
      return {
        ok: true,
        message: "MfaTotp obtenido con éxito.",
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
      .registerClient(MfaTotpCommandService.name)
      .get(MfaTotpCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<MfaTotp>("createMfaTotps", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createMfaTotpDtosInput: CreateMfaTotpDto[]
  ): Promise<MfaTotpsResponse<MfaTotp>> {
    try {
      const entities = await this.repository.bulkCreate(
        createMfaTotpDtosInput.map((entity) => MfaTotp.fromDto(entity))
      );

      // Respuesta si el mfatotp no existe
      if (!entities)
        throw new NotFoundException("Entidades MfaTotps no encontradas.");
      // Devolver mfatotp
      return {
        ok: true,
        message: "MfaTotps creados con éxito.",
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
      .registerClient(MfaTotpCommandService.name)
      .get(MfaTotpCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateMfaTotpDto>("updateMfaTotp", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateMfaTotpDto
  ): Promise<MfaTotpResponse<MfaTotp>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new MfaTotp(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el mfatotp no existe
      if (!entity)
        throw new NotFoundException("Entidades MfaTotps no encontradas.");
      // Devolver mfatotp
      return {
        ok: true,
        message: "MfaTotp actualizada con éxito.",
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
      .registerClient(MfaTotpCommandService.name)
      .get(MfaTotpCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateMfaTotpDto>("updateMfaTotps", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateMfaTotpDto[]
  ): Promise<MfaTotpsResponse<MfaTotp>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => MfaTotp.fromDto(entity))
      );
      // Respuesta si el mfatotp no existe
      if (!entities)
        throw new NotFoundException("Entidades MfaTotps no encontradas.");
      // Devolver mfatotp
      return {
        ok: true,
        message: "MfaTotps actualizadas con éxito.",
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
      .registerClient(MfaTotpCommandService.name)
      .get(MfaTotpCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteMfaTotpDto>("deleteMfaTotp", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<MfaTotpResponse<MfaTotp>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el mfatotp no existe
      if (!entity)
        throw new NotFoundException("Instancias de MfaTotp no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver mfatotp
      return {
        ok: true,
        message: "Instancia de MfaTotp eliminada con éxito.",
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
      .registerClient(MfaTotpCommandService.name)
      .get(MfaTotpCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteMfaTotps", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

