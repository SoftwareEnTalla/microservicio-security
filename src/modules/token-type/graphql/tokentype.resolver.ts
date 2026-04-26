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
import { TokenType } from "../entities/token-type.entity";

//Definición de comandos
import {
  CreateTokenTypeCommand,
  UpdateTokenTypeCommand,
  DeleteTokenTypeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { TokenTypeQueryService } from "../services/tokentypequery.service";


import { TokenTypeResponse, TokenTypesResponse } from "../types/tokentype.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateTokenTypeDto, 
CreateOrUpdateTokenTypeDto, 
TokenTypeValueInput, 
TokenTypeDto, 
CreateTokenTypeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => TokenType)
export class TokenTypeResolver {

   //Constructor del resolver de TokenType
  constructor(
    private readonly service: TokenTypeQueryService,
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  // Mutaciones
  @Mutation(() => TokenTypeResponse<TokenType>)
  async createTokenType(
    @Args("input", { type: () => CreateTokenTypeDto }) input: CreateTokenTypeDto
  ): Promise<TokenTypeResponse<TokenType>> {
    return this.commandBus.execute(new CreateTokenTypeCommand(input));
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Mutation(() => TokenTypeResponse<TokenType>)
  async updateTokenType(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateTokenTypeDto
  ): Promise<TokenTypeResponse<TokenType>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateTokenTypeCommand(payLoad, {
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Mutation(() => TokenTypeResponse<TokenType>)
  async createOrUpdateTokenType(
    @Args("data", { type: () => CreateOrUpdateTokenTypeDto })
    data: CreateOrUpdateTokenTypeDto
  ): Promise<TokenTypeResponse<TokenType>> {
    if (data.id) {
      const existingTokenType = await this.service.findById(data.id);
      if (existingTokenType) {
        return this.commandBus.execute(
          new UpdateTokenTypeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateTokenTypeDto | UpdateTokenTypeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateTokenTypeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateTokenTypeDto | UpdateTokenTypeDto).createdBy ||
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteTokenType(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteTokenTypeCommand(id));
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  // Queries
  @Query(() => TokenTypesResponse<TokenType>)
  async tokentypes(
    options?: FindManyOptions<TokenType>,
    paginationArgs?: PaginationArgs
  ): Promise<TokenTypesResponse<TokenType>> {
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Query(() => TokenTypesResponse<TokenType>)
  async tokentype(
    @Args("id", { type: () => String }) id: string
  ): Promise<TokenTypeResponse<TokenType>> {
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Query(() => TokenTypesResponse<TokenType>)
  async tokentypesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => TokenTypeValueInput }) value: TokenTypeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<TokenTypesResponse<TokenType>> {
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Query(() => TokenTypesResponse<TokenType>)
  async tokentypesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<TokenTypesResponse<TokenType>> {
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Query(() => Number)
  async totalTokenTypes(): Promise<number> {
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Query(() => TokenTypesResponse<TokenType>)
  async searchTokenTypes(
    @Args("where", { type: () => TokenTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<TokenTypesResponse<TokenType>> {
    const tokentypes = await this.service.findAndCount(where);
    return tokentypes;
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Query(() => TokenTypeResponse<TokenType>, { nullable: true })
  async findOneTokenType(
    @Args("where", { type: () => TokenTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<TokenTypeResponse<TokenType>> {
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
      .registerClient(TokenTypeResolver.name)

      .get(TokenTypeResolver.name),
    })
  @Query(() => TokenTypeResponse<TokenType>)
  async findOneTokenTypeOrFail(
    @Args("where", { type: () => TokenTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<TokenTypeResponse<TokenType> | Error> {
    return this.service.findOneOrFail(where);
  }
}

