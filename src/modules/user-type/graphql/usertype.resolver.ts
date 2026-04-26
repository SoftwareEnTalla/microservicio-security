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
import { UserType } from "../entities/user-type.entity";

//Definición de comandos
import {
  CreateUserTypeCommand,
  UpdateUserTypeCommand,
  DeleteUserTypeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { UserTypeQueryService } from "../services/usertypequery.service";


import { UserTypeResponse, UserTypesResponse } from "../types/usertype.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateUserTypeDto, 
CreateOrUpdateUserTypeDto, 
UserTypeValueInput, 
UserTypeDto, 
CreateUserTypeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => UserType)
export class UserTypeResolver {

   //Constructor del resolver de UserType
  constructor(
    private readonly service: UserTypeQueryService,
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  // Mutaciones
  @Mutation(() => UserTypeResponse<UserType>)
  async createUserType(
    @Args("input", { type: () => CreateUserTypeDto }) input: CreateUserTypeDto
  ): Promise<UserTypeResponse<UserType>> {
    return this.commandBus.execute(new CreateUserTypeCommand(input));
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Mutation(() => UserTypeResponse<UserType>)
  async updateUserType(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateUserTypeDto
  ): Promise<UserTypeResponse<UserType>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateUserTypeCommand(payLoad, {
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Mutation(() => UserTypeResponse<UserType>)
  async createOrUpdateUserType(
    @Args("data", { type: () => CreateOrUpdateUserTypeDto })
    data: CreateOrUpdateUserTypeDto
  ): Promise<UserTypeResponse<UserType>> {
    if (data.id) {
      const existingUserType = await this.service.findById(data.id);
      if (existingUserType) {
        return this.commandBus.execute(
          new UpdateUserTypeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateUserTypeDto | UpdateUserTypeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateUserTypeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateUserTypeDto | UpdateUserTypeDto).createdBy ||
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteUserType(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteUserTypeCommand(id));
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  // Queries
  @Query(() => UserTypesResponse<UserType>)
  async usertypes(
    options?: FindManyOptions<UserType>,
    paginationArgs?: PaginationArgs
  ): Promise<UserTypesResponse<UserType>> {
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Query(() => UserTypesResponse<UserType>)
  async usertype(
    @Args("id", { type: () => String }) id: string
  ): Promise<UserTypeResponse<UserType>> {
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Query(() => UserTypesResponse<UserType>)
  async usertypesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => UserTypeValueInput }) value: UserTypeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<UserTypesResponse<UserType>> {
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Query(() => UserTypesResponse<UserType>)
  async usertypesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<UserTypesResponse<UserType>> {
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Query(() => Number)
  async totalUserTypes(): Promise<number> {
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Query(() => UserTypesResponse<UserType>)
  async searchUserTypes(
    @Args("where", { type: () => UserTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<UserTypesResponse<UserType>> {
    const usertypes = await this.service.findAndCount(where);
    return usertypes;
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Query(() => UserTypeResponse<UserType>, { nullable: true })
  async findOneUserType(
    @Args("where", { type: () => UserTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<UserTypeResponse<UserType>> {
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
      .registerClient(UserTypeResolver.name)

      .get(UserTypeResolver.name),
    })
  @Query(() => UserTypeResponse<UserType>)
  async findOneUserTypeOrFail(
    @Args("where", { type: () => UserTypeDto, nullable: false })
    where: Record<string, any>
  ): Promise<UserTypeResponse<UserType> | Error> {
    return this.service.findOneOrFail(where);
  }
}

