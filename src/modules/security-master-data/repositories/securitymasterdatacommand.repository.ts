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
import { SecurityMasterData } from '../entities/security-master-data.entity';
import { SecurityMasterDataQueryRepository } from './securitymasterdataquery.repository';
import { generateCacheKey } from 'src/utils/functions';
import { Cacheable } from '../decorators/cache.decorator';
import {SecurityMasterDataRepository} from './securitymasterdata.repository';

//Logger
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

//Events and EventHandlers
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { SecurityMasterDataCreatedEvent } from '../events/securitymasterdatacreated.event';
import { SecurityMasterDataUpdatedEvent } from '../events/securitymasterdataupdated.event';
import { SecurityMasterDataDeletedEvent } from '../events/securitymasterdatadeleted.event';


//Enfoque Event Sourcing
import { CommandBus } from '@nestjs/cqrs';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { BaseEvent } from '../events/base.event';

//Event Sourcing Config
import { EventSourcingHelper } from '../shared/decorators/event-sourcing.helper';
import { EventSourcingConfigOptions } from '../shared/decorators/event-sourcing.decorator';


@EventsHandler(SecurityMasterDataCreatedEvent, SecurityMasterDataUpdatedEvent, SecurityMasterDataDeletedEvent)
@Injectable()
export class SecurityMasterDataCommandRepository implements IEventHandler<BaseEvent>{

