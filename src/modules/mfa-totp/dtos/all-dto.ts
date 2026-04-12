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
export class BaseMfaTotpDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateMfaTotp',
    example: 'Nombre de instancia CreateMfaTotp',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateMfaTotpDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateMfaTotp).',
    example: 'Fecha de creación de la instancia (CreateMfaTotp).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateMfaTotp).',
    example: 'Fecha de actualización de la instancia (CreateMfaTotp).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateMfaTotp).',
    example:
      'Usuario que realiza la creación de la instancia (CreateMfaTotp).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateMfaTotp).',
    example: 'Estado de activación de la instancia (CreateMfaTotp).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Usuario dueño de la configuración MFA',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Usuario dueño de la configuración MFA', nullable: false })
  userId!: string;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si MFA está habilitado',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si MFA está habilitado', nullable: false })
  mfaEnabled!: boolean;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Modo de MFA',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Modo de MFA', nullable: false })
  mfaMode!: string;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si TOTP está habilitado',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si TOTP está habilitado', nullable: false })
  totpEnabled!: boolean;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia segura al secreto TOTP',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia segura al secreto TOTP', nullable: true })
  totpSecretRef?: string = '';

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Versión del set de códigos de recuperación',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Versión del set de códigos de recuperación', nullable: false })
  recoveryCodesVersion!: number;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado del reto MFA',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado del reto MFA', nullable: false })
  challengeStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Tipo de challenge MFA',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Tipo de challenge MFA', nullable: true })
  challengeType?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Última verificación exitosa',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Última verificación exitosa', nullable: true })
  verifiedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Último uso de MFA',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Último uso de MFA', nullable: true })
  lastUsedAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos de configuración MFA',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos de configuración MFA', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseMfaTotpDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class MfaTotpDto extends BaseMfaTotpDto {
  // Propiedades específicas de la clase MfaTotpDto en cuestión

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
  constructor(partial: Partial<MfaTotpDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<MfaTotpDto>): MfaTotpDto {
    const instance = new MfaTotpDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class MfaTotpValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => MfaTotpDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => MfaTotpDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class MfaTotpOutPutDto extends BaseMfaTotpDto {
  // Propiedades específicas de la clase MfaTotpOutPutDto en cuestión

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
  constructor(partial: Partial<MfaTotpOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<MfaTotpOutPutDto>): MfaTotpOutPutDto {
    const instance = new MfaTotpOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateMfaTotpDto extends BaseMfaTotpDto {
  // Propiedades específicas de la clase CreateMfaTotpDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateMfaTotp a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateMfaTotpDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateMfaTotpDto>): CreateMfaTotpDto {
    const instance = new CreateMfaTotpDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateMfaTotpDto {
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
    type: () => CreateMfaTotpDto,
    description: 'Instancia CreateMfaTotp o UpdateMfaTotp',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateMfaTotpDto, { nullable: true })
  input?: CreateMfaTotpDto | UpdateMfaTotpDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteMfaTotpDto {
  // Propiedades específicas de la clase DeleteMfaTotpDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteMfaTotp a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteMfaTotp a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateMfaTotpDto extends BaseMfaTotpDto {
  // Propiedades específicas de la clase UpdateMfaTotpDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateMfaTotp a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateMfaTotpDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateMfaTotpDto>): UpdateMfaTotpDto {
    const instance = new UpdateMfaTotpDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 

