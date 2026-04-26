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
import { CertificationStatus } from "../entities/certification-status.entity";

//Definición de comandos
import {
  CreateCertificationStatusCommand,
  UpdateCertificationStatusCommand,
  DeleteCertificationStatusCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { CertificationStatusQueryService } from "../services/certificationstatusquery.service";


import { CertificationStatusResponse, CertificationStatussResponse } from "../types/certificationstatus.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateCertificationStatusDto, 
CreateOrUpdateCertificationStatusDto, 
CertificationStatusValueInput, 
CertificationStatusDto, 
CreateCertificationStatusDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => CertificationStatus)
export class CertificationStatusResolver {

   //Constructor del resolver de CertificationStatus
  constructor(
    private readonly service: CertificationStatusQueryService,
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  // Mutaciones
  @Mutation(() => CertificationStatusResponse<CertificationStatus>)
  async createCertificationStatus(
    @Args("input", { type: () => CreateCertificationStatusDto }) input: CreateCertificationStatusDto
  ): Promise<CertificationStatusResponse<CertificationStatus>> {
    return this.commandBus.execute(new CreateCertificationStatusCommand(input));
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Mutation(() => CertificationStatusResponse<CertificationStatus>)
  async updateCertificationStatus(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateCertificationStatusDto
  ): Promise<CertificationStatusResponse<CertificationStatus>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateCertificationStatusCommand(payLoad, {
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Mutation(() => CertificationStatusResponse<CertificationStatus>)
  async createOrUpdateCertificationStatus(
    @Args("data", { type: () => CreateOrUpdateCertificationStatusDto })
    data: CreateOrUpdateCertificationStatusDto
  ): Promise<CertificationStatusResponse<CertificationStatus>> {
    if (data.id) {
      const existingCertificationStatus = await this.service.findById(data.id);
      if (existingCertificationStatus) {
        return this.commandBus.execute(
          new UpdateCertificationStatusCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateCertificationStatusDto | UpdateCertificationStatusDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateCertificationStatusCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateCertificationStatusDto | UpdateCertificationStatusDto).createdBy ||
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteCertificationStatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteCertificationStatusCommand(id));
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  // Queries
  @Query(() => CertificationStatussResponse<CertificationStatus>)
  async certificationstatuss(
    options?: FindManyOptions<CertificationStatus>,
    paginationArgs?: PaginationArgs
  ): Promise<CertificationStatussResponse<CertificationStatus>> {
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Query(() => CertificationStatussResponse<CertificationStatus>)
  async certificationstatus(
    @Args("id", { type: () => String }) id: string
  ): Promise<CertificationStatusResponse<CertificationStatus>> {
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Query(() => CertificationStatussResponse<CertificationStatus>)
  async certificationstatussByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => CertificationStatusValueInput }) value: CertificationStatusValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CertificationStatussResponse<CertificationStatus>> {
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Query(() => CertificationStatussResponse<CertificationStatus>)
  async certificationstatussWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CertificationStatussResponse<CertificationStatus>> {
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Query(() => Number)
  async totalCertificationStatuss(): Promise<number> {
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Query(() => CertificationStatussResponse<CertificationStatus>)
  async searchCertificationStatuss(
    @Args("where", { type: () => CertificationStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<CertificationStatussResponse<CertificationStatus>> {
    const certificationstatuss = await this.service.findAndCount(where);
    return certificationstatuss;
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Query(() => CertificationStatusResponse<CertificationStatus>, { nullable: true })
  async findOneCertificationStatus(
    @Args("where", { type: () => CertificationStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<CertificationStatusResponse<CertificationStatus>> {
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
      .registerClient(CertificationStatusResolver.name)

      .get(CertificationStatusResolver.name),
    })
  @Query(() => CertificationStatusResponse<CertificationStatus>)
  async findOneCertificationStatusOrFail(
    @Args("where", { type: () => CertificationStatusDto, nullable: false })
    where: Record<string, any>
  ): Promise<CertificationStatusResponse<CertificationStatus> | Error> {
    return this.service.findOneOrFail(where);
  }
}

