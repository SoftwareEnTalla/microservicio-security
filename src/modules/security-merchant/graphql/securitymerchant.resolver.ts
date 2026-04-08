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
import { SecurityMerchant } from "../entities/security-merchant.entity";

//Definición de comandos
import {
  CreateSecurityMerchantCommand,
  UpdateSecurityMerchantCommand,
  DeleteSecurityMerchantCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SecurityMerchantQueryService } from "../services/securitymerchantquery.service";


import { SecurityMerchantResponse, SecurityMerchantsResponse } from "../types/securitymerchant.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSecurityMerchantDto, 
CreateOrUpdateSecurityMerchantDto, 
SecurityMerchantValueInput, 
SecurityMerchantDto, 
CreateSecurityMerchantDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => SecurityMerchant)
export class SecurityMerchantResolver {

   //Constructor del resolver de SecurityMerchant
  constructor(
    private readonly service: SecurityMerchantQueryService,
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  // Mutaciones
  @Mutation(() => SecurityMerchantResponse<SecurityMerchant>)
  async createSecurityMerchant(
    @Args("input", { type: () => CreateSecurityMerchantDto }) input: CreateSecurityMerchantDto
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    return this.commandBus.execute(new CreateSecurityMerchantCommand(input));
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Mutation(() => SecurityMerchantResponse<SecurityMerchant>)
  async updateSecurityMerchant(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSecurityMerchantDto
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSecurityMerchantCommand(payLoad, {
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Mutation(() => SecurityMerchantResponse<SecurityMerchant>)
  async createOrUpdateSecurityMerchant(
    @Args("data", { type: () => CreateOrUpdateSecurityMerchantDto })
    data: CreateOrUpdateSecurityMerchantDto
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
    if (data.id) {
      const existingSecurityMerchant = await this.service.findById(data.id);
      if (existingSecurityMerchant) {
        return this.commandBus.execute(
          new UpdateSecurityMerchantCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSecurityMerchantDto | UpdateSecurityMerchantDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSecurityMerchantCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSecurityMerchantDto | UpdateSecurityMerchantDto).createdBy ||
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSecurityMerchant(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSecurityMerchantCommand(id));
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  // Queries
  @Query(() => SecurityMerchantsResponse<SecurityMerchant>)
  async securitymerchants(
    options?: FindManyOptions<SecurityMerchant>,
    paginationArgs?: PaginationArgs
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Query(() => SecurityMerchantsResponse<SecurityMerchant>)
  async securitymerchant(
    @Args("id", { type: () => String }) id: string
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Query(() => SecurityMerchantsResponse<SecurityMerchant>)
  async securitymerchantsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SecurityMerchantValueInput }) value: SecurityMerchantValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Query(() => SecurityMerchantsResponse<SecurityMerchant>)
  async securitymerchantsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Query(() => Number)
  async totalSecurityMerchants(): Promise<number> {
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Query(() => SecurityMerchantsResponse<SecurityMerchant>)
  async searchSecurityMerchants(
    @Args("where", { type: () => SecurityMerchantDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityMerchantsResponse<SecurityMerchant>> {
    const securitymerchants = await this.service.findAndCount(where);
    return securitymerchants;
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Query(() => SecurityMerchantResponse<SecurityMerchant>, { nullable: true })
  async findOneSecurityMerchant(
    @Args("where", { type: () => SecurityMerchantDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityMerchantResponse<SecurityMerchant>> {
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
      .registerClient(SecurityMerchantResolver.name)

      .get(SecurityMerchantResolver.name),
    })
  @Query(() => SecurityMerchantResponse<SecurityMerchant>)
  async findOneSecurityMerchantOrFail(
    @Args("where", { type: () => SecurityMerchantDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityMerchantResponse<SecurityMerchant> | Error> {
    return this.service.findOneOrFail(where);
  }
}

