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
export class BaseUserProfileDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateUserProfile',
    example: 'Nombre de instancia CreateUserProfile',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateUserProfileDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateUserProfile).',
    example: 'Fecha de creación de la instancia (CreateUserProfile).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateUserProfile).',
    example: 'Fecha de actualización de la instancia (CreateUserProfile).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateUserProfile).',
    example:
      'Usuario que realiza la creación de la instancia (CreateUserProfile).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateUserProfile).',
    example: 'Estado de activación de la instancia (CreateUserProfile).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Referencia al usuario dueño del perfil',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Referencia al usuario dueño del perfil', nullable: false })
  userId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Nombre',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Nombre', nullable: true })
  firstName?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Apellidos',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Apellidos', nullable: true })
  lastName?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de la foto de perfil',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de la foto de perfil', nullable: true })
  profilePhotoUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Idioma preferido',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Idioma preferido', nullable: true })
  language?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'País',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'País', nullable: true })
  country?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Provincia o estado',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Provincia o estado', nullable: true })
  stateOrProvince?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Ciudad',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Ciudad', nullable: true })
  city?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Dirección física',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Dirección física', nullable: true })
  address?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del perfil',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos del perfil', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseUserProfileDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class UserProfileDto extends BaseUserProfileDto {
  // Propiedades específicas de la clase UserProfileDto en cuestión

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
  constructor(partial: Partial<UserProfileDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UserProfileDto>): UserProfileDto {
    const instance = new UserProfileDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class UserProfileValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => UserProfileDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => UserProfileDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class UserProfileOutPutDto extends BaseUserProfileDto {
  // Propiedades específicas de la clase UserProfileOutPutDto en cuestión

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
  constructor(partial: Partial<UserProfileOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UserProfileOutPutDto>): UserProfileOutPutDto {
    const instance = new UserProfileOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateUserProfileDto extends BaseUserProfileDto {
  // Propiedades específicas de la clase CreateUserProfileDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateUserProfile a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateUserProfileDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateUserProfileDto>): CreateUserProfileDto {
    const instance = new CreateUserProfileDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateUserProfileDto {
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
    type: () => CreateUserProfileDto,
    description: 'Instancia CreateUserProfile o UpdateUserProfile',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateUserProfileDto, { nullable: true })
  input?: CreateUserProfileDto | UpdateUserProfileDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteUserProfileDto {
  // Propiedades específicas de la clase DeleteUserProfileDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteUserProfile a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteUserProfile a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateUserProfileDto extends BaseUserProfileDto {
  // Propiedades específicas de la clase UpdateUserProfileDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateUserProfile a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateUserProfileDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateUserProfileDto>): UpdateUserProfileDto {
    const instance = new UpdateUserProfileDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



