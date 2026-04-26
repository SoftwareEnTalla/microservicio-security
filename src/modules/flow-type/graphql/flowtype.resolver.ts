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
import { FlowType } from "../entities/flow-type.entity";

//Definición de comandos
import {
  CreateFlowTypeCommand,
  UpdateFlowTypeCommand,
  DeleteFlowTypeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { FlowTypeQueryService } from "../services/flowtypequery.service";


import { FlowTypeResponse, FlowTypesResponse } from "../types/flowtype.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateFlowTypeDto, 
CreateOrUpdateFlowTypeDto, 
FlowTypeValueInput, 
FlowTypeDto, 
CreateFlowTypeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => FlowType)
export class FlowTypeResolver {

   //Constructor del resolver de FlowType
  constructor(
    private readonly service: FlowTypeQueryService,
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  // Mutaciones
  @Mutation(() => FlowTypeResponse<FlowType>)
  async createFlowType(
    @Args("input", { type: () => CreateFlowTypeDto }) input: CreateFlowTypeDto
  ): Promise<FlowTypeResponse<FlowType>> {
    return this.commandBus.execute(new CreateFlowTypeCommand(input));
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Mutation(() => FlowTypeResponse<FlowType>)
  async updateFlowType(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateFlowTypeDto
  ): Promise<FlowTypeResponse<FlowType>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateFlowTypeCommand(payLoad, {
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Mutation(() => FlowTypeResponse<FlowType>)
  async createOrUpdateFlowType(
    @Args("data", { type: () => CreateOrUpdateFlowTypeDto })
    data: CreateOrUpdateFlowTypeDto
  ): Promise<FlowTypeResponse<FlowType>> {
    if (data.id) {
      const existingFlowType = await this.service.findById(data.id);
      if (existingFlowType) {
        return this.commandBus.execute(
          new UpdateFlowTypeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateFlowTypeDto | UpdateFlowTypeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateFlowTypeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateFlowTypeDto | UpdateFlowTypeDto).createdBy ||
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteFlowType(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteFlowTypeCommand(id));
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  // Queries
  @Query(() => FlowTypesResponse<FlowType>)
  async flowtypes(
    options?: FindManyOptions<FlowType>,
    paginationArgs?: PaginationArgs
  ): Promise<FlowTypesResponse<FlowType>> {
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Query(() => FlowTypesResponse<FlowType>)
  async flowtype(
    @Args("id", { type: () => String }) id: string
  ): Promise<FlowTypeResponse<FlowType>> {
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Query(() => FlowTypesResponse<FlowType>)
  async flowtypesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => FlowTypeValueInput }) value: FlowTypeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<FlowTypesResponse<FlowType>> {
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Query(() => FlowTypesResponse<FlowType>)
  async flowtypesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<FlowTypesResponse<FlowType>> {
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Query(() => Number)
  async totalFlowTypes(): Promise<number> {
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Query(() => FlowTypesResponse<FlowType>)
  async searchFlowTypes(
    @Args("where", { type: () => FlowTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<FlowTypesResponse<FlowType>> {
    const flowtypes = await this.service.findAndCount(where);
    return flowtypes;
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Query(() => FlowTypeResponse<FlowType>, { nullable: true })
  async findOneFlowType(
    @Args("where", { type: () => FlowTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<FlowTypeResponse<FlowType>> {
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
      .registerClient(FlowTypeResolver.name)

      .get(FlowTypeResolver.name),
    })
  @Query(() => FlowTypeResponse<FlowType>)
  async findOneFlowTypeOrFail(
    @Args("where", { type: () => FlowTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<FlowTypeResponse<FlowType> | Error> {
    return this.service.findOneOrFail(where);
  }
}

