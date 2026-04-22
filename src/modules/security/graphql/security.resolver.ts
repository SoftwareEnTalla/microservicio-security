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


import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";

//Definición de entidades
import { Security } from "../entities/security.entity";

//Definición de comandos
import {
  CreateSecurityCommand,
  UpdateSecurityCommand,
  DeleteSecurityCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SecurityQueryService } from "../services/securityquery.service";


import { SecurityResponse, SecuritysResponse } from "../types/security.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSecurityDto, 
CreateOrUpdateSecurityDto, 
SecurityValueInput, 
SecurityDto, 
CreateSecurityDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => Security)
export class SecurityResolver {

   //Constructor del resolver de Security
  constructor(
    private readonly service: SecurityQueryService,
    private readonly commandBus: CommandBus
  ) {}

  @LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  // Mutaciones
  @Mutation(() => SecurityResponse<Security>)
  async createSecurity(
    @Args("input", { type: () => CreateSecurityDto }) input: CreateSecurityDto
  ): Promise<SecurityResponse<Security>> {
    return this.commandBus.execute(new CreateSecurityCommand(input));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Mutation(() => SecurityResponse<Security>)
  async updateSecurity(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSecurityDto
  ): Promise<SecurityResponse<Security>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSecurityCommand(payLoad, {
        instance: payLoad,
        metadata: {
          initiatedBy: payLoad.createdBy || 'system',
          correlationId: payLoad.id,
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Mutation(() => SecurityResponse<Security>)
  async createOrUpdateSecurity(
    @Args("data", { type: () => CreateOrUpdateSecurityDto })
    data: CreateOrUpdateSecurityDto
  ): Promise<SecurityResponse<Security>> {
    if (data.id) {
      const existingSecurity = await this.service.findById(data.id);
      if (existingSecurity) {
        return this.commandBus.execute(
          new UpdateSecurityCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSecurityDto | UpdateSecurityDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSecurityCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSecurityDto | UpdateSecurityDto).createdBy ||
            'system',
          correlationId: data.id || uuidv4(),
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSecurity(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSecurityCommand(id));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  // Queries
  @Query(() => SecuritysResponse<Security>)
  async securitys(
    options?: FindManyOptions<Security>,
    paginationArgs?: PaginationArgs
  ): Promise<SecuritysResponse<Security>> {
    return this.service.findAll(options, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Query(() => SecuritysResponse<Security>)
  async security(
    @Args("id", { type: () => String }) id: string
  ): Promise<SecurityResponse<Security>> {
    return this.service.findById(id);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Query(() => SecuritysResponse<Security>)
  async securitysByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SecurityValueInput }) value: SecurityValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecuritysResponse<Security>> {
    return this.service.findByField(
      field,
      value,
      fromObject.call(PaginationArgs, { page: page, limit: limit })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Query(() => SecuritysResponse<Security>)
  async securitysWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecuritysResponse<Security>> {
    const paginationArgs = fromObject.call(PaginationArgs, {
      page: page,
      limit: limit,
    });
    return this.service.findWithPagination({}, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Query(() => Number)
  async totalSecuritys(): Promise<number> {
    return this.service.count();
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Query(() => SecuritysResponse<Security>)
  async searchSecuritys(
    @Args("where", { type: () => SecurityDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecuritysResponse<Security>> {
    const securitys = await this.service.findAndCount(where);
    return securitys;
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Query(() => SecurityResponse<Security>, { nullable: true })
  async findOneSecurity(
    @Args("where", { type: () => SecurityDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityResponse<Security>> {
    return this.service.findOne(where);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(SecurityResolver.name)

      .get(SecurityResolver.name),
    })
  @Query(() => SecurityResponse<Security>)
  async findOneSecurityOrFail(
    @Args("where", { type: () => SecurityDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityResponse<Security> | Error> {
    return this.service.findOneOrFail(where);
  }
}

