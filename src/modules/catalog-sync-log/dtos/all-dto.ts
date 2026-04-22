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

import { InputType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';




@InputType()
export class BaseCatalogSyncLogDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateCatalogSyncLog',
    example: 'Nombre de instancia CreateCatalogSyncLog',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateCatalogSyncLogDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateCatalogSyncLog).',
    example: 'Fecha de creación de la instancia (CreateCatalogSyncLog).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateCatalogSyncLog).',
    example: 'Fecha de actualización de la instancia (CreateCatalogSyncLog).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateCatalogSyncLog).',
    example:
      'Usuario que realiza la creación de la instancia (CreateCatalogSyncLog).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateCatalogSyncLog).',
    example: 'Estado de activación de la instancia (CreateCatalogSyncLog).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Categoría sincronizada (CURRENCY, APPROVAL_STATUS, ...)',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Categoría sincronizada (CURRENCY, APPROVAL_STATUS, ...)', nullable: false })
  categoryCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Qué disparó el sync',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Qué disparó el sync', nullable: false })
  triggeredBy!: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Cantidad de ítems nuevos añadidos',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Cantidad de ítems nuevos añadidos', nullable: false })
  itemsAddedCount!: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Cantidad de ítems actualizados',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Cantidad de ítems actualizados', nullable: false })
  itemsUpdatedCount!: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Cantidad de ítems removidos/archivados',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Cantidad de ítems removidos/archivados', nullable: false })
  itemsRemovedCount!: number;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Diff detallado (added[], updated[], removed[])',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Diff detallado (added[], updated[], removed[])', nullable: true })
  diffSnapshot?: Record<string, any> = {};

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Causa del sync',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Causa del sync', nullable: true })
  reason?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Versión reportada por catalog',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Versión reportada por catalog', nullable: true })
  catalogVersion?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Hash SHA-256 del contenido remoto',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Hash SHA-256 del contenido remoto', nullable: true })
  catalogHash?: string = '';

  @ApiProperty({
    type: () => Number,
    nullable: true,
    description: 'Duración de la operación (ms)',
  })
  @IsInt()
  @IsOptional()
  @Field(() => Int, { description: 'Duración de la operación (ms)', nullable: true })
  durationMs?: number = 0;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Resultado del ciclo de sync',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Resultado del ciclo de sync', nullable: false })
  outcome!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Mensaje de error si outcome=ERROR',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Mensaje de error si outcome=ERROR', nullable: true })
  errorMessage?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Momento de finalización del sync',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Momento de finalización del sync', nullable: false })
  syncedAt!: Date;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos libres',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos libres', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseCatalogSyncLogDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class CatalogSyncLogDto extends BaseCatalogSyncLogDto {
  // Propiedades específicas de la clase CatalogSyncLogDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CatalogSyncLogDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CatalogSyncLogDto>): CatalogSyncLogDto {
    const instance = new CatalogSyncLogDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class CatalogSyncLogValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => CatalogSyncLogDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => CatalogSyncLogDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class CatalogSyncLogOutPutDto extends BaseCatalogSyncLogDto {
  // Propiedades específicas de la clase CatalogSyncLogOutPutDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CatalogSyncLogOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CatalogSyncLogOutPutDto>): CatalogSyncLogOutPutDto {
    const instance = new CatalogSyncLogOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateCatalogSyncLogDto extends BaseCatalogSyncLogDto {
  // Propiedades específicas de la clase CreateCatalogSyncLogDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateCatalogSyncLog a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateCatalogSyncLogDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateCatalogSyncLogDto>): CreateCatalogSyncLogDto {
    const instance = new CreateCatalogSyncLogDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateCatalogSyncLogDto {
  @ApiProperty({
    type: () => String,
    description: 'Identificador',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  @ApiProperty({
    type: () => CreateCatalogSyncLogDto,
    description: 'Instancia CreateCatalogSyncLog o UpdateCatalogSyncLog',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateCatalogSyncLogDto, { nullable: true })
  input?: CreateCatalogSyncLogDto | UpdateCatalogSyncLogDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteCatalogSyncLogDto {
  // Propiedades específicas de la clase DeleteCatalogSyncLogDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteCatalogSyncLog a eliminar',
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string = '';

  @ApiProperty({
    type: () => String,
    description: 'Lista de identificadores de instancias a eliminar',
    example:
      'Se proporciona una lista de identificadores de DeleteCatalogSyncLog a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateCatalogSyncLogDto extends BaseCatalogSyncLogDto {
  // Propiedades específicas de la clase UpdateCatalogSyncLogDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateCatalogSyncLog a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateCatalogSyncLogDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateCatalogSyncLogDto>): UpdateCatalogSyncLogDto {
    const instance = new UpdateCatalogSyncLogDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



