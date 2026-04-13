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
import { Injectable, NotFoundException, Optional, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  Repository,
  UpdateResult,
} from 'typeorm';


import { BaseEntity } from '../entities/base.entity';
import { Login } from '../entities/login.entity';
import { LoginQueryRepository } from './loginquery.repository';
import { generateCacheKey } from 'src/utils/functions';
import { Cacheable } from '../decorators/cache.decorator';
import {LoginRepository} from './login.repository';

//Logger
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

//Events and EventHandlers
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { LoginCreatedEvent } from '../events/logincreated.event';
import { LoginUpdatedEvent } from '../events/loginupdated.event';
import { LoginDeletedEvent } from '../events/logindeleted.event';
import { LoginSucceededEvent } from "../events/loginsucceeded.event";
import { LoginFailedEvent } from "../events/loginfailed.event";
import { LoginRefreshedEvent } from "../events/loginrefreshed.event";
import { LoginLoggedOutEvent } from "../events/loginloggedout.event";
import { FederatedLoginStartedEvent } from "../events/federatedloginstarted.event";

//Enfoque Event Sourcing
import { CommandBus } from '@nestjs/cqrs';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { BaseEvent } from '../events/base.event';

//Event Sourcing Config
import { EventSourcingHelper } from '../shared/decorators/event-sourcing.helper';
import { EventSourcingConfigOptions } from '../shared/decorators/event-sourcing.decorator';


@EventsHandler(LoginCreatedEvent, LoginUpdatedEvent, LoginDeletedEvent, LoginSucceededEvent, LoginFailedEvent, LoginRefreshedEvent, LoginLoggedOutEvent, FederatedLoginStartedEvent)
@Injectable()
export class LoginCommandRepository implements IEventHandler<BaseEvent>{

