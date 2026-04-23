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
export class BaseSecurityMerchantDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateSecurityMerchant',
    example: 'Nombre de instancia CreateSecurityMerchant',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateSecurityMerchantDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateSecurityMerchant).',
    example: 'Fecha de creación de la instancia (CreateSecurityMerchant).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateSecurityMerchant).',
    example: 'Fecha de actualización de la instancia (CreateSecurityMerchant).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateSecurityMerchant).',
    example:
      'Usuario que realiza la creación de la instancia (CreateSecurityMerchant).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateSecurityMerchant).',
    example: 'Estado de activación de la instancia (CreateSecurityMerchant).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Referencia al user canónico',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Referencia al user canónico', nullable: false })
  userId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del comercio',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del comercio', nullable: false })
  merchantCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Representante legal',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Representante legal', nullable: true })
  legalRepresentative?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Razón social o entidad jurídica',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Razón social o entidad jurídica', nullable: true })
  legalEntityName?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Medios de cobro del merchant',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Medios de cobro del merchant', nullable: true })
  collectionMethods?: Record<string, any> = {};

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Cuentas bancarias del merchant',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Cuentas bancarias del merchant', nullable: true })
  bankAccounts?: Record<string, any> = {};

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado de aprobación operativa',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado de aprobación operativa', nullable: false })
  approvalStatus!: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de aprobación',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de aprobación', nullable: true })
  approvedAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del merchant',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos del merchant', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseSecurityMerchantDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class SecurityMerchantDto extends BaseSecurityMerchantDto {
  // Propiedades específicas de la clase SecurityMerchantDto en cuestión

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
  constructor(partial: Partial<SecurityMerchantDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<SecurityMerchantDto>): SecurityMerchantDto {
    const instance = new SecurityMerchantDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class SecurityMerchantValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => SecurityMerchantDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => SecurityMerchantDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class SecurityMerchantOutPutDto extends BaseSecurityMerchantDto {
  // Propiedades específicas de la clase SecurityMerchantOutPutDto en cuestión

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
  constructor(partial: Partial<SecurityMerchantOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<SecurityMerchantOutPutDto>): SecurityMerchantOutPutDto {
    const instance = new SecurityMerchantOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateSecurityMerchantDto extends BaseSecurityMerchantDto {
  // Propiedades específicas de la clase CreateSecurityMerchantDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateSecurityMerchant a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateSecurityMerchantDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateSecurityMerchantDto>): CreateSecurityMerchantDto {
    const instance = new CreateSecurityMerchantDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateSecurityMerchantDto {
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
    type: () => CreateSecurityMerchantDto,
    description: 'Instancia CreateSecurityMerchant o UpdateSecurityMerchant',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateSecurityMerchantDto, { nullable: true })
  input?: CreateSecurityMerchantDto | UpdateSecurityMerchantDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteSecurityMerchantDto {
  // Propiedades específicas de la clase DeleteSecurityMerchantDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteSecurityMerchant a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteSecurityMerchant a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateSecurityMerchantDto extends BaseSecurityMerchantDto {
  // Propiedades específicas de la clase UpdateSecurityMerchantDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateSecurityMerchant a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateSecurityMerchantDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateSecurityMerchantDto>): UpdateSecurityMerchantDto {
    const instance = new UpdateSecurityMerchantDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



