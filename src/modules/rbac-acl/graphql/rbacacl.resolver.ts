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
import { RbacAcl } from "../entities/rbac-acl.entity";

//Definición de comandos
import {
  CreateRbacAclCommand,
  UpdateRbacAclCommand,
  DeleteRbacAclCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { RbacAclQueryService } from "../services/rbacaclquery.service";


import { RbacAclResponse, RbacAclsResponse } from "../types/rbacacl.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateRbacAclDto, 
CreateOrUpdateRbacAclDto, 
RbacAclValueInput, 
RbacAclDto, 
CreateRbacAclDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => RbacAcl)
export class RbacAclResolver {

   //Constructor del resolver de RbacAcl
  constructor(
    private readonly service: RbacAclQueryService,
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  // Mutaciones
  @Mutation(() => RbacAclResponse<RbacAcl>)
  async createRbacAcl(
    @Args("input", { type: () => CreateRbacAclDto }) input: CreateRbacAclDto
  ): Promise<RbacAclResponse<RbacAcl>> {
    return this.commandBus.execute(new CreateRbacAclCommand(input));
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Mutation(() => RbacAclResponse<RbacAcl>)
  async updateRbacAcl(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateRbacAclDto
  ): Promise<RbacAclResponse<RbacAcl>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateRbacAclCommand(payLoad, {
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Mutation(() => RbacAclResponse<RbacAcl>)
  async createOrUpdateRbacAcl(
    @Args("data", { type: () => CreateOrUpdateRbacAclDto })
    data: CreateOrUpdateRbacAclDto
  ): Promise<RbacAclResponse<RbacAcl>> {
    if (data.id) {
      const existingRbacAcl = await this.service.findById(data.id);
      if (existingRbacAcl) {
        return this.commandBus.execute(
          new UpdateRbacAclCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateRbacAclDto | UpdateRbacAclDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateRbacAclCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateRbacAclDto | UpdateRbacAclDto).createdBy ||
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteRbacAcl(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteRbacAclCommand(id));
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  // Queries
  @Query(() => RbacAclsResponse<RbacAcl>)
  async rbacacls(
    options?: FindManyOptions<RbacAcl>,
    paginationArgs?: PaginationArgs
  ): Promise<RbacAclsResponse<RbacAcl>> {
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Query(() => RbacAclsResponse<RbacAcl>)
  async rbacacl(
    @Args("id", { type: () => String }) id: string
  ): Promise<RbacAclResponse<RbacAcl>> {
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Query(() => RbacAclsResponse<RbacAcl>)
  async rbacaclsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => RbacAclValueInput }) value: RbacAclValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<RbacAclsResponse<RbacAcl>> {
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Query(() => RbacAclsResponse<RbacAcl>)
  async rbacaclsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<RbacAclsResponse<RbacAcl>> {
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Query(() => Number)
  async totalRbacAcls(): Promise<number> {
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Query(() => RbacAclsResponse<RbacAcl>)
  async searchRbacAcls(
    @Args("where", { type: () => RbacAclDto, nullable: false })
    where: Record<string, any>
  ): Promise<RbacAclsResponse<RbacAcl>> {
    const rbacacls = await this.service.findAndCount(where);
    return rbacacls;
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Query(() => RbacAclResponse<RbacAcl>, { nullable: true })
  async findOneRbacAcl(
    @Args("where", { type: () => RbacAclDto, nullable: false })
    where: Record<string, any>
  ): Promise<RbacAclResponse<RbacAcl>> {
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
      .registerClient(RbacAclResolver.name)

      .get(RbacAclResolver.name),
    })
  @Query(() => RbacAclResponse<RbacAcl>)
  async findOneRbacAclOrFail(
    @Args("where", { type: () => RbacAclDto, nullable: false })
    where: Record<string, any>
  ): Promise<RbacAclResponse<RbacAcl> | Error> {
    return this.service.findOneOrFail(where);
  }
}

