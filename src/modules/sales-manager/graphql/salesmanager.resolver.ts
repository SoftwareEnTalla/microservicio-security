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
import { SalesManager } from "../entities/sales-manager.entity";

//Definición de comandos
import {
  CreateSalesManagerCommand,
  UpdateSalesManagerCommand,
  DeleteSalesManagerCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SalesManagerQueryService } from "../services/salesmanagerquery.service";


import { SalesManagerResponse, SalesManagersResponse } from "../types/salesmanager.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSalesManagerDto, 
CreateOrUpdateSalesManagerDto, 
SalesManagerValueInput, 
SalesManagerDto, 
CreateSalesManagerDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => SalesManager)
export class SalesManagerResolver {

   //Constructor del resolver de SalesManager
  constructor(
    private readonly service: SalesManagerQueryService,
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  // Mutaciones
  @Mutation(() => SalesManagerResponse<SalesManager>)
  async createSalesManager(
    @Args("input", { type: () => CreateSalesManagerDto }) input: CreateSalesManagerDto
  ): Promise<SalesManagerResponse<SalesManager>> {
    return this.commandBus.execute(new CreateSalesManagerCommand(input));
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Mutation(() => SalesManagerResponse<SalesManager>)
  async updateSalesManager(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSalesManagerDto
  ): Promise<SalesManagerResponse<SalesManager>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSalesManagerCommand(payLoad, {
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Mutation(() => SalesManagerResponse<SalesManager>)
  async createOrUpdateSalesManager(
    @Args("data", { type: () => CreateOrUpdateSalesManagerDto })
    data: CreateOrUpdateSalesManagerDto
  ): Promise<SalesManagerResponse<SalesManager>> {
    if (data.id) {
      const existingSalesManager = await this.service.findById(data.id);
      if (existingSalesManager) {
        return this.commandBus.execute(
          new UpdateSalesManagerCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSalesManagerDto | UpdateSalesManagerDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSalesManagerCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSalesManagerDto | UpdateSalesManagerDto).createdBy ||
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSalesManager(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSalesManagerCommand(id));
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  // Queries
  @Query(() => SalesManagersResponse<SalesManager>)
  async salesmanagers(
    options?: FindManyOptions<SalesManager>,
    paginationArgs?: PaginationArgs
  ): Promise<SalesManagersResponse<SalesManager>> {
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Query(() => SalesManagersResponse<SalesManager>)
  async salesmanager(
    @Args("id", { type: () => String }) id: string
  ): Promise<SalesManagerResponse<SalesManager>> {
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Query(() => SalesManagersResponse<SalesManager>)
  async salesmanagersByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SalesManagerValueInput }) value: SalesManagerValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SalesManagersResponse<SalesManager>> {
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Query(() => SalesManagersResponse<SalesManager>)
  async salesmanagersWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SalesManagersResponse<SalesManager>> {
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Query(() => Number)
  async totalSalesManagers(): Promise<number> {
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Query(() => SalesManagersResponse<SalesManager>)
  async searchSalesManagers(
    @Args("where", { type: () => SalesManagerDto, nullable: false })
    where: Record<string, any>
  ): Promise<SalesManagersResponse<SalesManager>> {
    const salesmanagers = await this.service.findAndCount(where);
    return salesmanagers;
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Query(() => SalesManagerResponse<SalesManager>, { nullable: true })
  async findOneSalesManager(
    @Args("where", { type: () => SalesManagerDto, nullable: false })
    where: Record<string, any>
  ): Promise<SalesManagerResponse<SalesManager>> {
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
      .registerClient(SalesManagerResolver.name)

      .get(SalesManagerResolver.name),
    })
  @Query(() => SalesManagerResponse<SalesManager>)
  async findOneSalesManagerOrFail(
    @Args("where", { type: () => SalesManagerDto, nullable: false })
    where: Record<string, any>
  ): Promise<SalesManagerResponse<SalesManager> | Error> {
    return this.service.findOneOrFail(where);
  }
}