  //Constructor del repositorio de datos: LoginCommandRepository
  constructor(
    @InjectRepository(Login)
    private readonly repository: Repository<Login>,
    private readonly loginRepository: LoginQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
    @Optional() @Inject('EVENT_SOURCING_CONFIG') 
    private readonly eventSourcingConfig: EventSourcingConfigOptions = EventSourcingHelper.getDefaultConfig()
  ) {
    this.validate();
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  private validate(): void {
    const entityInstance = Object.create(Login.prototype);

    if (!(entityInstance instanceof BaseEntity)) {
      throw new Error(
        `El tipo ${Login.name} no extiende de BaseEntity. Asegúrate de que todas las entidades hereden correctamente.`
      );
    }
  }

  // Helper para determinar si usar Event Sourcing
  private shouldPublishEvent(): boolean {
    return EventSourcingHelper.shouldPublishEvents(this.eventSourcingConfig);
  }

  private shouldUseProjections(): boolean {
    return EventSourcingHelper.shouldUseProjections(this.eventSourcingConfig);
  }


  // ----------------------------
  // MÉTODOS DE PROYECCIÓN (Event Handlers) para enfoque Event Sourcing
  // ----------------------------

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  async handle(event: any) {
    // Solo manejar eventos si las proyecciones están habilitadas
    if (!this.shouldUseProjections()) {
      logger.debug('Projections are disabled, skipping event handling');
      return false;
    }
    
    logger.info('Ready to handle Login event on repository:', event);
    switch (event.constructor.name) {
      case 'LoginCreatedEvent':
        return await this.onLoginCreated(event);
      case 'LoginUpdatedEvent':
        return await this.onLoginUpdated(event);
      case 'LoginDeletedEvent':
        return await this.onLoginDeleted(event);
      case 'LoginSucceededEvent':
        return await this.onLoginSucceeded(event);
      case 'LoginFailedEvent':
        return await this.onLoginFailed(event);
      case 'LoginRefreshedEvent':
        return await this.onLoginRefreshed(event);
      case 'LoginLoggedOutEvent':
        return await this.onLoginLoggedOut(event);
      case 'FederatedLoginStartedEvent':
        return await this.onFederatedLoginStarted(event);
    }
    return false;
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<Login>('createLogin', args[0], args[1]),
    ttl: 60,
  })
  private async onLoginCreated(event: LoginCreatedEvent) {
    logger.info('Ready to handle onLoginCreated event on repository:', event);
    const entity = new Login();
    entity.id = event.aggregateId;
    Object.assign(entity, event.payload.instance);
    // Asegurar que el tipo discriminador esté establecido
    if (!entity.type) {
      entity.type = 'login';
    }
    logger.info('Ready to save entity from event\'s payload:', entity);
    return await this.repository.save(entity);
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<Login>('updateLogin', args[0], args[1]),
    ttl: 60,
  })
  private async onLoginUpdated(event: LoginUpdatedEvent) {
    logger.info('Ready to handle onLoginUpdated event on repository:', event);
    return await this.repository.update(
      event.aggregateId,
      event.payload.instance
    );
  }

  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<Login>('deleteLogin', args[0], args[1]),
    ttl: 60,
  })
  private async onLoginDeleted(event: LoginDeletedEvent) {
    logger.info('Ready to handle onLoginDeleted event on repository:', event);
    return await this.repository.delete(event.aggregateId);
  }

  private async onLoginSucceeded(event: LoginSucceededEvent) {
    logger.info('Ready to handle onLoginSucceeded event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'login'
      } as Partial<Login>);
      return await this.repository.save(projectedEntity as Login);
    }
    return true;
  }

  private async onLoginFailed(event: LoginFailedEvent) {
    logger.info('Ready to handle onLoginFailed event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'login'
      } as Partial<Login>);
      return await this.repository.save(projectedEntity as Login);
    }
    return true;
  }

  private async onLoginRefreshed(event: LoginRefreshedEvent) {
    logger.info('Ready to handle onLoginRefreshed event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'login'
      } as Partial<Login>);
      return await this.repository.save(projectedEntity as Login);
    }
    return true;
  }

  private async onLoginLoggedOut(event: LoginLoggedOutEvent) {
    logger.info('Ready to handle onLoginLoggedOut event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'login'
      } as Partial<Login>);
      return await this.repository.save(projectedEntity as Login);
    }
    return true;
  }

  private async onFederatedLoginStarted(event: FederatedLoginStartedEvent) {
    logger.info('Ready to handle onFederatedLoginStarted event on repository:', event);
    const payloadInstance = (event as any).payload?.instance;
    if (payloadInstance) {
      const projectedEntity = this.repository.create({
        ...(payloadInstance as any),
        id: event.aggregateId,
        type: 'login'
      } as Partial<Login>);
      return await this.repository.save(projectedEntity as Login);
    }
    return true;
  }


  // ----------------------------
  // MÉTODOS CRUD TRADICIONALES (Compatibilidad)
  // ----------------------------
 
  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Login>('createLogin',args[0], args[1]), ttl: 60 })
  async create(entity: Login): Promise<Login> {
    logger.info('Ready to create Login on repository:', entity);
    
    // Asegurar que el tipo discriminador esté establecido antes de guardar
    if (!entity.type) {
      entity.type = 'login';
    }
    
    const result = await this.repository.save(entity);
    logger.info('New instance of Login was created with id:'+ result.id+' on repository:', result);
    
    // Publicar evento solo si Event Sourcing está habilitado
    if (this.shouldPublishEvent()) {
      this.eventPublisher.publish(new LoginCreatedEvent(result.id, {
        instance: result,
        metadata: {
          initiatedBy: result.creator,
          correlationId: result.id,
        },
      }));
    }
    return result;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Login[]>('createLogins',args[0], args[1]), ttl: 60 })
  async bulkCreate(entities: Login[]): Promise<Login[]> {
    logger.info('Ready to create Login on repository:', entities);
    
    // Asegurar que el tipo discriminador esté establecido para todas las entidades
    entities.forEach(entity => {
      if (!entity.type) {
        entity.type = 'login';
      }
    });
    
    const result = await this.repository.save(entities);
    logger.info('New '+entities.length+' instances of Login was created on repository:', result);
    
    // Publicar eventos solo si Event Sourcing está habilitado
    if (this.shouldPublishEvent()) {
      this.eventPublisher.publishAll(result.map((el)=>new LoginCreatedEvent(el.id, {
        instance: el,
        metadata: {
          initiatedBy: el.creator,
          correlationId: el.id,
        },
      })));
    }
    return result;
  }

  
  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Login>('updateLogin',args[0], args[1]), ttl: 60 })
  async update(
    id: string,
    partialEntity: Partial<Login>
  ): Promise<Login | null> {
    logger.info('Ready to update Login on repository:', partialEntity);
    let result = await this.repository.update(id, partialEntity);
    logger.info('update Login on repository was successfully :', partialEntity);
    let instance=await this.loginRepository.findById(id);
    logger.info('Updated instance of Login with id: ${id} was finded on repository:', instance);
    
    if(instance && this.shouldPublishEvent()) {
      logger.info('Ready to publish or fire event LoginUpdatedEvent on repository:', instance);
      this.eventPublisher.publish(new LoginUpdatedEvent(instance.id, {
          instance: instance,
          metadata: {
            initiatedBy: instance.createdBy || 'system',
            correlationId: id,
          },
        }));
    }   
    return instance;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<Login[]>('updateLogins',args[0], args[1]), ttl: 60 })
  async bulkUpdate(entities: Partial<Login>[]): Promise<Login[]> {
    const updatedEntities: Login[] = [];
    logger.info('Ready to update '+entities.length+' entities on repository:', entities);
    
    for (const entity of entities) {
      if (entity.id) {
        const updatedEntity = await this.update(entity.id, entity);
        if (updatedEntity) {
          updatedEntities.push(updatedEntity);
          if (this.shouldPublishEvent()) {
            this.eventPublisher.publish(new LoginUpdatedEvent(updatedEntity.id, {
                instance: updatedEntity,
                metadata: {
                  initiatedBy: updatedEntity.createdBy || 'system',
                  correlationId: entity.id,
                },
              }));
          }
        }
      }
    }
    logger.info('Already updated '+updatedEntities.length+' entities on repository:', updatedEntities);
    return updatedEntities;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string>('deleteLogin',args[0]), ttl: 60 })
  async delete(id: string): Promise<DeleteResult> {
     logger.info('Ready to delete entity with id: ${id} on repository:', id);
     const entity = await this.loginRepository.findOne({ id });
     if(!entity){
      throw new NotFoundException(`No se encontro el id: ${id}`);
     }
     const result = await this.repository.delete({ id });
     logger.info('Entity deleted with id: ${id} on repository:', result);
     
     if (this.shouldPublishEvent()) {
       logger.info('Ready to publish/fire LoginDeletedEvent on repository:', result);
       this.eventPublisher.publish(new LoginDeletedEvent(id, {
        instance: entity,
        metadata: {
          initiatedBy: entity.createdBy || 'system',
          correlationId: entity.id,
        },
      }));
     }
     return result;
  }


  @LogExecutionTime({
    layer: 'repository',
    callback: async (logData, client) => {
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
      .registerClient(LoginRepository.name)
      .get(LoginRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string[]>('deleteLogins',args[0]), ttl: 60 })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    logger.info('Ready to delete '+ids.length+' entities on repository:', ids);
    const result = await this.repository.delete(ids);
    logger.info('Already deleted '+ids.length+' entities on repository:', result);
    
    if (this.shouldPublishEvent()) {
      logger.info('Ready to publish/fire LoginDeletedEvent on repository:', result);
      this.eventPublisher.publishAll(ids.map(async (id) => {
          const entity = await this.loginRepository.findOne({ id });
          if(!entity){
            throw new NotFoundException(`No se encontro el id: ${id}`);
          }
          return new LoginDeletedEvent(id, {
            instance: entity,
            metadata: {
              initiatedBy: entity.createdBy || 'system',
              correlationId: entity.id,
            },
          });
        }));
    }
    return result;
  }
}


