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
import { SessionToken } from "../entities/session-token.entity";

//Definición de comandos
import {
  CreateSessionTokenCommand,
  UpdateSessionTokenCommand,
  DeleteSessionTokenCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SessionTokenQueryService } from "../services/sessiontokenquery.service";


import { SessionTokenResponse, SessionTokensResponse } from "../types/sessiontoken.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSessionTokenDto, 
CreateOrUpdateSessionTokenDto, 
SessionTokenValueInput, 
SessionTokenDto, 
CreateSessionTokenDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => SessionToken)
export class SessionTokenResolver {

   //Constructor del resolver de SessionToken
  constructor(
    private readonly service: SessionTokenQueryService,
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  // Mutaciones
  @Mutation(() => SessionTokenResponse<SessionToken>)
  async createSessionToken(
    @Args("input", { type: () => CreateSessionTokenDto }) input: CreateSessionTokenDto
  ): Promise<SessionTokenResponse<SessionToken>> {
    return this.commandBus.execute(new CreateSessionTokenCommand(input));
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Mutation(() => SessionTokenResponse<SessionToken>)
  async updateSessionToken(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSessionTokenDto
  ): Promise<SessionTokenResponse<SessionToken>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSessionTokenCommand(payLoad, {
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Mutation(() => SessionTokenResponse<SessionToken>)
  async createOrUpdateSessionToken(
    @Args("data", { type: () => CreateOrUpdateSessionTokenDto })
    data: CreateOrUpdateSessionTokenDto
  ): Promise<SessionTokenResponse<SessionToken>> {
    if (data.id) {
      const existingSessionToken = await this.service.findById(data.id);
      if (existingSessionToken) {
        return this.commandBus.execute(
          new UpdateSessionTokenCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSessionTokenDto | UpdateSessionTokenDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSessionTokenCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSessionTokenDto | UpdateSessionTokenDto).createdBy ||
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSessionToken(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSessionTokenCommand(id));
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  // Queries
  @Query(() => SessionTokensResponse<SessionToken>)
  async sessiontokens(
    options?: FindManyOptions<SessionToken>,
    paginationArgs?: PaginationArgs
  ): Promise<SessionTokensResponse<SessionToken>> {
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Query(() => SessionTokensResponse<SessionToken>)
  async sessiontoken(
    @Args("id", { type: () => String }) id: string
  ): Promise<SessionTokenResponse<SessionToken>> {
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Query(() => SessionTokensResponse<SessionToken>)
  async sessiontokensByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SessionTokenValueInput }) value: SessionTokenValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SessionTokensResponse<SessionToken>> {
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Query(() => SessionTokensResponse<SessionToken>)
  async sessiontokensWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SessionTokensResponse<SessionToken>> {
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Query(() => Number)
  async totalSessionTokens(): Promise<number> {
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Query(() => SessionTokensResponse<SessionToken>)
  async searchSessionTokens(
    @Args("where", { type: () => SessionTokenDto, nullable: false })
    where: Record<string, any>
  ): Promise<SessionTokensResponse<SessionToken>> {
    const sessiontokens = await this.service.findAndCount(where);
    return sessiontokens;
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Query(() => SessionTokenResponse<SessionToken>, { nullable: true })
  async findOneSessionToken(
    @Args("where", { type: () => SessionTokenDto, nullable: false })
    where: Record<string, any>
  ): Promise<SessionTokenResponse<SessionToken>> {
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
      .registerClient(SessionTokenResolver.name)

      .get(SessionTokenResolver.name),
    })
  @Query(() => SessionTokenResponse<SessionToken>)
  async findOneSessionTokenOrFail(
    @Args("where", { type: () => SessionTokenDto, nullable: false })
    where: Record<string, any>
  ): Promise<SessionTokenResponse<SessionToken> | Error> {
    return this.service.findOneOrFail(where);
  }
}

