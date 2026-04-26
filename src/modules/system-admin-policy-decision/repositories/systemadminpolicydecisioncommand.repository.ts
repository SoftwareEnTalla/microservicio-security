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
import { SystemAdminPolicyDecision } from '../entities/system-admin-policy-decision.entity';
import { SystemAdminPolicyDecisionQueryRepository } from './systemadminpolicydecisionquery.repository';
import { generateCacheKey } from 'src/utils/functions';
import { Cacheable } from '../decorators/cache.decorator';
import {SystemAdminPolicyDecisionRepository} from './systemadminpolicydecision.repository';

//Logger
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

//Events and EventHandlers
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { SystemAdminPolicyDecisionCreatedEvent } from '../events/systemadminpolicydecisioncreated.event';
import { SystemAdminPolicyDecisionUpdatedEvent } from '../events/systemadminpolicydecisionupdated.event';
import { SystemAdminPolicyDecisionDeletedEvent } from '../events/systemadminpolicydecisiondeleted.event';


//Enfoque Event Sourcing
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { BaseEvent } from '../events/base.event';

//Event Sourcing Config
import { EventSourcingHelper } from '../shared/decorators/event-sourcing.helper';
import { EventSourcingConfigOptions } from '../shared/decorators/event-sourcing.decorator';


@EventsHandler(SystemAdminPolicyDecisionCreatedEvent, SystemAdminPolicyDecisionUpdatedEvent, SystemAdminPolicyDecisionDeletedEvent)
@Injectable()
export class SystemAdminPolicyDecisionCommandRepository implements IEventHandler<BaseEvent>{

