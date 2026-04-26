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
import { LoginIdentifierType } from "../entities/login-identifier-type.entity";

//Definición de comandos
import {
  CreateLoginIdentifierTypeCommand,
  UpdateLoginIdentifierTypeCommand,
  DeleteLoginIdentifierTypeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { LoginIdentifierTypeQueryService } from "../services/loginidentifiertypequery.service";


import { LoginIdentifierTypeResponse, LoginIdentifierTypesResponse } from "../types/loginidentifiertype.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateLoginIdentifierTypeDto, 
CreateOrUpdateLoginIdentifierTypeDto, 
LoginIdentifierTypeValueInput, 
LoginIdentifierTypeDto, 
CreateLoginIdentifierTypeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => LoginIdentifierType)
export class LoginIdentifierTypeResolver {

   //Constructor del resolver de LoginIdentifierType
  constructor(
    private readonly service: LoginIdentifierTypeQueryService,
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  // Mutaciones
  @Mutation(() => LoginIdentifierTypeResponse<LoginIdentifierType>)
  async createLoginIdentifierType(
    @Args("input", { type: () => CreateLoginIdentifierTypeDto }) input: CreateLoginIdentifierTypeDto
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
    return this.commandBus.execute(new CreateLoginIdentifierTypeCommand(input));
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Mutation(() => LoginIdentifierTypeResponse<LoginIdentifierType>)
  async updateLoginIdentifierType(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateLoginIdentifierTypeDto
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateLoginIdentifierTypeCommand(payLoad, {
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Mutation(() => LoginIdentifierTypeResponse<LoginIdentifierType>)
  async createOrUpdateLoginIdentifierType(
    @Args("data", { type: () => CreateOrUpdateLoginIdentifierTypeDto })
    data: CreateOrUpdateLoginIdentifierTypeDto
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
    if (data.id) {
      const existingLoginIdentifierType = await this.service.findById(data.id);
      if (existingLoginIdentifierType) {
        return this.commandBus.execute(
          new UpdateLoginIdentifierTypeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateLoginIdentifierTypeDto | UpdateLoginIdentifierTypeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateLoginIdentifierTypeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateLoginIdentifierTypeDto | UpdateLoginIdentifierTypeDto).createdBy ||
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteLoginIdentifierType(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteLoginIdentifierTypeCommand(id));
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  // Queries
  @Query(() => LoginIdentifierTypesResponse<LoginIdentifierType>)
  async loginidentifiertypes(
    options?: FindManyOptions<LoginIdentifierType>,
    paginationArgs?: PaginationArgs
  ): Promise<LoginIdentifierTypesResponse<LoginIdentifierType>> {
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Query(() => LoginIdentifierTypesResponse<LoginIdentifierType>)
  async loginidentifiertype(
    @Args("id", { type: () => String }) id: string
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Query(() => LoginIdentifierTypesResponse<LoginIdentifierType>)
  async loginidentifiertypesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => LoginIdentifierTypeValueInput }) value: LoginIdentifierTypeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<LoginIdentifierTypesResponse<LoginIdentifierType>> {
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Query(() => LoginIdentifierTypesResponse<LoginIdentifierType>)
  async loginidentifiertypesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<LoginIdentifierTypesResponse<LoginIdentifierType>> {
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Query(() => Number)
  async totalLoginIdentifierTypes(): Promise<number> {
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Query(() => LoginIdentifierTypesResponse<LoginIdentifierType>)
  async searchLoginIdentifierTypes(
    @Args("where", { type: () => LoginIdentifierTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<LoginIdentifierTypesResponse<LoginIdentifierType>> {
    const loginidentifiertypes = await this.service.findAndCount(where);
    return loginidentifiertypes;
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Query(() => LoginIdentifierTypeResponse<LoginIdentifierType>, { nullable: true })
  async findOneLoginIdentifierType(
    @Args("where", { type: () => LoginIdentifierTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType>> {
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
      .registerClient(LoginIdentifierTypeResolver.name)

      .get(LoginIdentifierTypeResolver.name),
    })
  @Query(() => LoginIdentifierTypeResponse<LoginIdentifierType>)
  async findOneLoginIdentifierTypeOrFail(
    @Args("where", { type: () => LoginIdentifierTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<LoginIdentifierTypeResponse<LoginIdentifierType> | Error> {
    return this.service.findOneOrFail(where);
  }
}

