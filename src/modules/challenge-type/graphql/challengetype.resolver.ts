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
import { ChallengeType } from "../entities/challenge-type.entity";

//Definición de comandos
import {
  CreateChallengeTypeCommand,
  UpdateChallengeTypeCommand,
  DeleteChallengeTypeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { ChallengeTypeQueryService } from "../services/challengetypequery.service";


import { ChallengeTypeResponse, ChallengeTypesResponse } from "../types/challengetype.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateChallengeTypeDto, 
CreateOrUpdateChallengeTypeDto, 
ChallengeTypeValueInput, 
ChallengeTypeDto, 
CreateChallengeTypeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => ChallengeType)
export class ChallengeTypeResolver {

   //Constructor del resolver de ChallengeType
  constructor(
    private readonly service: ChallengeTypeQueryService,
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  // Mutaciones
  @Mutation(() => ChallengeTypeResponse<ChallengeType>)
  async createChallengeType(
    @Args("input", { type: () => CreateChallengeTypeDto }) input: CreateChallengeTypeDto
  ): Promise<ChallengeTypeResponse<ChallengeType>> {
    return this.commandBus.execute(new CreateChallengeTypeCommand(input));
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Mutation(() => ChallengeTypeResponse<ChallengeType>)
  async updateChallengeType(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateChallengeTypeDto
  ): Promise<ChallengeTypeResponse<ChallengeType>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateChallengeTypeCommand(payLoad, {
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Mutation(() => ChallengeTypeResponse<ChallengeType>)
  async createOrUpdateChallengeType(
    @Args("data", { type: () => CreateOrUpdateChallengeTypeDto })
    data: CreateOrUpdateChallengeTypeDto
  ): Promise<ChallengeTypeResponse<ChallengeType>> {
    if (data.id) {
      const existingChallengeType = await this.service.findById(data.id);
      if (existingChallengeType) {
        return this.commandBus.execute(
          new UpdateChallengeTypeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateChallengeTypeDto | UpdateChallengeTypeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateChallengeTypeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateChallengeTypeDto | UpdateChallengeTypeDto).createdBy ||
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteChallengeType(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteChallengeTypeCommand(id));
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  // Queries
  @Query(() => ChallengeTypesResponse<ChallengeType>)
  async challengetypes(
    options?: FindManyOptions<ChallengeType>,
    paginationArgs?: PaginationArgs
  ): Promise<ChallengeTypesResponse<ChallengeType>> {
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Query(() => ChallengeTypesResponse<ChallengeType>)
  async challengetype(
    @Args("id", { type: () => String }) id: string
  ): Promise<ChallengeTypeResponse<ChallengeType>> {
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Query(() => ChallengeTypesResponse<ChallengeType>)
  async challengetypesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => ChallengeTypeValueInput }) value: ChallengeTypeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ChallengeTypesResponse<ChallengeType>> {
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Query(() => ChallengeTypesResponse<ChallengeType>)
  async challengetypesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ChallengeTypesResponse<ChallengeType>> {
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Query(() => Number)
  async totalChallengeTypes(): Promise<number> {
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Query(() => ChallengeTypesResponse<ChallengeType>)
  async searchChallengeTypes(
    @Args("where", { type: () => ChallengeTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<ChallengeTypesResponse<ChallengeType>> {
    const challengetypes = await this.service.findAndCount(where);
    return challengetypes;
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Query(() => ChallengeTypeResponse<ChallengeType>, { nullable: true })
  async findOneChallengeType(
    @Args("where", { type: () => ChallengeTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<ChallengeTypeResponse<ChallengeType>> {
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
      .registerClient(ChallengeTypeResolver.name)

      .get(ChallengeTypeResolver.name),
    })
  @Query(() => ChallengeTypeResponse<ChallengeType>)
  async findOneChallengeTypeOrFail(
    @Args("where", { type: () => ChallengeTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<ChallengeTypeResponse<ChallengeType> | Error> {
    return this.service.findOneOrFail(where);
  }
}

