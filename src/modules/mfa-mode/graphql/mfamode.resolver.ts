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
import { MfaMode } from "../entities/mfa-mode.entity";

//Definición de comandos
import {
  CreateMfaModeCommand,
  UpdateMfaModeCommand,
  DeleteMfaModeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { MfaModeQueryService } from "../services/mfamodequery.service";


import { MfaModeResponse, MfaModesResponse } from "../types/mfamode.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateMfaModeDto, 
CreateOrUpdateMfaModeDto, 
MfaModeValueInput, 
MfaModeDto, 
CreateMfaModeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => MfaMode)
export class MfaModeResolver {

   //Constructor del resolver de MfaMode
  constructor(
    private readonly service: MfaModeQueryService,
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  // Mutaciones
  @Mutation(() => MfaModeResponse<MfaMode>)
  async createMfaMode(
    @Args("input", { type: () => CreateMfaModeDto }) input: CreateMfaModeDto
  ): Promise<MfaModeResponse<MfaMode>> {
    return this.commandBus.execute(new CreateMfaModeCommand(input));
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Mutation(() => MfaModeResponse<MfaMode>)
  async updateMfaMode(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateMfaModeDto
  ): Promise<MfaModeResponse<MfaMode>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateMfaModeCommand(payLoad, {
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Mutation(() => MfaModeResponse<MfaMode>)
  async createOrUpdateMfaMode(
    @Args("data", { type: () => CreateOrUpdateMfaModeDto })
    data: CreateOrUpdateMfaModeDto
  ): Promise<MfaModeResponse<MfaMode>> {
    if (data.id) {
      const existingMfaMode = await this.service.findById(data.id);
      if (existingMfaMode) {
        return this.commandBus.execute(
          new UpdateMfaModeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateMfaModeDto | UpdateMfaModeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateMfaModeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateMfaModeDto | UpdateMfaModeDto).createdBy ||
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteMfaMode(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteMfaModeCommand(id));
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  // Queries
  @Query(() => MfaModesResponse<MfaMode>)
  async mfamodes(
    options?: FindManyOptions<MfaMode>,
    paginationArgs?: PaginationArgs
  ): Promise<MfaModesResponse<MfaMode>> {
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Query(() => MfaModesResponse<MfaMode>)
  async mfamode(
    @Args("id", { type: () => String }) id: string
  ): Promise<MfaModeResponse<MfaMode>> {
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Query(() => MfaModesResponse<MfaMode>)
  async mfamodesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => MfaModeValueInput }) value: MfaModeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<MfaModesResponse<MfaMode>> {
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Query(() => MfaModesResponse<MfaMode>)
  async mfamodesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<MfaModesResponse<MfaMode>> {
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Query(() => Number)
  async totalMfaModes(): Promise<number> {
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Query(() => MfaModesResponse<MfaMode>)
  async searchMfaModes(
    @Args("where", { type: () => MfaModeDto, nullable: false })
    where: Record<string, any>
  ): Promise<MfaModesResponse<MfaMode>> {
    const mfamodes = await this.service.findAndCount(where);
    return mfamodes;
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Query(() => MfaModeResponse<MfaMode>, { nullable: true })
  async findOneMfaMode(
    @Args("where", { type: () => MfaModeDto, nullable: false })
    where: Record<string, any>
  ): Promise<MfaModeResponse<MfaMode>> {
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
      .registerClient(MfaModeResolver.name)

      .get(MfaModeResolver.name),
    })
  @Query(() => MfaModeResponse<MfaMode>)
  async findOneMfaModeOrFail(
    @Args("where", { type: () => MfaModeDto, nullable: false })
    where: Record<string, any>
  ): Promise<MfaModeResponse<MfaMode> | Error> {
    return this.service.findOneOrFail(where);
  }
}

