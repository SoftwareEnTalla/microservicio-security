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
import { ProtocolFamily } from "../entities/protocol-family.entity";

//Definición de comandos
import {
  CreateProtocolFamilyCommand,
  UpdateProtocolFamilyCommand,
  DeleteProtocolFamilyCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { ProtocolFamilyQueryService } from "../services/protocolfamilyquery.service";


import { ProtocolFamilyResponse, ProtocolFamilysResponse } from "../types/protocolfamily.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateProtocolFamilyDto, 
CreateOrUpdateProtocolFamilyDto, 
ProtocolFamilyValueInput, 
ProtocolFamilyDto, 
CreateProtocolFamilyDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => ProtocolFamily)
export class ProtocolFamilyResolver {

   //Constructor del resolver de ProtocolFamily
  constructor(
    private readonly service: ProtocolFamilyQueryService,
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  // Mutaciones
  @Mutation(() => ProtocolFamilyResponse<ProtocolFamily>)
  async createProtocolFamily(
    @Args("input", { type: () => CreateProtocolFamilyDto }) input: CreateProtocolFamilyDto
  ): Promise<ProtocolFamilyResponse<ProtocolFamily>> {
    return this.commandBus.execute(new CreateProtocolFamilyCommand(input));
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Mutation(() => ProtocolFamilyResponse<ProtocolFamily>)
  async updateProtocolFamily(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateProtocolFamilyDto
  ): Promise<ProtocolFamilyResponse<ProtocolFamily>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateProtocolFamilyCommand(payLoad, {
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Mutation(() => ProtocolFamilyResponse<ProtocolFamily>)
  async createOrUpdateProtocolFamily(
    @Args("data", { type: () => CreateOrUpdateProtocolFamilyDto })
    data: CreateOrUpdateProtocolFamilyDto
  ): Promise<ProtocolFamilyResponse<ProtocolFamily>> {
    if (data.id) {
      const existingProtocolFamily = await this.service.findById(data.id);
      if (existingProtocolFamily) {
        return this.commandBus.execute(
          new UpdateProtocolFamilyCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateProtocolFamilyDto | UpdateProtocolFamilyDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateProtocolFamilyCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateProtocolFamilyDto | UpdateProtocolFamilyDto).createdBy ||
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteProtocolFamily(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteProtocolFamilyCommand(id));
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  // Queries
  @Query(() => ProtocolFamilysResponse<ProtocolFamily>)
  async protocolfamilys(
    options?: FindManyOptions<ProtocolFamily>,
    paginationArgs?: PaginationArgs
  ): Promise<ProtocolFamilysResponse<ProtocolFamily>> {
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Query(() => ProtocolFamilysResponse<ProtocolFamily>)
  async protocolfamily(
    @Args("id", { type: () => String }) id: string
  ): Promise<ProtocolFamilyResponse<ProtocolFamily>> {
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Query(() => ProtocolFamilysResponse<ProtocolFamily>)
  async protocolfamilysByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => ProtocolFamilyValueInput }) value: ProtocolFamilyValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ProtocolFamilysResponse<ProtocolFamily>> {
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Query(() => ProtocolFamilysResponse<ProtocolFamily>)
  async protocolfamilysWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ProtocolFamilysResponse<ProtocolFamily>> {
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Query(() => Number)
  async totalProtocolFamilys(): Promise<number> {
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Query(() => ProtocolFamilysResponse<ProtocolFamily>)
  async searchProtocolFamilys(
    @Args("where", { type: () => ProtocolFamilyDto, nullable: false })
    where: Record<string, any>
  ): Promise<ProtocolFamilysResponse<ProtocolFamily>> {
    const protocolfamilys = await this.service.findAndCount(where);
    return protocolfamilys;
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Query(() => ProtocolFamilyResponse<ProtocolFamily>, { nullable: true })
  async findOneProtocolFamily(
    @Args("where", { type: () => ProtocolFamilyDto, nullable: false })
    where: Record<string, any>
  ): Promise<ProtocolFamilyResponse<ProtocolFamily>> {
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
      .registerClient(ProtocolFamilyResolver.name)

      .get(ProtocolFamilyResolver.name),
    })
  @Query(() => ProtocolFamilyResponse<ProtocolFamily>)
  async findOneProtocolFamilyOrFail(
    @Args("where", { type: () => ProtocolFamilyDto, nullable: false })
    where: Record<string, any>
  ): Promise<ProtocolFamilyResponse<ProtocolFamily> | Error> {
    return this.service.findOneOrFail(where);
  }
}

