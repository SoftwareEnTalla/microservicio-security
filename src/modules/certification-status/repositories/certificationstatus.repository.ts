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

    import { Injectable } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import {
  FindManyOptions,
  FindOptionsWhere,
  In,
  MoreThanOrEqual,
  Repository,
  DeleteResult,
  UpdateResult,
} from 'typeorm';
 
  import { BaseEntity } from '../entities/base.entity';
  import { CertificationStatus } from '../entities/certification-status.entity';
  import { Cacheable } from '../decorators/cache.decorator';
  import { generateCacheKey } from 'src/utils/functions';

  //Logger
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

  @Injectable()
  export class CertificationStatusRepository {
    constructor(
      @InjectRepository(CertificationStatus)
      private readonly repository: Repository<CertificationStatus>
    ) {
      this.validate();
    }

    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
  })
    private validate(): void {
      const entityInstance = Object.create(CertificationStatus.prototype);

      if (!(entityInstance instanceof BaseEntity)) {
        throw new Error(
          `El tipo ${CertificationStatus.name} no extiende de BaseEntity. Asegúrate de que todas las entidades hereden correctamente.`
        );
      }
    }

    
    //Funciones de Query-Repositories
    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async findAll(options?: FindManyOptions<CertificationStatus>): Promise<CertificationStatus[]> {
      logger.info('Ready to findAll CertificationStatus on repository:',options);
      return this.repository.find(options);
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async findById(id: string): Promise<CertificationStatus | null> {
      const tmp: FindOptionsWhere<CertificationStatus> = { id } as FindOptionsWhere<CertificationStatus>;
      logger.info('Ready to findById CertificationStatus on repository:',tmp);
      return this.repository.findOneBy(tmp);
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async findByField(
      field: string,
      value: any,
      page: number,
      limit: number
    ): Promise<CertificationStatus[]> {
      let options={
        where: { [field]: value },
        skip: (page - 1) * limit,
        take: limit,
      };
      logger.info('Ready to findByField CertificationStatus on repository:',options);
      const [entities] = await this.repository.findAndCount(options);
      return entities;
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async findWithPagination(
      options: FindManyOptions<CertificationStatus>,
      page: number,
      limit: number
    ): Promise<CertificationStatus[]> {
      const skip = (page - 1) * limit;
      options={ ...options, skip, take: limit };
      logger.info('Ready to findByField CertificationStatus on repository:',options);
      return this.repository.find(options);
    }

    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async count(): Promise<number> {
      logger.info('Ready to count CertificationStatus on repository...');
      let result= this.repository.count();
      logger.info('Was counted  instances of CertificationStatus on repository:');
      return result;
    }



    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async findAndCount(where?: Record<string, any>): Promise<[CertificationStatus[], number]> {
      logger.info('Ready to findByField CertificationStatus on repository:',where);
      let result = await this.repository.findAndCount(where);
      return result;
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async findOne(options?: Record<string, any>): Promise<CertificationStatus | null> {
      if (!options || Object.keys(options).length === 0) {
        logger.warn('No conditions provided for finding CertificationStatus.');
        return null;
      }
      // Soporta tanto 'where plano' como FindOneOptions ({ where, relations, order, select })
      const isFindOneOptions = 'where' in options || 'relations' in options || 'order' in options || 'select' in options;
      if (isFindOneOptions) {
        logger.info('Ready to findOne (FindOneOptions) CertificationStatus:', options);
        return this.repository.findOne(options as any);
      }
      const tmp: FindOptionsWhere<CertificationStatus> = options as FindOptionsWhere<CertificationStatus>;
      logger.info('Ready to findOneBy CertificationStatus on repository:', tmp);
      return this.repository.findOneBy(tmp);
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    async findOneOrFail(where?: Record<string, any>): Promise<CertificationStatus> {
      logger.info('Ready to findOneOrFail CertificationStatus on repository:',where);
      const entity = await this.repository.findOne({
        where: where,
      });
      if (!entity) {
        throw new Error('Entity not found');
      }
      return entity;
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    //Funciones de Command-Repositories
    @Cacheable({ key: (args) => generateCacheKey<CertificationStatus>('createCertificationStatus',args[0], args[1]), ttl: 60 })
    async create(entity: CertificationStatus): Promise<CertificationStatus> {
        logger.info('Ready to create CertificationStatus on repository:', entity);
        const result = await this.repository.save(entity);
        logger.info('New instance of CertificationStatus was created with id:'+ result.id+' on repository:', result);         
        return result;
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    @Cacheable({ key: (args) => generateCacheKey<CertificationStatus[]>('createCertificationStatuss',args[0], args[1]), ttl: 60 })
    async bulkCreate(entities: CertificationStatus[]): Promise<CertificationStatus[]> {
      logger.info('Ready to create CertificationStatus on repository:', entities);
      const result = await this.repository.save(entities);
      logger.info('New '+entities.length+' instances of CertificationStatus was created on repository:', result);      
      return result;
    }



    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    @Cacheable({ key: (args) => generateCacheKey<CertificationStatus>('updateCertificationStatus',args[0], args[1]), ttl: 60 })
    async update(
        id: string,
        partialEntity: Partial<CertificationStatus>
      ): Promise<CertificationStatus | null> {
        logger.info('Ready to update CertificationStatus on repository:', partialEntity);
        let result = await this.repository.update(id, partialEntity);
        logger.info('update CertificationStatus on repository was successfully :', partialEntity);
        let instance=await this.repository.findOneBy({ id: id });
        logger.info('Updated instance of CertificationStatus with id:  was finded on repository:', instance);
        return this.repository.findOneBy({ id: id });
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    @Cacheable({ key: (args) => generateCacheKey<CertificationStatus[]>('updateCertificationStatuss',args[0], args[1]), ttl: 60 })
    async bulkUpdate(entities: Partial<CertificationStatus>[]): Promise<CertificationStatus[]> {
        const updatedEntities: CertificationStatus[] = [];
        logger.info('Ready to update '+entities.length+' entities on repository:', entities);
        for (const entity of entities) {
          if (entity.id) {
            const updatedEntity = await this.update(entity.id, entity);
            if (updatedEntity) {
              updatedEntities.push(updatedEntity);
            }
          }
        }
        logger.info('Already updated '+updatedEntities.length+' entities on repository:', updatedEntities);
        return updatedEntities;
    }


    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    @Cacheable({ key: (args) => generateCacheKey<string>('deleteCertificationStatus',args[0]), ttl: 60 })
    async delete(id: string): Promise<DeleteResult> {
        logger.info('Ready to delete  entity with id:  on repository:', id);
        const result = await this.repository.delete({ id });
        logger.info('Entity deleted with id:  on repository:', result);
        return result;
    }

    @LogExecutionTime({
    layer: 'repository',
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
      .registerClient(CertificationStatusRepository.name)
      .get(CertificationStatusRepository.name),
    })
    @Cacheable({ key: (args) => generateCacheKey<string[]>('deleteCertificationStatuss',args[0]), ttl: 60 })
    async bulkDelete(ids: string[]): Promise<DeleteResult> {
        logger.info('Ready to delete '+ids.length+' entities on repository:', ids);
        const result = await this.repository.delete(ids);
        logger.info('Already deleted '+ids.length+' entities on repository:', result);
        return result;
    }
  }
  
