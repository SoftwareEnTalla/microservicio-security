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
import { Login } from "../entities/login.entity";
import { CreateLoginDto, UpdateLoginDto, DeleteLoginDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { LoginCommandRepository } from "../repositories/logincommand.repository";
import { LoginQueryRepository } from "../repositories/loginquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { LoginResponse, LoginsResponse } from "../types/login.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { LoginQueryService } from "./loginquery.service";
import { BaseEvent } from "../events/base.event";
import { LoginSucceededEvent } from '../events/loginsucceeded.event';
import { LoginFailedEvent } from '../events/loginfailed.event';
import { LoginRefreshedEvent } from '../events/loginrefreshed.event';
import { LoginLoggedOutEvent } from '../events/loginloggedout.event';
import { FederatedLoginStartedEvent } from '../events/federatedloginstarted.event';

@Injectable()
export class LoginCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(LoginCommandService.name);
  //Constructo del servicio LoginCommandService
  constructor(
    private readonly repository: LoginCommandRepository,
    private readonly queryRepository: LoginQueryRepository,
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
      .registerClient(LoginQueryService.name)
      .get(LoginQueryService.name),
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
        await this.eventStore.appendEvent('login-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: Login | null,
    current?: Login | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'create') {
      // Regla de servicio: successful-login-must-issue-session-material
      // Un login exitoso o renovado debe emitir material de sesión para que la aplicación pueda continuar operando.
      if (!(['SUCCEEDED', 'REFRESHED'].includes(this.dslValue(entityData, currentData, inputData, 'authStatus')) && this.dslValue(entityData, currentData, inputData, 'accessTokenIssued') === true)) {
        throw new Error('LOGIN_001: Un login exitoso o refrescado debe emitir token de acceso');
      }

      // Regla de servicio: login-succeeded-emits-domain-event
      // Cuando un login finaliza correctamente debe emitirse un evento para registrar autenticación y materializar la sesión.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'SUCCEEDED') {
        pendingEvents.push(LoginSucceededEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-create'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-create')
        ));
      }

      // Regla de servicio: login-failed-emits-domain-event
      // Cuando un login falla debe emitirse un evento para dejar trazabilidad funcional en authentication.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'FAILED') {
        pendingEvents.push(LoginFailedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-create'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-create')
        ));
      }

      // Regla de servicio: federated-login-started-emits-domain-event
      // Cuando un login federado redirige al proveedor externo debe emitirse un evento para observabilidad del flujo.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'REDIRECT_REQUIRED') {
        pendingEvents.push(FederatedLoginStartedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-create'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-create')
        ));
      }

    }

    if (operation === 'update') {
      // Regla de servicio: successful-login-must-issue-session-material
      // Un login exitoso o renovado debe emitir material de sesión para que la aplicación pueda continuar operando.
      if (!(['SUCCEEDED', 'REFRESHED'].includes(this.dslValue(entityData, currentData, inputData, 'authStatus')) && this.dslValue(entityData, currentData, inputData, 'accessTokenIssued') === true)) {
        throw new Error('LOGIN_001: Un login exitoso o refrescado debe emitir token de acceso');
      }

      // Regla de servicio: login-succeeded-emits-domain-event
      // Cuando un login finaliza correctamente debe emitirse un evento para registrar autenticación y materializar la sesión.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'SUCCEEDED') {
        pendingEvents.push(LoginSucceededEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update')
        ));
      }

      // Regla de servicio: login-failed-emits-domain-event
      // Cuando un login falla debe emitirse un evento para dejar trazabilidad funcional en authentication.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'FAILED') {
        pendingEvents.push(LoginFailedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update')
        ));
      }

      // Regla de servicio: login-refreshed-emits-domain-event
      // Cuando la sesión se renueva debe emitirse un evento para registrar refresh y continuidad segura.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'REFRESHED') {
        pendingEvents.push(LoginRefreshedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update')
        ));
      }

      // Regla de servicio: login-logged-out-emits-domain-event
      // Cuando una sesión se cierra debe emitirse un evento para invalidar la continuidad de seguridad.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'LOGGED_OUT') {
        pendingEvents.push(LoginLoggedOutEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update')
        ));
      }

      // Regla de servicio: federated-login-started-emits-domain-event
      // Cuando un login federado redirige al proveedor externo debe emitirse un evento para observabilidad del flujo.
      if (this.dslValue(entityData, currentData, inputData, 'authStatus') === 'REDIRECT_REQUIRED') {
        pendingEvents.push(FederatedLoginStartedEvent.create(
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update'),
          (entity ?? current ?? inputData ?? {}) as any,
          String(entityData['createdBy'] ?? currentData['createdBy'] ?? inputData?.createdBy ?? 'system'),
          String(entityData['id'] ?? currentData['id'] ?? inputData?.id ?? 'login-update')
        ));
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
      .registerClient(LoginCommandService.name)
      .get(LoginCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateLoginDto>("createLogin", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createLoginDtoInput: CreateLoginDto
  ): Promise<LoginResponse<Login>> {
    try {
      logger.info("Receiving in service:", createLoginDtoInput);
      const candidate = Login.fromDto(createLoginDtoInput);
      await this.applyDslServiceRules("create", createLoginDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createLoginDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el login no existe
      if (!entity)
        throw new NotFoundException("Entidad Login no encontrada.");
      // Devolver login
      return {
        ok: true,
        message: "Login obtenido con éxito.",
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
      .registerClient(LoginCommandService.name)
      .get(LoginCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<Login>("createLogins", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createLoginDtosInput: CreateLoginDto[]
  ): Promise<LoginsResponse<Login>> {
    try {
      const entities = await this.repository.bulkCreate(
        createLoginDtosInput.map((entity) => Login.fromDto(entity))
      );

      // Respuesta si el login no existe
      if (!entities)
        throw new NotFoundException("Entidades Logins no encontradas.");
      // Devolver login
      return {
        ok: true,
        message: "Logins creados con éxito.",
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
      .registerClient(LoginCommandService.name)
      .get(LoginCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateLoginDto>("updateLogin", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateLoginDto
  ): Promise<LoginResponse<Login>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new Login(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el login no existe
      if (!entity)
        throw new NotFoundException("Entidades Logins no encontradas.");
      // Devolver login
      return {
        ok: true,
        message: "Login actualizada con éxito.",
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
      .registerClient(LoginCommandService.name)
      .get(LoginCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateLoginDto>("updateLogins", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateLoginDto[]
  ): Promise<LoginsResponse<Login>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => Login.fromDto(entity))
      );
      // Respuesta si el login no existe
      if (!entities)
        throw new NotFoundException("Entidades Logins no encontradas.");
      // Devolver login
      return {
        ok: true,
        message: "Logins actualizadas con éxito.",
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
      .registerClient(LoginCommandService.name)
      .get(LoginCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteLoginDto>("deleteLogin", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<LoginResponse<Login>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el login no existe
      if (!entity)
        throw new NotFoundException("Instancias de Login no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver login
      return {
        ok: true,
        message: "Instancia de Login eliminada con éxito.",
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
      .registerClient(LoginCommandService.name)
      .get(LoginCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteLogins", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}