  //Constructor del repositorio de datos: SystemAdminPolicyDecisionCommandRepository
  constructor(
    @InjectRepository(SystemAdminPolicyDecision)
    private readonly repository: Repository<SystemAdminPolicyDecision>,
    private readonly systemadminpolicydecisionRepository: SystemAdminPolicyDecisionQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
    private readonly eventBus: EventBus,
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  private validate(): void {
    const entityInstance = Object.create(SystemAdminPolicyDecision.prototype);

    if (!(entityInstance instanceof BaseEntity)) {
      throw new Error(
        `El tipo ${SystemAdminPolicyDecision.name} no extiende de BaseEntity. Asegúrate de que todas las entidades hereden correctamente.`
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  async handle(event: any) {
    // Solo manejar eventos si las proyecciones están habilitadas
    if (!this.shouldUseProjections()) {
      logger.debug('Projections are disabled, skipping event handling');
      return false;
    }
    
    logger.info('Ready to handle SystemAdminPolicyDecision event on repository:', event);
    switch (event.constructor.name) {
      case 'SystemAdminPolicyDecisionCreatedEvent':
        return await this.onSystemAdminPolicyDecisionCreated(event);
      case 'SystemAdminPolicyDecisionUpdatedEvent':
        return await this.onSystemAdminPolicyDecisionUpdated(event);
      case 'SystemAdminPolicyDecisionDeletedEvent':
        return await this.onSystemAdminPolicyDecisionDeleted(event);

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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<SystemAdminPolicyDecision>('createSystemAdminPolicyDecision', args[0], args[1]),
    ttl: 60,
  })
  private async onSystemAdminPolicyDecisionCreated(event: SystemAdminPolicyDecisionCreatedEvent) {
    logger.info('Ready to handle onSystemAdminPolicyDecisionCreated event on repository:', event);
    const entity = new SystemAdminPolicyDecision();
    entity.id = event.aggregateId;
    Object.assign(entity, event.payload.instance);
    // Asegurar que el tipo discriminador esté establecido
    if (!entity.type) {
      entity.type = 'systemadminpolicydecision';
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<SystemAdminPolicyDecision>('updateSystemAdminPolicyDecision', args[0], args[1]),
    ttl: 60,
  })
  private async onSystemAdminPolicyDecisionUpdated(event: SystemAdminPolicyDecisionUpdatedEvent) {
    logger.info('Ready to handle onSystemAdminPolicyDecisionUpdated event on repository:', event);
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<SystemAdminPolicyDecision>('deleteSystemAdminPolicyDecision', args[0], args[1]),
    ttl: 60,
  })
  private async onSystemAdminPolicyDecisionDeleted(event: SystemAdminPolicyDecisionDeletedEvent) {
    logger.info('Ready to handle onSystemAdminPolicyDecisionDeleted event on repository:', event);
    return await this.repository.delete(event.aggregateId);
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SystemAdminPolicyDecision>('createSystemAdminPolicyDecision',args[0], args[1]), ttl: 60 })
  async create(entity: SystemAdminPolicyDecision): Promise<SystemAdminPolicyDecision> {
    logger.info('Ready to create SystemAdminPolicyDecision on repository:', entity);
    
    // Asegurar que el tipo discriminador esté establecido antes de guardar
    if (!entity.type) {
      entity.type = 'systemadminpolicydecision';
    }
    
    const result = await this.repository.save(entity);
    logger.info('New instance of SystemAdminPolicyDecision was created with id:'+ result.id+' on repository:', result);
    
    // Publicar evento al EventBus local (sagas) y a Kafka si está habilitado
    if (this.shouldPublishEvent()) {
      const event = new SystemAdminPolicyDecisionCreatedEvent(result.id, {
        instance: result,
        metadata: {
          initiatedBy: result.creator,
          correlationId: result.id,
        },
      });
      this.eventBus.publish(event);
      this.eventPublisher.publish(event);
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SystemAdminPolicyDecision[]>('createSystemAdminPolicyDecisions',args[0], args[1]), ttl: 60 })
  async bulkCreate(entities: SystemAdminPolicyDecision[]): Promise<SystemAdminPolicyDecision[]> {
    logger.info('Ready to create SystemAdminPolicyDecision on repository:', entities);
    
    // Asegurar que el tipo discriminador esté establecido para todas las entidades
    entities.forEach(entity => {
      if (!entity.type) {
        entity.type = 'systemadminpolicydecision';
      }
    });
    
    const result = await this.repository.save(entities);
    logger.info('New '+entities.length+' instances of SystemAdminPolicyDecision was created on repository:', result);
    
    // Publicar eventos al EventBus local (sagas) y a Kafka si está habilitado
    if (this.shouldPublishEvent()) {
      const events = result.map((el) => new SystemAdminPolicyDecisionCreatedEvent(el.id, {
        instance: el,
        metadata: {
          initiatedBy: el.creator,
          correlationId: el.id,
        },
      }));
      events.forEach(event => this.eventBus.publish(event));
      this.eventPublisher.publishAll(events);
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SystemAdminPolicyDecision>('updateSystemAdminPolicyDecision',args[0], args[1]), ttl: 60 })
  async update(
    id: string,
    partialEntity: Partial<SystemAdminPolicyDecision>
  ): Promise<SystemAdminPolicyDecision | null> {
    logger.info('Ready to update SystemAdminPolicyDecision on repository:', partialEntity);
    let result = await this.repository.update(id, partialEntity);
    logger.info('update SystemAdminPolicyDecision on repository was successfully :', partialEntity);
    let instance=await this.systemadminpolicydecisionRepository.findById(id);
    logger.info('Updated instance of SystemAdminPolicyDecision with id: ${id} was finded on repository:', instance);
    
    if(instance && this.shouldPublishEvent()) {
      logger.info('Ready to publish or fire event SystemAdminPolicyDecisionUpdatedEvent on repository:', instance);
      const event = new SystemAdminPolicyDecisionUpdatedEvent(instance.id, {
          instance: instance,
          metadata: {
            initiatedBy: instance.createdBy || 'system',
            correlationId: id,
          },
        });
      this.eventBus.publish(event);
      this.eventPublisher.publish(event);
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SystemAdminPolicyDecision[]>('updateSystemAdminPolicyDecisions',args[0], args[1]), ttl: 60 })
  async bulkUpdate(entities: Partial<SystemAdminPolicyDecision>[]): Promise<SystemAdminPolicyDecision[]> {
    const updatedEntities: SystemAdminPolicyDecision[] = [];
    logger.info('Ready to update '+entities.length+' entities on repository:', entities);
    
    for (const entity of entities) {
      if (entity.id) {
        const updatedEntity = await this.update(entity.id, entity);
        if (updatedEntity) {
          updatedEntities.push(updatedEntity);
          if (this.shouldPublishEvent()) {
            const updateEvent = new SystemAdminPolicyDecisionUpdatedEvent(updatedEntity.id, {
                instance: updatedEntity,
                metadata: {
                  initiatedBy: updatedEntity.createdBy || 'system',
                  correlationId: entity.id,
                },
              });
            this.eventBus.publish(updateEvent);
            this.eventPublisher.publish(updateEvent);
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string>('deleteSystemAdminPolicyDecision',args[0]), ttl: 60 })
  async delete(id: string): Promise<DeleteResult> {
     logger.info('Ready to delete entity with id: ${id} on repository:', id);
     const entity = await this.systemadminpolicydecisionRepository.findOne({ id });
     if(!entity){
      throw new NotFoundException(`No se encontro el id: ${id}`);
     }
     const result = await this.repository.delete({ id });
     logger.info('Entity deleted with id: ${id} on repository:', result);
     
     if (this.shouldPublishEvent()) {
       logger.info('Ready to publish/fire SystemAdminPolicyDecisionDeletedEvent on repository:', result);
       const event = new SystemAdminPolicyDecisionDeletedEvent(id, {
        instance: entity,
        metadata: {
          initiatedBy: entity.createdBy || 'system',
          correlationId: entity.id,
        },
      });
       this.eventBus.publish(event);
       this.eventPublisher.publish(event);
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
      .registerClient(SystemAdminPolicyDecisionRepository.name)
      .get(SystemAdminPolicyDecisionRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string[]>('deleteSystemAdminPolicyDecisions',args[0]), ttl: 60 })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    logger.info('Ready to delete '+ids.length+' entities on repository:', ids);
    const result = await this.repository.delete(ids);
    logger.info('Already deleted '+ids.length+' entities on repository:', result);
    
    if (this.shouldPublishEvent()) {
      logger.info('Ready to publish/fire SystemAdminPolicyDecisionDeletedEvent on repository:', result);
      const deleteEvents = await Promise.all(ids.map(async (id) => {
          const entity = await this.systemadminpolicydecisionRepository.findOne({ id });
          if(!entity){
            throw new NotFoundException(`No se encontro el id: ${id}`);
          }
          return new SystemAdminPolicyDecisionDeletedEvent(id, {
            instance: entity,
            metadata: {
              initiatedBy: entity.createdBy || 'system',
              correlationId: entity.id,
            },
          });
        }));
      deleteEvents.forEach(event => this.eventBus.publish(event));
      this.eventPublisher.publishAll(deleteEvents);
    }
    return result;
  }
}


