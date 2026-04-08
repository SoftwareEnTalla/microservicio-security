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
import { MfaTotp } from "../entities/mfa-totp.entity";

//Definición de comandos
import {
  CreateMfaTotpCommand,
  UpdateMfaTotpCommand,
  DeleteMfaTotpCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { MfaTotpQueryService } from "../services/mfatotpquery.service";


import { MfaTotpResponse, MfaTotpsResponse } from "../types/mfatotp.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateMfaTotpDto, 
CreateOrUpdateMfaTotpDto, 
MfaTotpValueInput, 
MfaTotpDto, 
CreateMfaTotpDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => MfaTotp)
export class MfaTotpResolver {

   //Constructor del resolver de MfaTotp
  constructor(
    private readonly service: MfaTotpQueryService,
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  // Mutaciones
  @Mutation(() => MfaTotpResponse<MfaTotp>)
  async createMfaTotp(
    @Args("input", { type: () => CreateMfaTotpDto }) input: CreateMfaTotpDto
  ): Promise<MfaTotpResponse<MfaTotp>> {
    return this.commandBus.execute(new CreateMfaTotpCommand(input));
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Mutation(() => MfaTotpResponse<MfaTotp>)
  async updateMfaTotp(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateMfaTotpDto
  ): Promise<MfaTotpResponse<MfaTotp>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateMfaTotpCommand(payLoad, {
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Mutation(() => MfaTotpResponse<MfaTotp>)
  async createOrUpdateMfaTotp(
    @Args("data", { type: () => CreateOrUpdateMfaTotpDto })
    data: CreateOrUpdateMfaTotpDto
  ): Promise<MfaTotpResponse<MfaTotp>> {
    if (data.id) {
      const existingMfaTotp = await this.service.findById(data.id);
      if (existingMfaTotp) {
        return this.commandBus.execute(
          new UpdateMfaTotpCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateMfaTotpDto | UpdateMfaTotpDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateMfaTotpCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateMfaTotpDto | UpdateMfaTotpDto).createdBy ||
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteMfaTotp(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteMfaTotpCommand(id));
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  // Queries
  @Query(() => MfaTotpsResponse<MfaTotp>)
  async mfatotps(
    options?: FindManyOptions<MfaTotp>,
    paginationArgs?: PaginationArgs
  ): Promise<MfaTotpsResponse<MfaTotp>> {
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Query(() => MfaTotpsResponse<MfaTotp>)
  async mfatotp(
    @Args("id", { type: () => String }) id: string
  ): Promise<MfaTotpResponse<MfaTotp>> {
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Query(() => MfaTotpsResponse<MfaTotp>)
  async mfatotpsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => MfaTotpValueInput }) value: MfaTotpValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<MfaTotpsResponse<MfaTotp>> {
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Query(() => MfaTotpsResponse<MfaTotp>)
  async mfatotpsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<MfaTotpsResponse<MfaTotp>> {
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Query(() => Number)
  async totalMfaTotps(): Promise<number> {
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Query(() => MfaTotpsResponse<MfaTotp>)
  async searchMfaTotps(
    @Args("where", { type: () => MfaTotpDto, nullable: false })
    where: Record<string, any>
  ): Promise<MfaTotpsResponse<MfaTotp>> {
    const mfatotps = await this.service.findAndCount(where);
    return mfatotps;
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Query(() => MfaTotpResponse<MfaTotp>, { nullable: true })
  async findOneMfaTotp(
    @Args("where", { type: () => MfaTotpDto, nullable: false })
    where: Record<string, any>
  ): Promise<MfaTotpResponse<MfaTotp>> {
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
      .registerClient(MfaTotpResolver.name)

      .get(MfaTotpResolver.name),
    })
  @Query(() => MfaTotpResponse<MfaTotp>)
  async findOneMfaTotpOrFail(
    @Args("where", { type: () => MfaTotpDto, nullable: false })
    where: Record<string, any>
  ): Promise<MfaTotpResponse<MfaTotp> | Error> {
    return this.service.findOneOrFail(where);
  }
}

