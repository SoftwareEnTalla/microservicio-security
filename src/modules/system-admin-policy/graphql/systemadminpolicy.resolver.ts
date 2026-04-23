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
import { SystemAdminPolicy } from "../entities/system-admin-policy.entity";

//Definición de comandos
import {
  CreateSystemAdminPolicyCommand,
  UpdateSystemAdminPolicyCommand,
  DeleteSystemAdminPolicyCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SystemAdminPolicyQueryService } from "../services/systemadminpolicyquery.service";


import { SystemAdminPolicyResponse, SystemAdminPolicysResponse } from "../types/systemadminpolicy.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSystemAdminPolicyDto, 
CreateOrUpdateSystemAdminPolicyDto, 
SystemAdminPolicyValueInput, 
SystemAdminPolicyDto, 
CreateSystemAdminPolicyDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => SystemAdminPolicy)
export class SystemAdminPolicyResolver {

   //Constructor del resolver de SystemAdminPolicy
  constructor(
    private readonly service: SystemAdminPolicyQueryService,
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  // Mutaciones
  @Mutation(() => SystemAdminPolicyResponse<SystemAdminPolicy>)
  async createSystemAdminPolicy(
    @Args("input", { type: () => CreateSystemAdminPolicyDto }) input: CreateSystemAdminPolicyDto
  ): Promise<SystemAdminPolicyResponse<SystemAdminPolicy>> {
    return this.commandBus.execute(new CreateSystemAdminPolicyCommand(input));
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Mutation(() => SystemAdminPolicyResponse<SystemAdminPolicy>)
  async updateSystemAdminPolicy(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSystemAdminPolicyDto
  ): Promise<SystemAdminPolicyResponse<SystemAdminPolicy>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSystemAdminPolicyCommand(payLoad, {
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Mutation(() => SystemAdminPolicyResponse<SystemAdminPolicy>)
  async createOrUpdateSystemAdminPolicy(
    @Args("data", { type: () => CreateOrUpdateSystemAdminPolicyDto })
    data: CreateOrUpdateSystemAdminPolicyDto
  ): Promise<SystemAdminPolicyResponse<SystemAdminPolicy>> {
    if (data.id) {
      const existingSystemAdminPolicy = await this.service.findById(data.id);
      if (existingSystemAdminPolicy) {
        return this.commandBus.execute(
          new UpdateSystemAdminPolicyCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSystemAdminPolicyDto | UpdateSystemAdminPolicyDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSystemAdminPolicyCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSystemAdminPolicyDto | UpdateSystemAdminPolicyDto).createdBy ||
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSystemAdminPolicy(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSystemAdminPolicyCommand(id));
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  // Queries
  @Query(() => SystemAdminPolicysResponse<SystemAdminPolicy>)
  async systemadminpolicys(
    options?: FindManyOptions<SystemAdminPolicy>,
    paginationArgs?: PaginationArgs
  ): Promise<SystemAdminPolicysResponse<SystemAdminPolicy>> {
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Query(() => SystemAdminPolicysResponse<SystemAdminPolicy>)
  async systemadminpolicy(
    @Args("id", { type: () => String }) id: string
  ): Promise<SystemAdminPolicyResponse<SystemAdminPolicy>> {
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Query(() => SystemAdminPolicysResponse<SystemAdminPolicy>)
  async systemadminpolicysByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SystemAdminPolicyValueInput }) value: SystemAdminPolicyValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SystemAdminPolicysResponse<SystemAdminPolicy>> {
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Query(() => SystemAdminPolicysResponse<SystemAdminPolicy>)
  async systemadminpolicysWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SystemAdminPolicysResponse<SystemAdminPolicy>> {
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Query(() => Number)
  async totalSystemAdminPolicys(): Promise<number> {
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Query(() => SystemAdminPolicysResponse<SystemAdminPolicy>)
  async searchSystemAdminPolicys(
    @Args("where", { type: () => SystemAdminPolicyDto, nullable: false })
    where: Record<string, any>
  ): Promise<SystemAdminPolicysResponse<SystemAdminPolicy>> {
    const systemadminpolicys = await this.service.findAndCount(where);
    return systemadminpolicys;
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Query(() => SystemAdminPolicyResponse<SystemAdminPolicy>, { nullable: true })
  async findOneSystemAdminPolicy(
    @Args("where", { type: () => SystemAdminPolicyDto, nullable: false })
    where: Record<string, any>
  ): Promise<SystemAdminPolicyResponse<SystemAdminPolicy>> {
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
      .registerClient(SystemAdminPolicyResolver.name)

      .get(SystemAdminPolicyResolver.name),
    })
  @Query(() => SystemAdminPolicyResponse<SystemAdminPolicy>)
  async findOneSystemAdminPolicyOrFail(
    @Args("where", { type: () => SystemAdminPolicyDto, nullable: false })
    where: Record<string, any>
  ): Promise<SystemAdminPolicyResponse<SystemAdminPolicy> | Error> {
    return this.service.findOneOrFail(where);
  }
}

