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
export class BaseSalesManagerDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateSalesManager',
    example: 'Nombre de instancia CreateSalesManager',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateSalesManagerDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateSalesManager).',
    example: 'Fecha de creación de la instancia (CreateSalesManager).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateSalesManager).',
    example: 'Fecha de actualización de la instancia (CreateSalesManager).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateSalesManager).',
    example:
      'Usuario que realiza la creación de la instancia (CreateSalesManager).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateSalesManager).',
    example: 'Estado de activación de la instancia (CreateSalesManager).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Referencia al user base',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Referencia al user base', nullable: false })
  userId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del gestor de ventas',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del gestor de ventas', nullable: false })
  managerCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado de habilitación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado de habilitación', nullable: false })
  approvalStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Plan de comisión vigente',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Plan de comisión vigente', nullable: true })
  commissionPlanId?: string;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Contratos o acuerdos con merchants',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Contratos o acuerdos con merchants', nullable: true })
  merchantContracts?: Record<string, any> = {};

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia al árbol de referidos',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia al árbol de referidos', nullable: true })
  referralTreeReference?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del sales manager',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos del sales manager', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseSalesManagerDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class SalesManagerDto extends BaseSalesManagerDto {
  // Propiedades específicas de la clase SalesManagerDto en cuestión

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
  constructor(partial: Partial<SalesManagerDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<SalesManagerDto>): SalesManagerDto {
    const instance = new SalesManagerDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class SalesManagerValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => SalesManagerDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => SalesManagerDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class SalesManagerOutPutDto extends BaseSalesManagerDto {
  // Propiedades específicas de la clase SalesManagerOutPutDto en cuestión

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
  constructor(partial: Partial<SalesManagerOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<SalesManagerOutPutDto>): SalesManagerOutPutDto {
    const instance = new SalesManagerOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateSalesManagerDto extends BaseSalesManagerDto {
  // Propiedades específicas de la clase CreateSalesManagerDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateSalesManager a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateSalesManagerDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateSalesManagerDto>): CreateSalesManagerDto {
    const instance = new CreateSalesManagerDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateSalesManagerDto {
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
    type: () => CreateSalesManagerDto,
    description: 'Instancia CreateSalesManager o UpdateSalesManager',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateSalesManagerDto, { nullable: true })
  input?: CreateSalesManagerDto | UpdateSalesManagerDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteSalesManagerDto {
  // Propiedades específicas de la clase DeleteSalesManagerDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteSalesManager a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteSalesManager a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateSalesManagerDto extends BaseSalesManagerDto {
  // Propiedades específicas de la clase UpdateSalesManagerDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateSalesManager a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateSalesManagerDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateSalesManagerDto>): UpdateSalesManagerDto {
    const instance = new UpdateSalesManagerDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 

