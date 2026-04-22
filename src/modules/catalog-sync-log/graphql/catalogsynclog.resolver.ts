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
import { CatalogSyncLog } from "../entities/catalog-sync-log.entity";

//Definición de comandos
import {
  CreateCatalogSyncLogCommand,
  UpdateCatalogSyncLogCommand,
  DeleteCatalogSyncLogCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { CatalogSyncLogQueryService } from "../services/catalogsynclogquery.service";


import { CatalogSyncLogResponse, CatalogSyncLogsResponse } from "../types/catalogsynclog.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateCatalogSyncLogDto, 
CreateOrUpdateCatalogSyncLogDto, 
CatalogSyncLogValueInput, 
CatalogSyncLogDto, 
CreateCatalogSyncLogDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => CatalogSyncLog)
export class CatalogSyncLogResolver {

   //Constructor del resolver de CatalogSyncLog
  constructor(
    private readonly service: CatalogSyncLogQueryService,
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  // Mutaciones
  @Mutation(() => CatalogSyncLogResponse<CatalogSyncLog>)
  async createCatalogSyncLog(
    @Args("input", { type: () => CreateCatalogSyncLogDto }) input: CreateCatalogSyncLogDto
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
    return this.commandBus.execute(new CreateCatalogSyncLogCommand(input));
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Mutation(() => CatalogSyncLogResponse<CatalogSyncLog>)
  async updateCatalogSyncLog(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateCatalogSyncLogDto
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateCatalogSyncLogCommand(payLoad, {
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Mutation(() => CatalogSyncLogResponse<CatalogSyncLog>)
  async createOrUpdateCatalogSyncLog(
    @Args("data", { type: () => CreateOrUpdateCatalogSyncLogDto })
    data: CreateOrUpdateCatalogSyncLogDto
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
    if (data.id) {
      const existingCatalogSyncLog = await this.service.findById(data.id);
      if (existingCatalogSyncLog) {
        return this.commandBus.execute(
          new UpdateCatalogSyncLogCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateCatalogSyncLogDto | UpdateCatalogSyncLogDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateCatalogSyncLogCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateCatalogSyncLogDto | UpdateCatalogSyncLogDto).createdBy ||
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteCatalogSyncLog(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteCatalogSyncLogCommand(id));
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  // Queries
  @Query(() => CatalogSyncLogsResponse<CatalogSyncLog>)
  async catalogsynclogs(
    options?: FindManyOptions<CatalogSyncLog>,
    paginationArgs?: PaginationArgs
  ): Promise<CatalogSyncLogsResponse<CatalogSyncLog>> {
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Query(() => CatalogSyncLogsResponse<CatalogSyncLog>)
  async catalogsynclog(
    @Args("id", { type: () => String }) id: string
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Query(() => CatalogSyncLogsResponse<CatalogSyncLog>)
  async catalogsynclogsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => CatalogSyncLogValueInput }) value: CatalogSyncLogValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CatalogSyncLogsResponse<CatalogSyncLog>> {
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Query(() => CatalogSyncLogsResponse<CatalogSyncLog>)
  async catalogsynclogsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CatalogSyncLogsResponse<CatalogSyncLog>> {
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Query(() => Number)
  async totalCatalogSyncLogs(): Promise<number> {
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Query(() => CatalogSyncLogsResponse<CatalogSyncLog>)
  async searchCatalogSyncLogs(
    @Args("where", { type: () => CatalogSyncLogDto, nullable: false })
    where: Record<string, any>
  ): Promise<CatalogSyncLogsResponse<CatalogSyncLog>> {
    const catalogsynclogs = await this.service.findAndCount(where);
    return catalogsynclogs;
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Query(() => CatalogSyncLogResponse<CatalogSyncLog>, { nullable: true })
  async findOneCatalogSyncLog(
    @Args("where", { type: () => CatalogSyncLogDto, nullable: false })
    where: Record<string, any>
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog>> {
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
      .registerClient(CatalogSyncLogResolver.name)

      .get(CatalogSyncLogResolver.name),
    })
  @Query(() => CatalogSyncLogResponse<CatalogSyncLog>)
  async findOneCatalogSyncLogOrFail(
    @Args("where", { type: () => CatalogSyncLogDto, nullable: false })
    where: Record<string, any>
  ): Promise<CatalogSyncLogResponse<CatalogSyncLog> | Error> {
    return this.service.findOneOrFail(where);
  }
}

