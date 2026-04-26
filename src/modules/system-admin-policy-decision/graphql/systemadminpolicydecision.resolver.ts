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
import { SystemAdminPolicyDecision } from "../entities/system-admin-policy-decision.entity";

//Definición de comandos
import {
  CreateSystemAdminPolicyDecisionCommand,
  UpdateSystemAdminPolicyDecisionCommand,
  DeleteSystemAdminPolicyDecisionCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SystemAdminPolicyDecisionQueryService } from "../services/systemadminpolicydecisionquery.service";


import { SystemAdminPolicyDecisionResponse, SystemAdminPolicyDecisionsResponse } from "../types/systemadminpolicydecision.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSystemAdminPolicyDecisionDto, 
CreateOrUpdateSystemAdminPolicyDecisionDto, 
SystemAdminPolicyDecisionValueInput, 
SystemAdminPolicyDecisionDto, 
CreateSystemAdminPolicyDecisionDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => SystemAdminPolicyDecision)
export class SystemAdminPolicyDecisionResolver {

   //Constructor del resolver de SystemAdminPolicyDecision
  constructor(
    private readonly service: SystemAdminPolicyDecisionQueryService,
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  // Mutaciones
  @Mutation(() => SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>)
  async createSystemAdminPolicyDecision(
    @Args("input", { type: () => CreateSystemAdminPolicyDecisionDto }) input: CreateSystemAdminPolicyDecisionDto
  ): Promise<SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>> {
    return this.commandBus.execute(new CreateSystemAdminPolicyDecisionCommand(input));
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Mutation(() => SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>)
  async updateSystemAdminPolicyDecision(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSystemAdminPolicyDecisionDto
  ): Promise<SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSystemAdminPolicyDecisionCommand(payLoad, {
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Mutation(() => SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>)
  async createOrUpdateSystemAdminPolicyDecision(
    @Args("data", { type: () => CreateOrUpdateSystemAdminPolicyDecisionDto })
    data: CreateOrUpdateSystemAdminPolicyDecisionDto
  ): Promise<SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>> {
    if (data.id) {
      const existingSystemAdminPolicyDecision = await this.service.findById(data.id);
      if (existingSystemAdminPolicyDecision) {
        return this.commandBus.execute(
          new UpdateSystemAdminPolicyDecisionCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSystemAdminPolicyDecisionDto | UpdateSystemAdminPolicyDecisionDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSystemAdminPolicyDecisionCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSystemAdminPolicyDecisionDto | UpdateSystemAdminPolicyDecisionDto).createdBy ||
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSystemAdminPolicyDecision(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSystemAdminPolicyDecisionCommand(id));
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  // Queries
  @Query(() => SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>)
  async systemadminpolicydecisions(
    options?: FindManyOptions<SystemAdminPolicyDecision>,
    paginationArgs?: PaginationArgs
  ): Promise<SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>> {
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Query(() => SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>)
  async systemadminpolicydecision(
    @Args("id", { type: () => String }) id: string
  ): Promise<SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>> {
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Query(() => SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>)
  async systemadminpolicydecisionsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SystemAdminPolicyDecisionValueInput }) value: SystemAdminPolicyDecisionValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>> {
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Query(() => SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>)
  async systemadminpolicydecisionsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>> {
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Query(() => Number)
  async totalSystemAdminPolicyDecisions(): Promise<number> {
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Query(() => SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>)
  async searchSystemAdminPolicyDecisions(
    @Args("where", { type: () => SystemAdminPolicyDecisionDto, nullable: false })
    where: Record<string, any>
  ): Promise<SystemAdminPolicyDecisionsResponse<SystemAdminPolicyDecision>> {
    const systemadminpolicydecisions = await this.service.findAndCount(where);
    return systemadminpolicydecisions;
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Query(() => SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>, { nullable: true })
  async findOneSystemAdminPolicyDecision(
    @Args("where", { type: () => SystemAdminPolicyDecisionDto, nullable: false })
    where: Record<string, any>
  ): Promise<SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>> {
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
      .registerClient(SystemAdminPolicyDecisionResolver.name)

      .get(SystemAdminPolicyDecisionResolver.name),
    })
  @Query(() => SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision>)
  async findOneSystemAdminPolicyDecisionOrFail(
    @Args("where", { type: () => SystemAdminPolicyDecisionDto, nullable: false })
    where: Record<string, any>
  ): Promise<SystemAdminPolicyDecisionResponse<SystemAdminPolicyDecision> | Error> {
    return this.service.findOneOrFail(where);
  }
}

