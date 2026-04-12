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
export class BaseUserDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateUser',
    example: 'Nombre de instancia CreateUser',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateUserDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateUser).',
    example: 'Fecha de creación de la instancia (CreateUser).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateUser).',
    example: 'Fecha de actualización de la instancia (CreateUser).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateUser).',
    example:
      'Usuario que realiza la creación de la instancia (CreateUser).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateUser).',
    example: 'Estado de activación de la instancia (CreateUser).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del usuario', nullable: false })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Nombre de usuario si aplica',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Nombre de usuario si aplica', nullable: true })
  username?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Correo principal del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Correo principal del usuario', nullable: false })
  email!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Teléfono principal del usuario',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Teléfono principal del usuario', nullable: true })
  phone?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Hash de la contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Hash de la contraseña del usuario', nullable: false })
  passwordHash!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia al usuario que lo refirió',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Referencia al usuario que lo refirió', nullable: true })
  referralId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de identificador principal',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de identificador principal', nullable: false })
  identifierType!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Valor del identificador principal inmutable',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Valor del identificador principal inmutable', nullable: false })
  identifierValue!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado operativo de la cuenta',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado operativo de la cuenta', nullable: false })
  accountStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo funcional del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo funcional del usuario', nullable: false })
  userType!: string;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si aceptó términos y condiciones',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si aceptó términos y condiciones', nullable: false })
  termsAccepted!: boolean;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de aceptación de términos',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de aceptación de términos', nullable: true })
  termsAcceptedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Último acceso exitoso',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Último acceso exitoso', nullable: true })
  lastLoginAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha del último cambio de contraseña',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha del último cambio de contraseña', nullable: true })
  passwordChangedAt?: Date = new Date();

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
    type: () => Boolean,
    nullable: false,
    description: 'Indica si TOTP está habilitado',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si TOTP está habilitado', nullable: false })
  totpEnabled!: boolean;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si solo puede autenticarse vía proveedor federado',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si solo puede autenticarse vía proveedor federado', nullable: false })
  federatedOnly!: boolean;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos adicionales del usuario',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos adicionales del usuario', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseUserDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class UserDto extends BaseUserDto {
  // Propiedades específicas de la clase UserDto en cuestión

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
  constructor(partial: Partial<UserDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UserDto>): UserDto {
    const instance = new UserDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class UserValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => UserDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => UserDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class UserOutPutDto extends BaseUserDto {
  // Propiedades específicas de la clase UserOutPutDto en cuestión

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
  constructor(partial: Partial<UserOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UserOutPutDto>): UserOutPutDto {
    const instance = new UserOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateUserDto extends BaseUserDto {
  // Propiedades específicas de la clase CreateUserDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateUser a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateUserDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateUserDto>): CreateUserDto {
    const instance = new CreateUserDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateUserDto {
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
    type: () => CreateUserDto,
    description: 'Instancia CreateUser o UpdateUser',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateUserDto, { nullable: true })
  input?: CreateUserDto | UpdateUserDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteUserDto {
  // Propiedades específicas de la clase DeleteUserDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteUser a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteUser a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateUserDto extends BaseUserDto {
  // Propiedades específicas de la clase UpdateUserDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateUser a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateUserDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateUserDto>): UpdateUserDto {
    const instance = new UpdateUserDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 

