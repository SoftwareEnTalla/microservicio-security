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
import { Authentication } from "../entities/authentication.entity";

//Definición de comandos
import {
  CreateAuthenticationCommand,
  UpdateAuthenticationCommand,
  DeleteAuthenticationCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { AuthenticationQueryService } from "../services/authenticationquery.service";


import { AuthenticationResponse, AuthenticationsResponse } from "../types/authentication.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateAuthenticationDto, 
CreateOrUpdateAuthenticationDto, 
AuthenticationValueInput, 
AuthenticationDto, 
CreateAuthenticationDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => Authentication)
export class AuthenticationResolver {

   //Constructor del resolver de Authentication
  constructor(
    private readonly service: AuthenticationQueryService,
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  // Mutaciones
  @Mutation(() => AuthenticationResponse<Authentication>)
  async createAuthentication(
    @Args("input", { type: () => CreateAuthenticationDto }) input: CreateAuthenticationDto
  ): Promise<AuthenticationResponse<Authentication>> {
    return this.commandBus.execute(new CreateAuthenticationCommand(input));
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Mutation(() => AuthenticationResponse<Authentication>)
  async updateAuthentication(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateAuthenticationDto
  ): Promise<AuthenticationResponse<Authentication>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateAuthenticationCommand(payLoad, {
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Mutation(() => AuthenticationResponse<Authentication>)
  async createOrUpdateAuthentication(
    @Args("data", { type: () => CreateOrUpdateAuthenticationDto })
    data: CreateOrUpdateAuthenticationDto
  ): Promise<AuthenticationResponse<Authentication>> {
    if (data.id) {
      const existingAuthentication = await this.service.findById(data.id);
      if (existingAuthentication) {
        return this.commandBus.execute(
          new UpdateAuthenticationCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateAuthenticationDto | UpdateAuthenticationDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateAuthenticationCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateAuthenticationDto | UpdateAuthenticationDto).createdBy ||
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteAuthentication(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteAuthenticationCommand(id));
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  // Queries
  @Query(() => AuthenticationsResponse<Authentication>)
  async authentications(
    options?: FindManyOptions<Authentication>,
    paginationArgs?: PaginationArgs
  ): Promise<AuthenticationsResponse<Authentication>> {
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Query(() => AuthenticationsResponse<Authentication>)
  async authentication(
    @Args("id", { type: () => String }) id: string
  ): Promise<AuthenticationResponse<Authentication>> {
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Query(() => AuthenticationsResponse<Authentication>)
  async authenticationsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => AuthenticationValueInput }) value: AuthenticationValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AuthenticationsResponse<Authentication>> {
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Query(() => AuthenticationsResponse<Authentication>)
  async authenticationsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AuthenticationsResponse<Authentication>> {
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Query(() => Number)
  async totalAuthentications(): Promise<number> {
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Query(() => AuthenticationsResponse<Authentication>)
  async searchAuthentications(
    @Args("where", { type: () => AuthenticationDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthenticationsResponse<Authentication>> {
    const authentications = await this.service.findAndCount(where);
    return authentications;
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Query(() => AuthenticationResponse<Authentication>, { nullable: true })
  async findOneAuthentication(
    @Args("where", { type: () => AuthenticationDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthenticationResponse<Authentication>> {
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
      .registerClient(AuthenticationResolver.name)

      .get(AuthenticationResolver.name),
    })
  @Query(() => AuthenticationResponse<Authentication>)
  async findOneAuthenticationOrFail(
    @Args("where", { type: () => AuthenticationDto, nullable: false })
    where: Record<string, any>
  ): Promise<AuthenticationResponse<Authentication> | Error> {
    return this.service.findOneOrFail(where);
  }
}