  //Constructor del repositorio de datos: SecurityMasterDataCommandRepository
  constructor(
    @InjectRepository(SecurityMasterData)
    private readonly repository: Repository<SecurityMasterData>,
    private readonly securitymasterdataRepository: SecurityMasterDataQueryRepository,
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  private validate(): void {
    const entityInstance = Object.create(SecurityMasterData.prototype);

    if (!(entityInstance instanceof BaseEntity)) {
      throw new Error(
        `El tipo ${SecurityMasterData.name} no extiende de BaseEntity. Asegúrate de que todas las entidades hereden correctamente.`
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  async handle(event: any) {
    // Solo manejar eventos si las proyecciones están habilitadas
    if (!this.shouldUseProjections()) {
      logger.debug('Projections are disabled, skipping event handling');
      return false;
    }
    
    logger.info('Ready to handle SecurityMasterData event on repository:', event);
    switch (event.constructor.name) {
      case 'SecurityMasterDataCreatedEvent':
        return await this.onSecurityMasterDataCreated(event);
      case 'SecurityMasterDataUpdatedEvent':
        return await this.onSecurityMasterDataUpdated(event);
      case 'SecurityMasterDataDeletedEvent':
        return await this.onSecurityMasterDataDeleted(event);

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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<SecurityMasterData>('createSecurityMasterData', args[0], args[1]),
    ttl: 60,
  })
  private async onSecurityMasterDataCreated(event: SecurityMasterDataCreatedEvent) {
    logger.info('Ready to handle onSecurityMasterDataCreated event on repository:', event);
    const entity = new SecurityMasterData();
    entity.id = event.aggregateId;
    Object.assign(entity, event.payload.instance);
    // Asegurar que el tipo discriminador esté establecido
    if (!entity.type) {
      entity.type = 'securitymasterdata';
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<SecurityMasterData>('updateSecurityMasterData', args[0], args[1]),
    ttl: 60,
  })
  private async onSecurityMasterDataUpdated(event: SecurityMasterDataUpdatedEvent) {
    logger.info('Ready to handle onSecurityMasterDataUpdated event on repository:', event);
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<SecurityMasterData>('deleteSecurityMasterData', args[0], args[1]),
    ttl: 60,
  })
  private async onSecurityMasterDataDeleted(event: SecurityMasterDataDeletedEvent) {
    logger.info('Ready to handle onSecurityMasterDataDeleted event on repository:', event);
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SecurityMasterData>('createSecurityMasterData',args[0], args[1]), ttl: 60 })
  async create(entity: SecurityMasterData): Promise<SecurityMasterData> {
    logger.info('Ready to create SecurityMasterData on repository:', entity);
    
    // Asegurar que el tipo discriminador esté establecido antes de guardar
    if (!entity.type) {
      entity.type = 'securitymasterdata';
    }
    
    const result = await this.repository.save(entity);
    logger.info('New instance of SecurityMasterData was created with id:'+ result.id+' on repository:', result);
    
    // Publicar evento solo si Event Sourcing está habilitado
    if (this.shouldPublishEvent()) {
      this.eventPublisher.publish(new SecurityMasterDataCreatedEvent(result.id, {
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SecurityMasterData[]>('createSecurityMasterDatas',args[0], args[1]), ttl: 60 })
  async bulkCreate(entities: SecurityMasterData[]): Promise<SecurityMasterData[]> {
    logger.info('Ready to create SecurityMasterData on repository:', entities);
    
    // Asegurar que el tipo discriminador esté establecido para todas las entidades
    entities.forEach(entity => {
      if (!entity.type) {
        entity.type = 'securitymasterdata';
      }
    });
    
    const result = await this.repository.save(entities);
    logger.info('New '+entities.length+' instances of SecurityMasterData was created on repository:', result);
    
    // Publicar eventos solo si Event Sourcing está habilitado
    if (this.shouldPublishEvent()) {
      this.eventPublisher.publishAll(result.map((el)=>new SecurityMasterDataCreatedEvent(el.id, {
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SecurityMasterData>('updateSecurityMasterData',args[0], args[1]), ttl: 60 })
  async update(
    id: string,
    partialEntity: Partial<SecurityMasterData>
  ): Promise<SecurityMasterData | null> {
    logger.info('Ready to update SecurityMasterData on repository:', partialEntity);
    let result = await this.repository.update(id, partialEntity);
    logger.info('update SecurityMasterData on repository was successfully :', partialEntity);
    let instance=await this.securitymasterdataRepository.findById(id);
    logger.info('Updated instance of SecurityMasterData with id: ${id} was finded on repository:', instance);
    
    if(instance && this.shouldPublishEvent()) {
      logger.info('Ready to publish or fire event SecurityMasterDataUpdatedEvent on repository:', instance);
      this.eventPublisher.publish(new SecurityMasterDataUpdatedEvent(instance.id, {
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<SecurityMasterData[]>('updateSecurityMasterDatas',args[0], args[1]), ttl: 60 })
  async bulkUpdate(entities: Partial<SecurityMasterData>[]): Promise<SecurityMasterData[]> {
    const updatedEntities: SecurityMasterData[] = [];
    logger.info('Ready to update '+entities.length+' entities on repository:', entities);
    
    for (const entity of entities) {
      if (entity.id) {
        const updatedEntity = await this.update(entity.id, entity);
        if (updatedEntity) {
          updatedEntities.push(updatedEntity);
          if (this.shouldPublishEvent()) {
            this.eventPublisher.publish(new SecurityMasterDataUpdatedEvent(updatedEntity.id, {
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string>('deleteSecurityMasterData',args[0]), ttl: 60 })
  async delete(id: string): Promise<DeleteResult> {
     logger.info('Ready to delete entity with id: ${id} on repository:', id);
     const entity = await this.securitymasterdataRepository.findOne({ id });
     if(!entity){
      throw new NotFoundException(`No se encontro el id: ${id}`);
     }
     const result = await this.repository.delete({ id });
     logger.info('Entity deleted with id: ${id} on repository:', result);
     
     if (this.shouldPublishEvent()) {
       logger.info('Ready to publish/fire SecurityMasterDataDeletedEvent on repository:', result);
       this.eventPublisher.publish(new SecurityMasterDataDeletedEvent(id, {
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
      .registerClient(SecurityMasterDataRepository.name)
      .get(SecurityMasterDataRepository.name),
  })
  @Cacheable({ key: (args) => generateCacheKey<string[]>('deleteSecurityMasterDatas',args[0]), ttl: 60 })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    logger.info('Ready to delete '+ids.length+' entities on repository:', ids);
    const result = await this.repository.delete(ids);
    logger.info('Already deleted '+ids.length+' entities on repository:', result);
    
    if (this.shouldPublishEvent()) {
      logger.info('Ready to publish/fire SecurityMasterDataDeletedEvent on repository:', result);
      this.eventPublisher.publishAll(ids.map(async (id) => {
          const entity = await this.securitymasterdataRepository.findOne({ id });
          if(!entity){
            throw new NotFoundException(`No se encontro el id: ${id}`);
          }
          return new SecurityMasterDataDeletedEvent(id, {
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


