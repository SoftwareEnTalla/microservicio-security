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
import { DeliveryMode } from "../entities/delivery-mode.entity";

//Definición de comandos
import {
  CreateDeliveryModeCommand,
  UpdateDeliveryModeCommand,
  DeleteDeliveryModeCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { DeliveryModeQueryService } from "../services/deliverymodequery.service";


import { DeliveryModeResponse, DeliveryModesResponse } from "../types/deliverymode.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateDeliveryModeDto, 
CreateOrUpdateDeliveryModeDto, 
DeliveryModeValueInput, 
DeliveryModeDto, 
CreateDeliveryModeDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => DeliveryMode)
export class DeliveryModeResolver {

   //Constructor del resolver de DeliveryMode
  constructor(
    private readonly service: DeliveryModeQueryService,
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  // Mutaciones
  @Mutation(() => DeliveryModeResponse<DeliveryMode>)
  async createDeliveryMode(
    @Args("input", { type: () => CreateDeliveryModeDto }) input: CreateDeliveryModeDto
  ): Promise<DeliveryModeResponse<DeliveryMode>> {
    return this.commandBus.execute(new CreateDeliveryModeCommand(input));
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Mutation(() => DeliveryModeResponse<DeliveryMode>)
  async updateDeliveryMode(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateDeliveryModeDto
  ): Promise<DeliveryModeResponse<DeliveryMode>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateDeliveryModeCommand(payLoad, {
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Mutation(() => DeliveryModeResponse<DeliveryMode>)
  async createOrUpdateDeliveryMode(
    @Args("data", { type: () => CreateOrUpdateDeliveryModeDto })
    data: CreateOrUpdateDeliveryModeDto
  ): Promise<DeliveryModeResponse<DeliveryMode>> {
    if (data.id) {
      const existingDeliveryMode = await this.service.findById(data.id);
      if (existingDeliveryMode) {
        return this.commandBus.execute(
          new UpdateDeliveryModeCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateDeliveryModeDto | UpdateDeliveryModeDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateDeliveryModeCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateDeliveryModeDto | UpdateDeliveryModeDto).createdBy ||
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteDeliveryMode(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteDeliveryModeCommand(id));
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  // Queries
  @Query(() => DeliveryModesResponse<DeliveryMode>)
  async deliverymodes(
    options?: FindManyOptions<DeliveryMode>,
    paginationArgs?: PaginationArgs
  ): Promise<DeliveryModesResponse<DeliveryMode>> {
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Query(() => DeliveryModesResponse<DeliveryMode>)
  async deliverymode(
    @Args("id", { type: () => String }) id: string
  ): Promise<DeliveryModeResponse<DeliveryMode>> {
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Query(() => DeliveryModesResponse<DeliveryMode>)
  async deliverymodesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => DeliveryModeValueInput }) value: DeliveryModeValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<DeliveryModesResponse<DeliveryMode>> {
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Query(() => DeliveryModesResponse<DeliveryMode>)
  async deliverymodesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<DeliveryModesResponse<DeliveryMode>> {
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Query(() => Number)
  async totalDeliveryModes(): Promise<number> {
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Query(() => DeliveryModesResponse<DeliveryMode>)
  async searchDeliveryModes(
    @Args("where", { type: () => DeliveryModeDto, nullable: false })
    where: Record<string, any>
  ): Promise<DeliveryModesResponse<DeliveryMode>> {
    const deliverymodes = await this.service.findAndCount(where);
    return deliverymodes;
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Query(() => DeliveryModeResponse<DeliveryMode>, { nullable: true })
  async findOneDeliveryMode(
    @Args("where", { type: () => DeliveryModeDto, nullable: false })
    where: Record<string, any>
  ): Promise<DeliveryModeResponse<DeliveryMode>> {
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
      .registerClient(DeliveryModeResolver.name)

      .get(DeliveryModeResolver.name),
    })
  @Query(() => DeliveryModeResponse<DeliveryMode>)
  async findOneDeliveryModeOrFail(
    @Args("where", { type: () => DeliveryModeDto, nullable: false })
    where: Record<string, any>
  ): Promise<DeliveryModeResponse<DeliveryMode> | Error> {
    return this.service.findOneOrFail(where);
  }
}

