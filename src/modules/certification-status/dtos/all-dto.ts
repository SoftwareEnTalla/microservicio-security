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
export class BaseCertificationStatusDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateCertificationStatus',
    example: 'Nombre de instancia CreateCertificationStatus',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateCertificationStatusDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateCertificationStatus).',
    example: 'Fecha de creación de la instancia (CreateCertificationStatus).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateCertificationStatus).',
    example: 'Fecha de actualización de la instancia (CreateCertificationStatus).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateCertificationStatus).',
    example:
      'Usuario que realiza la creación de la instancia (CreateCertificationStatus).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateCertificationStatus).',
    example: 'Estado de activación de la instancia (CreateCertificationStatus).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Codigo del nomenclador',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Codigo del nomenclador', nullable: false })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Nombre visible',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Nombre visible', nullable: false })
  displayName!: string;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Configuracion adicional',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Configuracion adicional', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseCertificationStatusDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class CertificationStatusDto extends BaseCertificationStatusDto {
  // Propiedades específicas de la clase CertificationStatusDto en cuestión

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
  constructor(partial: Partial<CertificationStatusDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CertificationStatusDto>): CertificationStatusDto {
    const instance = new CertificationStatusDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class CertificationStatusValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => CertificationStatusDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => CertificationStatusDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class CertificationStatusOutPutDto extends BaseCertificationStatusDto {
  // Propiedades específicas de la clase CertificationStatusOutPutDto en cuestión

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
  constructor(partial: Partial<CertificationStatusOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CertificationStatusOutPutDto>): CertificationStatusOutPutDto {
    const instance = new CertificationStatusOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateCertificationStatusDto extends BaseCertificationStatusDto {
  // Propiedades específicas de la clase CreateCertificationStatusDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateCertificationStatus a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateCertificationStatusDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateCertificationStatusDto>): CreateCertificationStatusDto {
    const instance = new CreateCertificationStatusDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateCertificationStatusDto {
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
    type: () => CreateCertificationStatusDto,
    description: 'Instancia CreateCertificationStatus o UpdateCertificationStatus',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateCertificationStatusDto, { nullable: true })
  input?: CreateCertificationStatusDto | UpdateCertificationStatusDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteCertificationStatusDto {
  // Propiedades específicas de la clase DeleteCertificationStatusDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteCertificationStatus a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteCertificationStatus a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateCertificationStatusDto extends BaseCertificationStatusDto {
  // Propiedades específicas de la clase UpdateCertificationStatusDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateCertificationStatus a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateCertificationStatusDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateCertificationStatusDto>): UpdateCertificationStatusDto {
    const instance = new UpdateCertificationStatusDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



