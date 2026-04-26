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
import { ChallengeStatus } from "../entities/challenge-status.entity";

//Definición de comandos
import {
  CreateChallengeStatusCommand,
  UpdateChallengeStatusCommand,
  DeleteChallengeStatusCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { ChallengeStatusQueryService } from "../services/challengestatusquery.service";


import { ChallengeStatusResponse, ChallengeStatussResponse } from "../types/challengestatus.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateChallengeStatusDto, 
CreateOrUpdateChallengeStatusDto, 
ChallengeStatusValueInput, 
ChallengeStatusDto, 
CreateChallengeStatusDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => ChallengeStatus)
export class ChallengeStatusResolver {

   //Constructor del resolver de ChallengeStatus
  constructor(
    private readonly service: ChallengeStatusQueryService,
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  // Mutaciones
  @Mutation(() => ChallengeStatusResponse<ChallengeStatus>)
  async createChallengeStatus(
    @Args("input", { type: () => CreateChallengeStatusDto }) input: CreateChallengeStatusDto
  ): Promise<ChallengeStatusResponse<ChallengeStatus>> {
    return this.commandBus.execute(new CreateChallengeStatusCommand(input));
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Mutation(() => ChallengeStatusResponse<ChallengeStatus>)
  async updateChallengeStatus(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateChallengeStatusDto
  ): Promise<ChallengeStatusResponse<ChallengeStatus>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateChallengeStatusCommand(payLoad, {
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Mutation(() => ChallengeStatusResponse<ChallengeStatus>)
  async createOrUpdateChallengeStatus(
    @Args("data", { type: () => CreateOrUpdateChallengeStatusDto })
    data: CreateOrUpdateChallengeStatusDto
  ): Promise<ChallengeStatusResponse<ChallengeStatus>> {
    if (data.id) {
      const existingChallengeStatus = await this.service.findById(data.id);
      if (existingChallengeStatus) {
        return this.commandBus.execute(
          new UpdateChallengeStatusCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateChallengeStatusDto | UpdateChallengeStatusDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateChallengeStatusCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateChallengeStatusDto | UpdateChallengeStatusDto).createdBy ||
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteChallengeStatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteChallengeStatusCommand(id));
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  // Queries
  @Query(() => ChallengeStatussResponse<ChallengeStatus>)
  async challengestatuss(
    options?: FindManyOptions<ChallengeStatus>,
    paginationArgs?: PaginationArgs
  ): Promise<ChallengeStatussResponse<ChallengeStatus>> {
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Query(() => ChallengeStatussResponse<ChallengeStatus>)
  async challengestatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<ChallengeStatusResponse<ChallengeStatus>> {
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Query(() => ChallengeStatussResponse<ChallengeStatus>)
  async challengestatussByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => ChallengeStatusValueInput }) value: ChallengeStatusValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ChallengeStatussResponse<ChallengeStatus>> {
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Query(() => ChallengeStatussResponse<ChallengeStatus>)
  async challengestatussWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<ChallengeStatussResponse<ChallengeStatus>> {
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Query(() => Number)
  async totalChallengeStatuss(): Promise<number> {
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Query(() => ChallengeStatussResponse<ChallengeStatus>)
  async searchChallengeStatuss(
    @Args("where", { type: () => ChallengeStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<ChallengeStatussResponse<ChallengeStatus>> {
    const challengestatuss = await this.service.findAndCount(where);
    return challengestatuss;
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Query(() => ChallengeStatusResponse<ChallengeStatus>, { nullable: true })
  async findOneChallengeStatus(
    @Args("where", { type: () => ChallengeStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<ChallengeStatusResponse<ChallengeStatus>> {
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
      .registerClient(ChallengeStatusResolver.name)

      .get(ChallengeStatusResolver.name),
    })
  @Query(() => ChallengeStatusResponse<ChallengeStatus>)
  async findOneChallengeStatusOrFail(
    @Args("where", { type: () => ChallengeStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<ChallengeStatusResponse<ChallengeStatus> | Error> {
    return this.service.findOneOrFail(where);
  }
}

