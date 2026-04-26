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
import { AuthMethod } from "../entities/auth-method.entity";

//Definición de comandos
import {
  CreateAuthMethodCommand,
  UpdateAuthMethodCommand,
  DeleteAuthMethodCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { AuthMethodQueryService } from "../services/authmethodquery.service";


import { AuthMethodResponse, AuthMethodsResponse } from "../types/authmethod.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateAuthMethodDto, 
CreateOrUpdateAuthMethodDto, 
AuthMethodValueInput, 
AuthMethodDto, 
CreateAuthMethodDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => AuthMethod)
export class AuthMethodResolver {

   //Constructor del resolver de AuthMethod
  constructor(
    private readonly service: AuthMethodQueryService,
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  // Mutaciones
  @Mutation(() => AuthMethodResponse<AuthMethod>)
  async createAuthMethod(
    @Args("input", { type: () => CreateAuthMethodDto }) input: CreateAuthMethodDto
  ): Promise<AuthMethodResponse<AuthMethod>> {
    return this.commandBus.execute(new CreateAuthMethodCommand(input));
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Mutation(() => AuthMethodResponse<AuthMethod>)
  async updateAuthMethod(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateAuthMethodDto
  ): Promise<AuthMethodResponse<AuthMethod>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateAuthMethodCommand(payLoad, {
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Mutation(() => AuthMethodResponse<AuthMethod>)
  async createOrUpdateAuthMethod(
    @Args("data", { type: () => CreateOrUpdateAuthMethodDto })
    data: CreateOrUpdateAuthMethodDto
  ): Promise<AuthMethodResponse<AuthMethod>> {
    if (data.id) {
      const existingAuthMethod = await this.service.findById(data.id);
      if (existingAuthMethod) {
        return this.commandBus.execute(
          new UpdateAuthMethodCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateAuthMethodDto | UpdateAuthMethodDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateAuthMethodCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateAuthMethodDto | UpdateAuthMethodDto).createdBy ||
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteAuthMethod(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteAuthMethodCommand(id));
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  // Queries
  @Query(() => AuthMethodsResponse<AuthMethod>)
  async authmethods(
    options?: FindManyOptions<AuthMethod>,
    paginationArgs?: PaginationArgs
  ): Promise<AuthMethodsResponse<AuthMethod>> {
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Query(() => AuthMethodsResponse<AuthMethod>)
  async authmethod(
    @Args("id", { type: () => String }) id: string
  ): Promise<AuthMethodResponse<AuthMethod>> {
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Query(() => AuthMethodsResponse<AuthMethod>)
  async authmethodsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => AuthMethodValueInput }) value: AuthMethodValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AuthMethodsResponse<AuthMethod>> {
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Query(() => AuthMethodsResponse<AuthMethod>)
  async authmethodsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AuthMethodsResponse<AuthMethod>> {
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Query(() => Number)
  async totalAuthMethods(): Promise<number> {
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Query(() => AuthMethodsResponse<AuthMethod>)
  async searchAuthMethods(
    @Args("where", { type: () => AuthMethodDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthMethodsResponse<AuthMethod>> {
    const authmethods = await this.service.findAndCount(where);
    return authmethods;
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Query(() => AuthMethodResponse<AuthMethod>, { nullable: true })
  async findOneAuthMethod(
    @Args("where", { type: () => AuthMethodDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthMethodResponse<AuthMethod>> {
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
      .registerClient(AuthMethodResolver.name)

      .get(AuthMethodResolver.name),
    })
  @Query(() => AuthMethodResponse<AuthMethod>)
  async findOneAuthMethodOrFail(
    @Args("where", { type: () => AuthMethodDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthMethodResponse<AuthMethod> | Error> {
    return this.service.findOneOrFail(where);
  }
}

