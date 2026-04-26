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
import { AccountStatus } from "../entities/account-status.entity";

//Definición de comandos
import {
  CreateAccountStatusCommand,
  UpdateAccountStatusCommand,
  DeleteAccountStatusCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { AccountStatusQueryService } from "../services/accountstatusquery.service";


import { AccountStatusResponse, AccountStatussResponse } from "../types/accountstatus.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateAccountStatusDto, 
CreateOrUpdateAccountStatusDto, 
AccountStatusValueInput, 
AccountStatusDto, 
CreateAccountStatusDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => AccountStatus)
export class AccountStatusResolver {

   //Constructor del resolver de AccountStatus
  constructor(
    private readonly service: AccountStatusQueryService,
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  // Mutaciones
  @Mutation(() => AccountStatusResponse<AccountStatus>)
  async createAccountStatus(
    @Args("input", { type: () => CreateAccountStatusDto }) input: CreateAccountStatusDto
  ): Promise<AccountStatusResponse<AccountStatus>> {
    return this.commandBus.execute(new CreateAccountStatusCommand(input));
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Mutation(() => AccountStatusResponse<AccountStatus>)
  async updateAccountStatus(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateAccountStatusDto
  ): Promise<AccountStatusResponse<AccountStatus>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateAccountStatusCommand(payLoad, {
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Mutation(() => AccountStatusResponse<AccountStatus>)
  async createOrUpdateAccountStatus(
    @Args("data", { type: () => CreateOrUpdateAccountStatusDto })
    data: CreateOrUpdateAccountStatusDto
  ): Promise<AccountStatusResponse<AccountStatus>> {
    if (data.id) {
      const existingAccountStatus = await this.service.findById(data.id);
      if (existingAccountStatus) {
        return this.commandBus.execute(
          new UpdateAccountStatusCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateAccountStatusDto | UpdateAccountStatusDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateAccountStatusCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateAccountStatusDto | UpdateAccountStatusDto).createdBy ||
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteAccountStatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteAccountStatusCommand(id));
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  // Queries
  @Query(() => AccountStatussResponse<AccountStatus>)
  async accountstatuss(
    options?: FindManyOptions<AccountStatus>,
    paginationArgs?: PaginationArgs
  ): Promise<AccountStatussResponse<AccountStatus>> {
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Query(() => AccountStatussResponse<AccountStatus>)
  async accountstatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<AccountStatusResponse<AccountStatus>> {
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Query(() => AccountStatussResponse<AccountStatus>)
  async accountstatussByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => AccountStatusValueInput }) value: AccountStatusValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AccountStatussResponse<AccountStatus>> {
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Query(() => AccountStatussResponse<AccountStatus>)
  async accountstatussWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<AccountStatussResponse<AccountStatus>> {
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Query(() => Number)
  async totalAccountStatuss(): Promise<number> {
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Query(() => AccountStatussResponse<AccountStatus>)
  async searchAccountStatuss(
    @Args("where", { type: () => AccountStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<AccountStatussResponse<AccountStatus>> {
    const accountstatuss = await this.service.findAndCount(where);
    return accountstatuss;
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Query(() => AccountStatusResponse<AccountStatus>, { nullable: true })
  async findOneAccountStatus(
    @Args("where", { type: () => AccountStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<AccountStatusResponse<AccountStatus>> {
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
      .registerClient(AccountStatusResolver.name)

      .get(AccountStatusResolver.name),
    })
  @Query(() => AccountStatusResponse<AccountStatus>)
  async findOneAccountStatusOrFail(
    @Args("where", { type: () => AccountStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<AccountStatusResponse<AccountStatus> | Error> {
    return this.service.findOneOrFail(where);
  }
}

