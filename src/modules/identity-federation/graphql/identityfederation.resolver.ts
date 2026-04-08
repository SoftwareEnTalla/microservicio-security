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
import { IdentityFederation } from "../entities/identity-federation.entity";

//Definición de comandos
import {
  CreateIdentityFederationCommand,
  UpdateIdentityFederationCommand,
  DeleteIdentityFederationCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { IdentityFederationQueryService } from "../services/identityfederationquery.service";


import { IdentityFederationResponse, IdentityFederationsResponse } from "../types/identityfederation.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateIdentityFederationDto, 
CreateOrUpdateIdentityFederationDto, 
IdentityFederationValueInput, 
IdentityFederationDto, 
CreateIdentityFederationDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => IdentityFederation)
export class IdentityFederationResolver {

   //Constructor del resolver de IdentityFederation
  constructor(
    private readonly service: IdentityFederationQueryService,
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  // Mutaciones
  @Mutation(() => IdentityFederationResponse<IdentityFederation>)
  async createIdentityFederation(
    @Args("input", { type: () => CreateIdentityFederationDto }) input: CreateIdentityFederationDto
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
    return this.commandBus.execute(new CreateIdentityFederationCommand(input));
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Mutation(() => IdentityFederationResponse<IdentityFederation>)
  async updateIdentityFederation(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateIdentityFederationDto
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateIdentityFederationCommand(payLoad, {
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Mutation(() => IdentityFederationResponse<IdentityFederation>)
  async createOrUpdateIdentityFederation(
    @Args("data", { type: () => CreateOrUpdateIdentityFederationDto })
    data: CreateOrUpdateIdentityFederationDto
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
    if (data.id) {
      const existingIdentityFederation = await this.service.findById(data.id);
      if (existingIdentityFederation) {
        return this.commandBus.execute(
          new UpdateIdentityFederationCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateIdentityFederationDto | UpdateIdentityFederationDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateIdentityFederationCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateIdentityFederationDto | UpdateIdentityFederationDto).createdBy ||
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteIdentityFederation(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteIdentityFederationCommand(id));
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  // Queries
  @Query(() => IdentityFederationsResponse<IdentityFederation>)
  async identityfederations(
    options?: FindManyOptions<IdentityFederation>,
    paginationArgs?: PaginationArgs
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Query(() => IdentityFederationsResponse<IdentityFederation>)
  async identityfederation(
    @Args("id", { type: () => String }) id: string
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Query(() => IdentityFederationsResponse<IdentityFederation>)
  async identityfederationsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => IdentityFederationValueInput }) value: IdentityFederationValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Query(() => IdentityFederationsResponse<IdentityFederation>)
  async identityfederationsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Query(() => Number)
  async totalIdentityFederations(): Promise<number> {
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Query(() => IdentityFederationsResponse<IdentityFederation>)
  async searchIdentityFederations(
    @Args("where", { type: () => IdentityFederationDto, nullable: false })
    where: Record<string, any>
  ): Promise<IdentityFederationsResponse<IdentityFederation>> {
    const identityfederations = await this.service.findAndCount(where);
    return identityfederations;
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Query(() => IdentityFederationResponse<IdentityFederation>, { nullable: true })
  async findOneIdentityFederation(
    @Args("where", { type: () => IdentityFederationDto, nullable: false })
    where: Record<string, any>
  ): Promise<IdentityFederationResponse<IdentityFederation>> {
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
      .registerClient(IdentityFederationResolver.name)

      .get(IdentityFederationResolver.name),
    })
  @Query(() => IdentityFederationResponse<IdentityFederation>)
  async findOneIdentityFederationOrFail(
    @Args("where", { type: () => IdentityFederationDto, nullable: false })
    where: Record<string, any>
  ): Promise<IdentityFederationResponse<IdentityFederation> | Error> {
    return this.service.findOneOrFail(where);
  }
}

