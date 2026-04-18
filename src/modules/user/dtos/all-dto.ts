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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  MinLength,
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

  @ApiProperty({
    type: () => String,
    description: 'Descripción de la instancia User.',
    example: 'Descripción funcional del usuario',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  description: string = 'Sin descripción';

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


@InputType()
export class CreateUserMinimalDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de usuario requerido por la historia de usuario.',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  username!: string;

  @ApiProperty({
    type: () => String,
    description: 'Correo principal del usuario.',
  })
  @IsEmail()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  email!: string;

  @ApiProperty({
    type: () => String,
    description: 'Teléfono principal del usuario.',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  phone!: string;

  @ApiProperty({
    type: () => String,
    description: 'Contraseña en texto plano. El backend la persistirá como passwordHash.',
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  password!: string;

  @ApiProperty({
    type: () => Boolean,
    description: 'Aceptación explícita de términos y condiciones.',
  })
  @IsBoolean()
  @Field(() => Boolean, { nullable: false })
  termsAccepted!: boolean;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Nombre visible del usuario. Si se omite se usa username.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Descripción funcional del usuario.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Usuario creador de la instancia.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Referencia al usuario que lo refirió.',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { nullable: true })
  referralId?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Identificador principal del microservicio.',
    enum: ['EMAIL', 'USERNAME', 'PHONE'],
    default: 'EMAIL',
  })
  @IsString()
  @IsOptional()
  @IsIn(['EMAIL', 'USERNAME', 'PHONE'])
  @Field(() => String, { nullable: true, defaultValue: 'EMAIL' })
  identifierType?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Estado de cuenta inicial. Si se omite queda pendiente de verificación.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  accountStatus?: string;

  @ApiPropertyOptional({
    type: () => Boolean,
    description: 'Estado operativo de la instancia.',
  })
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    type: () => Object,
    description: 'Metadatos adicionales del usuario.',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}


@InputType()
export class UpdateUserMinimalDto {
  @ApiPropertyOptional({
    type: () => String,
    description: 'Identificador del usuario. En actualización simple puede omitirse y usarse el de la URL.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Nombre visible del usuario.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Descripción funcional del usuario.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Nombre de usuario.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  username?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Correo principal.',
  })
  @IsEmail()
  @IsOptional()
  @Field(() => String, { nullable: true })
  email?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Teléfono principal.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phone?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Nueva contraseña en texto plano.',
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @Field(() => String, { nullable: true })
  password?: string;

  @ApiPropertyOptional({
    type: () => Boolean,
    description: 'Aceptación de términos y condiciones.',
  })
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  termsAccepted?: boolean;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Estado de cuenta del usuario.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  accountStatus?: string;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Tipo funcional del usuario. Si no se envía se mantiene el actual.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  userType?: string;

  @ApiPropertyOptional({
    type: () => Boolean,
    description: 'Estado operativo del usuario.',
  })
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    type: () => String,
    description: 'Usuario creador o responsable del cambio.',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string;

  @ApiPropertyOptional({
    type: () => Object,
    description: 'Metadatos adicionales a fusionar.',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}


export class UserListQueryDto {
  @ApiPropertyOptional({ type: Number, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ type: Number, default: 25 })
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ type: String, default: 'creationDate' })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ type: String, enum: ['ASC', 'DESC', 'asc', 'desc'], default: 'DESC' })
  @IsString()
  @IsOptional()
  order?: string;

  @ApiPropertyOptional({ type: String, description: 'Búsqueda libre por username, email, phone o code.' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  identifierType?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  identifierValue?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  accountStatus?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  userType?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  termsAccepted?: boolean;
}



