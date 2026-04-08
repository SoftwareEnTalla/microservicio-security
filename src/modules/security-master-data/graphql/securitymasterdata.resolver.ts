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
import { SecurityMasterData } from "../entities/security-master-data.entity";

//Definición de comandos
import {
  CreateSecurityMasterDataCommand,
  UpdateSecurityMasterDataCommand,
  DeleteSecurityMasterDataCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SecurityMasterDataQueryService } from "../services/securitymasterdataquery.service";


import { SecurityMasterDataResponse, SecurityMasterDatasResponse } from "../types/securitymasterdata.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSecurityMasterDataDto, 
CreateOrUpdateSecurityMasterDataDto, 
SecurityMasterDataValueInput, 
SecurityMasterDataDto, 
CreateSecurityMasterDataDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => SecurityMasterData)
export class SecurityMasterDataResolver {

   //Constructor del resolver de SecurityMasterData
  constructor(
    private readonly service: SecurityMasterDataQueryService,
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  // Mutaciones
  @Mutation(() => SecurityMasterDataResponse<SecurityMasterData>)
  async createSecurityMasterData(
    @Args("input", { type: () => CreateSecurityMasterDataDto }) input: CreateSecurityMasterDataDto
  ): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
    return this.commandBus.execute(new CreateSecurityMasterDataCommand(input));
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Mutation(() => SecurityMasterDataResponse<SecurityMasterData>)
  async updateSecurityMasterData(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSecurityMasterDataDto
  ): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSecurityMasterDataCommand(payLoad, {
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Mutation(() => SecurityMasterDataResponse<SecurityMasterData>)
  async createOrUpdateSecurityMasterData(
    @Args("data", { type: () => CreateOrUpdateSecurityMasterDataDto })
    data: CreateOrUpdateSecurityMasterDataDto
  ): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
    if (data.id) {
      const existingSecurityMasterData = await this.service.findById(data.id);
      if (existingSecurityMasterData) {
        return this.commandBus.execute(
          new UpdateSecurityMasterDataCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSecurityMasterDataDto | UpdateSecurityMasterDataDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSecurityMasterDataCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSecurityMasterDataDto | UpdateSecurityMasterDataDto).createdBy ||
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSecurityMasterData(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSecurityMasterDataCommand(id));
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  // Queries
  @Query(() => SecurityMasterDatasResponse<SecurityMasterData>)
  async securitymasterdatas(
    options?: FindManyOptions<SecurityMasterData>,
    paginationArgs?: PaginationArgs
  ): Promise<SecurityMasterDatasResponse<SecurityMasterData>> {
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Query(() => SecurityMasterDatasResponse<SecurityMasterData>)
  async securitymasterdata(
    @Args("id", { type: () => String }) id: string
  ): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Query(() => SecurityMasterDatasResponse<SecurityMasterData>)
  async securitymasterdatasByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SecurityMasterDataValueInput }) value: SecurityMasterDataValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecurityMasterDatasResponse<SecurityMasterData>> {
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Query(() => SecurityMasterDatasResponse<SecurityMasterData>)
  async securitymasterdatasWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecurityMasterDatasResponse<SecurityMasterData>> {
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Query(() => Number)
  async totalSecurityMasterDatas(): Promise<number> {
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Query(() => SecurityMasterDatasResponse<SecurityMasterData>)
  async searchSecurityMasterDatas(
    @Args("where", { type: () => SecurityMasterDataDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityMasterDatasResponse<SecurityMasterData>> {
    const securitymasterdatas = await this.service.findAndCount(where);
    return securitymasterdatas;
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Query(() => SecurityMasterDataResponse<SecurityMasterData>, { nullable: true })
  async findOneSecurityMasterData(
    @Args("where", { type: () => SecurityMasterDataDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityMasterDataResponse<SecurityMasterData>> {
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
      .registerClient(SecurityMasterDataResolver.name)

      .get(SecurityMasterDataResolver.name),
    })
  @Query(() => SecurityMasterDataResponse<SecurityMasterData>)
  async findOneSecurityMasterDataOrFail(
    @Args("where", { type: () => SecurityMasterDataDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityMasterDataResponse<SecurityMasterData> | Error> {
    return this.service.findOneOrFail(where);
  }
}

