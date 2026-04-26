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
import { AuthStatus } from "../entities/auth-status.entity";

//Definición de comandos
import {
  CreateAuthStatusCommand,
  UpdateAuthStatusCommand,
  DeleteAuthStatusCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { AuthStatusQueryService } from "../services/authstatusquery.service";


import { AuthStatusResponse, AuthStatussResponse } from "../types/authstatus.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateAuthStatusDto, 
CreateOrUpdateAuthStatusDto, 
AuthStatusValueInput, 
AuthStatusDto, 
CreateAuthStatusDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => AuthStatus)
export class AuthStatusResolver {

   //Constructor del resolver de AuthStatus
  constructor(
    private readonly service: AuthStatusQueryService,
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  // Mutaciones
  @Mutation(() => AuthStatusResponse<AuthStatus>)
  async createAuthStatus(
    @Args("input", { type: () => CreateAuthStatusDto }) input: CreateAuthStatusDto
  ): Promise<AuthStatusResponse<AuthStatus>> {
    return this.commandBus.execute(new CreateAuthStatusCommand(input));
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Mutation(() => AuthStatusResponse<AuthStatus>)
  async updateAuthStatus(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateAuthStatusDto
  ): Promise<AuthStatusResponse<AuthStatus>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateAuthStatusCommand(payLoad, {
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Mutation(() => AuthStatusResponse<AuthStatus>)
  async createOrUpdateAuthStatus(
    @Args("data", { type: () => CreateOrUpdateAuthStatusDto })
    data: CreateOrUpdateAuthStatusDto
  ): Promise<AuthStatusResponse<AuthStatus>> {
    if (data.id) {
      const existingAuthStatus = await this.service.findById(data.id);
      if (existingAuthStatus) {
        return this.commandBus.execute(
          new UpdateAuthStatusCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateAuthStatusDto | UpdateAuthStatusDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateAuthStatusCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateAuthStatusDto | UpdateAuthStatusDto).createdBy ||
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteAuthStatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteAuthStatusCommand(id));
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  // Queries
  @Query(() => AuthStatussResponse<AuthStatus>)
  async authstatuss(
    options?: FindManyOptions<AuthStatus>,
    paginationArgs?: PaginationArgs
  ): Promise<AuthStatussResponse<AuthStatus>> {
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Query(() => AuthStatussResponse<AuthStatus>)
  async authstatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<AuthStatusResponse<AuthStatus>> {
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Query(() => AuthStatussResponse<AuthStatus>)
  async authstatussByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => AuthStatusValueInput }) value: AuthStatusValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AuthStatussResponse<AuthStatus>> {
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Query(() => AuthStatussResponse<AuthStatus>)
  async authstatussWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AuthStatussResponse<AuthStatus>> {
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Query(() => Number)
  async totalAuthStatuss(): Promise<number> {
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Query(() => AuthStatussResponse<AuthStatus>)
  async searchAuthStatuss(
    @Args("where", { type: () => AuthStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthStatussResponse<AuthStatus>> {
    const authstatuss = await this.service.findAndCount(where);
    return authstatuss;
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Query(() => AuthStatusResponse<AuthStatus>, { nullable: true })
  async findOneAuthStatus(
    @Args("where", { type: () => AuthStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthStatusResponse<AuthStatus>> {
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
      .registerClient(AuthStatusResolver.name)

      .get(AuthStatusResolver.name),
    })
  @Query(() => AuthStatusResponse<AuthStatus>)
  async findOneAuthStatusOrFail(
    @Args("where", { type: () => AuthStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthStatusResponse<AuthStatus> | Error> {
    return this.service.findOneOrFail(where);
  }
}

