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
import { ProviderType } from "../entities/provider-type.entity";

//Definición de comandos
import {
  CreateProviderTypeCommand,
  UpdateProviderTypeCommand,
  DeleteProviderTypeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { ProviderTypeQueryService } from "../services/providertypequery.service";


import { ProviderTypeResponse, ProviderTypesResponse } from "../types/providertype.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateProviderTypeDto, 
CreateOrUpdateProviderTypeDto, 
ProviderTypeValueInput, 
ProviderTypeDto, 
CreateProviderTypeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => ProviderType)
export class ProviderTypeResolver {

   //Constructor del resolver de ProviderType
  constructor(
    private readonly service: ProviderTypeQueryService,
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  // Mutaciones
  @Mutation(() => ProviderTypeResponse<ProviderType>)
  async createProviderType(
    @Args("input", { type: () => CreateProviderTypeDto }) input: CreateProviderTypeDto
  ): Promise<ProviderTypeResponse<ProviderType>> {
    return this.commandBus.execute(new CreateProviderTypeCommand(input));
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Mutation(() => ProviderTypeResponse<ProviderType>)
  async updateProviderType(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateProviderTypeDto
  ): Promise<ProviderTypeResponse<ProviderType>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateProviderTypeCommand(payLoad, {
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Mutation(() => ProviderTypeResponse<ProviderType>)
  async createOrUpdateProviderType(
    @Args("data", { type: () => CreateOrUpdateProviderTypeDto })
    data: CreateOrUpdateProviderTypeDto
  ): Promise<ProviderTypeResponse<ProviderType>> {
    if (data.id) {
      const existingProviderType = await this.service.findById(data.id);
      if (existingProviderType) {
        return this.commandBus.execute(
          new UpdateProviderTypeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateProviderTypeDto | UpdateProviderTypeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateProviderTypeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateProviderTypeDto | UpdateProviderTypeDto).createdBy ||
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteProviderType(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteProviderTypeCommand(id));
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  // Queries
  @Query(() => ProviderTypesResponse<ProviderType>)
  async providertypes(
    options?: FindManyOptions<ProviderType>,
    paginationArgs?: PaginationArgs
  ): Promise<ProviderTypesResponse<ProviderType>> {
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Query(() => ProviderTypesResponse<ProviderType>)
  async providertype(
    @Args("id", { type: () => String }) id: string
  ): Promise<ProviderTypeResponse<ProviderType>> {
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Query(() => ProviderTypesResponse<ProviderType>)
  async providertypesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => ProviderTypeValueInput }) value: ProviderTypeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ProviderTypesResponse<ProviderType>> {
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Query(() => ProviderTypesResponse<ProviderType>)
  async providertypesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ProviderTypesResponse<ProviderType>> {
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Query(() => Number)
  async totalProviderTypes(): Promise<number> {
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Query(() => ProviderTypesResponse<ProviderType>)
  async searchProviderTypes(
    @Args("where", { type: () => ProviderTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<ProviderTypesResponse<ProviderType>> {
    const providertypes = await this.service.findAndCount(where);
    return providertypes;
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Query(() => ProviderTypeResponse<ProviderType>, { nullable: true })
  async findOneProviderType(
    @Args("where", { type: () => ProviderTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<ProviderTypeResponse<ProviderType>> {
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
      .registerClient(ProviderTypeResolver.name)

      .get(ProviderTypeResolver.name),
    })
  @Query(() => ProviderTypeResponse<ProviderType>)
  async findOneProviderTypeOrFail(
    @Args("where", { type: () => ProviderTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<ProviderTypeResponse<ProviderType> | Error> {
    return this.service.findOneOrFail(where);
  }
}

