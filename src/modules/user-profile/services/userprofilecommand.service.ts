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
import { UserProfile } from "../entities/user-profile.entity";
import { CreateUserProfileDto, UpdateUserProfileDto, DeleteUserProfileDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { UserProfileCommandRepository } from "../repositories/userprofilecommand.repository";
import { UserProfileQueryRepository } from "../repositories/userprofilequery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { UserProfileResponse, UserProfilesResponse } from "../types/userprofile.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { UserProfileQueryService } from "./userprofilequery.service";
import { BaseEvent } from "../events/base.event";


@Injectable()
export class UserProfileCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(UserProfileCommandService.name);
  //Constructo del servicio UserProfileCommandService
  constructor(
    private readonly repository: UserProfileCommandRepository,
    private readonly queryRepository: UserProfileQueryRepository,
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
      .registerClient(UserProfileQueryService.name)
      .get(UserProfileQueryService.name),
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
        await this.eventStore.appendEvent('user-profile-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: UserProfile | null,
    current?: UserProfile | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'create') {
      // Regla de servicio: profile-must-reference-user
      // Todo perfil debe estar asociado a un usuario.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'userId') === undefined || this.dslValue(entityData, currentData, inputData, 'userId') === null || (typeof this.dslValue(entityData, currentData, inputData, 'userId') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'userId')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'userId')) && this.dslValue(entityData, currentData, inputData, 'userId').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'userId') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'userId')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'userId')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'userId'))).length === 0)))) {
        throw new Error('USER_PROFILE_001: El perfil requiere referencia a user');
      }

    }

    if (operation === 'update') {
      // Regla de servicio: profile-must-reference-user
      // Todo perfil debe estar asociado a un usuario.
      if (!(!(this.dslValue(entityData, currentData, inputData, 'userId') === undefined || this.dslValue(entityData, currentData, inputData, 'userId') === null || (typeof this.dslValue(entityData, currentData, inputData, 'userId') === 'string' && String(this.dslValue(entityData, currentData, inputData, 'userId')).trim() === '') || (Array.isArray(this.dslValue(entityData, currentData, inputData, 'userId')) && this.dslValue(entityData, currentData, inputData, 'userId').length === 0) || (typeof this.dslValue(entityData, currentData, inputData, 'userId') === 'object' && !Array.isArray(this.dslValue(entityData, currentData, inputData, 'userId')) && Object.prototype.toString.call(this.dslValue(entityData, currentData, inputData, 'userId')) === '[object Object]' && Object.keys(Object(this.dslValue(entityData, currentData, inputData, 'userId'))).length === 0)))) {
        throw new Error('USER_PROFILE_001: El perfil requiere referencia a user');
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
      .registerClient(UserProfileCommandService.name)
      .get(UserProfileCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateUserProfileDto>("createUserProfile", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createUserProfileDtoInput: CreateUserProfileDto
  ): Promise<UserProfileResponse<UserProfile>> {
    try {
      logger.info("Receiving in service:", createUserProfileDtoInput);
      const candidate = UserProfile.fromDto(createUserProfileDtoInput);
      await this.applyDslServiceRules("create", createUserProfileDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createUserProfileDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el userprofile no existe
      if (!entity)
        throw new NotFoundException("Entidad UserProfile no encontrada.");
      // Devolver userprofile
      return {
        ok: true,
        message: "UserProfile obtenido con éxito.",
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
      .registerClient(UserProfileCommandService.name)
      .get(UserProfileCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UserProfile>("createUserProfiles", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createUserProfileDtosInput: CreateUserProfileDto[]
  ): Promise<UserProfilesResponse<UserProfile>> {
    try {
      const entities = await this.repository.bulkCreate(
        createUserProfileDtosInput.map((entity) => UserProfile.fromDto(entity))
      );

      // Respuesta si el userprofile no existe
      if (!entities)
        throw new NotFoundException("Entidades UserProfiles no encontradas.");
      // Devolver userprofile
      return {
        ok: true,
        message: "UserProfiles creados con éxito.",
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
      .registerClient(UserProfileCommandService.name)
      .get(UserProfileCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateUserProfileDto>("updateUserProfile", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateUserProfileDto
  ): Promise<UserProfileResponse<UserProfile>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new UserProfile(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el userprofile no existe
      if (!entity)
        throw new NotFoundException("Entidades UserProfiles no encontradas.");
      // Devolver userprofile
      return {
        ok: true,
        message: "UserProfile actualizada con éxito.",
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
      .registerClient(UserProfileCommandService.name)
      .get(UserProfileCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateUserProfileDto>("updateUserProfiles", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateUserProfileDto[]
  ): Promise<UserProfilesResponse<UserProfile>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => UserProfile.fromDto(entity))
      );
      // Respuesta si el userprofile no existe
      if (!entities)
        throw new NotFoundException("Entidades UserProfiles no encontradas.");
      // Devolver userprofile
      return {
        ok: true,
        message: "UserProfiles actualizadas con éxito.",
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
      .registerClient(UserProfileCommandService.name)
      .get(UserProfileCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteUserProfileDto>("deleteUserProfile", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<UserProfileResponse<UserProfile>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el userprofile no existe
      if (!entity)
        throw new NotFoundException("Instancias de UserProfile no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver userprofile
      return {
        ok: true,
        message: "Instancia de UserProfile eliminada con éxito.",
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
      .registerClient(UserProfileCommandService.name)
      .get(UserProfileCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteUserProfiles", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

