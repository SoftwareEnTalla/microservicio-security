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
import { UserProfile } from "../entities/user-profile.entity";

//Definición de comandos
import {
  CreateUserProfileCommand,
  UpdateUserProfileCommand,
  DeleteUserProfileCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { UserProfileQueryService } from "../services/userprofilequery.service";


import { UserProfileResponse, UserProfilesResponse } from "../types/userprofile.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateUserProfileDto, 
CreateOrUpdateUserProfileDto, 
UserProfileValueInput, 
UserProfileDto, 
CreateUserProfileDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => UserProfile)
export class UserProfileResolver {

   //Constructor del resolver de UserProfile
  constructor(
    private readonly service: UserProfileQueryService,
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  // Mutaciones
  @Mutation(() => UserProfileResponse<UserProfile>)
  async createUserProfile(
    @Args("input", { type: () => CreateUserProfileDto }) input: CreateUserProfileDto
  ): Promise<UserProfileResponse<UserProfile>> {
    return this.commandBus.execute(new CreateUserProfileCommand(input));
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Mutation(() => UserProfileResponse<UserProfile>)
  async updateUserProfile(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateUserProfileDto
  ): Promise<UserProfileResponse<UserProfile>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateUserProfileCommand(payLoad, {
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Mutation(() => UserProfileResponse<UserProfile>)
  async createOrUpdateUserProfile(
    @Args("data", { type: () => CreateOrUpdateUserProfileDto })
    data: CreateOrUpdateUserProfileDto
  ): Promise<UserProfileResponse<UserProfile>> {
    if (data.id) {
      const existingUserProfile = await this.service.findById(data.id);
      if (existingUserProfile) {
        return this.commandBus.execute(
          new UpdateUserProfileCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateUserProfileDto | UpdateUserProfileDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateUserProfileCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateUserProfileDto | UpdateUserProfileDto).createdBy ||
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteUserProfile(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteUserProfileCommand(id));
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  // Queries
  @Query(() => UserProfilesResponse<UserProfile>)
  async userprofiles(
    options?: FindManyOptions<UserProfile>,
    paginationArgs?: PaginationArgs
  ): Promise<UserProfilesResponse<UserProfile>> {
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Query(() => UserProfilesResponse<UserProfile>)
  async userprofile(
    @Args("id", { type: () => String }) id: string
  ): Promise<UserProfileResponse<UserProfile>> {
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Query(() => UserProfilesResponse<UserProfile>)
  async userprofilesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => UserProfileValueInput }) value: UserProfileValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<UserProfilesResponse<UserProfile>> {
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Query(() => UserProfilesResponse<UserProfile>)
  async userprofilesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<UserProfilesResponse<UserProfile>> {
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Query(() => Number)
  async totalUserProfiles(): Promise<number> {
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Query(() => UserProfilesResponse<UserProfile>)
  async searchUserProfiles(
    @Args("where", { type: () => UserProfileDto, nullable: false })
    where: Record<string, any>
  ): Promise<UserProfilesResponse<UserProfile>> {
    const userprofiles = await this.service.findAndCount(where);
    return userprofiles;
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Query(() => UserProfileResponse<UserProfile>, { nullable: true })
  async findOneUserProfile(
    @Args("where", { type: () => UserProfileDto, nullable: false })
    where: Record<string, any>
  ): Promise<UserProfileResponse<UserProfile>> {
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
      .registerClient(UserProfileResolver.name)

      .get(UserProfileResolver.name),
    })
  @Query(() => UserProfileResponse<UserProfile>)
  async findOneUserProfileOrFail(
    @Args("where", { type: () => UserProfileDto, nullable: false })
    where: Record<string, any>
  ): Promise<UserProfileResponse<UserProfile> | Error> {
    return this.service.findOneOrFail(where);
  }
}

