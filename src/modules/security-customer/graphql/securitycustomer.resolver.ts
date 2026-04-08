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
import { SecurityCustomer } from "../entities/security-customer.entity";

//Definición de comandos
import {
  CreateSecurityCustomerCommand,
  UpdateSecurityCustomerCommand,
  DeleteSecurityCustomerCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { SecurityCustomerQueryService } from "../services/securitycustomerquery.service";


import { SecurityCustomerResponse, SecurityCustomersResponse } from "../types/securitycustomer.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateSecurityCustomerDto, 
CreateOrUpdateSecurityCustomerDto, 
SecurityCustomerValueInput, 
SecurityCustomerDto, 
CreateSecurityCustomerDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => SecurityCustomer)
export class SecurityCustomerResolver {

   //Constructor del resolver de SecurityCustomer
  constructor(
    private readonly service: SecurityCustomerQueryService,
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  // Mutaciones
  @Mutation(() => SecurityCustomerResponse<SecurityCustomer>)
  async createSecurityCustomer(
    @Args("input", { type: () => CreateSecurityCustomerDto }) input: CreateSecurityCustomerDto
  ): Promise<SecurityCustomerResponse<SecurityCustomer>> {
    return this.commandBus.execute(new CreateSecurityCustomerCommand(input));
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Mutation(() => SecurityCustomerResponse<SecurityCustomer>)
  async updateSecurityCustomer(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateSecurityCustomerDto
  ): Promise<SecurityCustomerResponse<SecurityCustomer>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateSecurityCustomerCommand(payLoad, {
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Mutation(() => SecurityCustomerResponse<SecurityCustomer>)
  async createOrUpdateSecurityCustomer(
    @Args("data", { type: () => CreateOrUpdateSecurityCustomerDto })
    data: CreateOrUpdateSecurityCustomerDto
  ): Promise<SecurityCustomerResponse<SecurityCustomer>> {
    if (data.id) {
      const existingSecurityCustomer = await this.service.findById(data.id);
      if (existingSecurityCustomer) {
        return this.commandBus.execute(
          new UpdateSecurityCustomerCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateSecurityCustomerDto | UpdateSecurityCustomerDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateSecurityCustomerCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateSecurityCustomerDto | UpdateSecurityCustomerDto).createdBy ||
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteSecurityCustomer(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSecurityCustomerCommand(id));
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  // Queries
  @Query(() => SecurityCustomersResponse<SecurityCustomer>)
  async securitycustomers(
    options?: FindManyOptions<SecurityCustomer>,
    paginationArgs?: PaginationArgs
  ): Promise<SecurityCustomersResponse<SecurityCustomer>> {
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Query(() => SecurityCustomersResponse<SecurityCustomer>)
  async securitycustomer(
    @Args("id", { type: () => String }) id: string
  ): Promise<SecurityCustomerResponse<SecurityCustomer>> {
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Query(() => SecurityCustomersResponse<SecurityCustomer>)
  async securitycustomersByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => SecurityCustomerValueInput }) value: SecurityCustomerValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecurityCustomersResponse<SecurityCustomer>> {
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Query(() => SecurityCustomersResponse<SecurityCustomer>)
  async securitycustomersWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<SecurityCustomersResponse<SecurityCustomer>> {
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Query(() => Number)
  async totalSecurityCustomers(): Promise<number> {
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Query(() => SecurityCustomersResponse<SecurityCustomer>)
  async searchSecurityCustomers(
    @Args("where", { type: () => SecurityCustomerDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityCustomersResponse<SecurityCustomer>> {
    const securitycustomers = await this.service.findAndCount(where);
    return securitycustomers;
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Query(() => SecurityCustomerResponse<SecurityCustomer>, { nullable: true })
  async findOneSecurityCustomer(
    @Args("where", { type: () => SecurityCustomerDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityCustomerResponse<SecurityCustomer>> {
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
      .registerClient(SecurityCustomerResolver.name)

      .get(SecurityCustomerResolver.name),
    })
  @Query(() => SecurityCustomerResponse<SecurityCustomer>)
  async findOneSecurityCustomerOrFail(
    @Args("where", { type: () => SecurityCustomerDto, nullable: false })
    where: Record<string, any>
  ): Promise<SecurityCustomerResponse<SecurityCustomer> | Error> {
    return this.service.findOneOrFail(where);
  }
}

