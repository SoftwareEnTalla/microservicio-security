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
import { IdentifierType } from "../entities/identifier-type.entity";

//Definición de comandos
import {
  CreateIdentifierTypeCommand,
  UpdateIdentifierTypeCommand,
  DeleteIdentifierTypeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { IdentifierTypeQueryService } from "../services/identifiertypequery.service";


import { IdentifierTypeResponse, IdentifierTypesResponse } from "../types/identifiertype.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateIdentifierTypeDto, 
CreateOrUpdateIdentifierTypeDto, 
IdentifierTypeValueInput, 
IdentifierTypeDto, 
CreateIdentifierTypeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => IdentifierType)
export class IdentifierTypeResolver {

   //Constructor del resolver de IdentifierType
  constructor(
    private readonly service: IdentifierTypeQueryService,
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  // Mutaciones
  @Mutation(() => IdentifierTypeResponse<IdentifierType>)
  async createIdentifierType(
    @Args("input", { type: () => CreateIdentifierTypeDto }) input: CreateIdentifierTypeDto
  ): Promise<IdentifierTypeResponse<IdentifierType>> {
    return this.commandBus.execute(new CreateIdentifierTypeCommand(input));
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Mutation(() => IdentifierTypeResponse<IdentifierType>)
  async updateIdentifierType(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateIdentifierTypeDto
  ): Promise<IdentifierTypeResponse<IdentifierType>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateIdentifierTypeCommand(payLoad, {
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Mutation(() => IdentifierTypeResponse<IdentifierType>)
  async createOrUpdateIdentifierType(
    @Args("data", { type: () => CreateOrUpdateIdentifierTypeDto })
    data: CreateOrUpdateIdentifierTypeDto
  ): Promise<IdentifierTypeResponse<IdentifierType>> {
    if (data.id) {
      const existingIdentifierType = await this.service.findById(data.id);
      if (existingIdentifierType) {
        return this.commandBus.execute(
          new UpdateIdentifierTypeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateIdentifierTypeDto | UpdateIdentifierTypeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateIdentifierTypeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateIdentifierTypeDto | UpdateIdentifierTypeDto).createdBy ||
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteIdentifierType(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteIdentifierTypeCommand(id));
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  // Queries
  @Query(() => IdentifierTypesResponse<IdentifierType>)
  async identifiertypes(
    options?: FindManyOptions<IdentifierType>,
    paginationArgs?: PaginationArgs
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Query(() => IdentifierTypesResponse<IdentifierType>)
  async identifiertype(
    @Args("id", { type: () => String }) id: string
  ): Promise<IdentifierTypeResponse<IdentifierType>> {
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Query(() => IdentifierTypesResponse<IdentifierType>)
  async identifiertypesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => IdentifierTypeValueInput }) value: IdentifierTypeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Query(() => IdentifierTypesResponse<IdentifierType>)
  async identifiertypesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Query(() => Number)
  async totalIdentifierTypes(): Promise<number> {
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Query(() => IdentifierTypesResponse<IdentifierType>)
  async searchIdentifierTypes(
    @Args("where", { type: () => IdentifierTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<IdentifierTypesResponse<IdentifierType>> {
    const identifiertypes = await this.service.findAndCount(where);
    return identifiertypes;
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Query(() => IdentifierTypeResponse<IdentifierType>, { nullable: true })
  async findOneIdentifierType(
    @Args("where", { type: () => IdentifierTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<IdentifierTypeResponse<IdentifierType>> {
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
      .registerClient(IdentifierTypeResolver.name)

      .get(IdentifierTypeResolver.name),
    })
  @Query(() => IdentifierTypeResponse<IdentifierType>)
  async findOneIdentifierTypeOrFail(
    @Args("where", { type: () => IdentifierTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<IdentifierTypeResponse<IdentifierType> | Error> {
    return this.service.findOneOrFail(where);
  }
}

