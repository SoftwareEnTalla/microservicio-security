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
import { IdentityFederation } from '../entities/identity-federation.entity';
import { generateCacheKey } from 'src/utils/functions';
import { Cacheable } from '../decorators/cache.decorator';
import {IdentityFederationRepository} from './identityfederation.repository'

//Logger
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

  @Injectable()
  export class IdentityFederationQueryRepository {

    //Constructor del repositorio de datos: IdentityFederationQueryRepository
    constructor(
      @InjectRepository(IdentityFederation)
      private readonly repository: Repository<IdentityFederation>
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    private validate(): void {
      const entityInstance = Object.create(IdentityFederation.prototype);

      if (!(entityInstance instanceof BaseEntity)) {
        throw new Error(
          `El tipo ${IdentityFederation.name} no extiende de BaseEntity. Asegúrate de que todas las entidades hereden correctamente.`
        );
      }
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async findAll(options?: FindManyOptions<IdentityFederation>): Promise<IdentityFederation[]> {
      logger.info('Ready to findAll IdentityFederation on repository:', options);
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async findById(id: string): Promise<IdentityFederation | null> {
      const tmp: FindOptionsWhere<IdentityFederation> = { id } as FindOptionsWhere<IdentityFederation>;
      logger.info('Ready to findById IdentityFederation on repository:', tmp);
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async findByField(
      field: string,
      value: any,
      page: number,
      limit: number
    ): Promise<IdentityFederation[]> {
      let options={
        where: { [field]: value },
        skip: (page - 1) * limit,
        take: limit,
      };
      logger.info('Ready to findByField IdentityFederation on repository:', options);
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async findWithPagination(
      options: FindManyOptions<IdentityFederation>,
      page: number,
      limit: number
    ): Promise<IdentityFederation[]> {
      const skip = (page - 1) * limit;
      options={ ...options, skip, take: limit };
      logger.info('Ready to findWithPagination IdentityFederation on repository:', options);
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async count(): Promise<number> {
      logger.info('Ready to count IdentityFederation on repository...');
      let result= this.repository.count();
      logger.info('Was counted  instances of IdentityFederation on repository:');
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async findAndCount(where?: Record<string, any>): Promise<[IdentityFederation[], number]> {
      logger.info('Ready to findAndCount IdentityFederation on repository:',where);
      let result= this.repository.findAndCount({
        where: where,
      });
      logger.info('Was counted  instances of IdentityFederation on repository:',result);
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async findOne(where?: Record<string, any>): Promise<IdentityFederation | null> {
      const tmp: FindOptionsWhere<IdentityFederation> = where as FindOptionsWhere<IdentityFederation>;
      logger.info('Ready to findOneBy IdentityFederation on repository with conditions:', tmp);
      // Si 'where' es undefined o null, puedes manejarlo según tu lógica
      if (!where) {
        logger.warn('No conditions provided for finding IdentityFederation.');
        return null; // O maneja el caso como prefieras
      }
      logger.info('Ready to findOneBy IdentityFederation on repository:',tmp);
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
      .registerClient(IdentityFederationRepository.name)
      .get(IdentityFederationRepository.name),
  })
    async findOneOrFail(where?: Record<string, any>): Promise<IdentityFederation> {
      logger.info('Ready to findOneOrFail IdentityFederation on repository:',where);
      const entity = await this.repository.findOne({
        where: where,
      });
      if (!entity) {
        throw new Error('Entity not found');
      }
      return entity;
    }
}
