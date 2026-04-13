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
export class BaseLoginDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateLogin',
    example: 'Nombre de instancia CreateLogin',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateLoginDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateLogin).',
    example: 'Fecha de creación de la instancia (CreateLogin).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateLogin).',
    example: 'Fecha de actualización de la instancia (CreateLogin).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateLogin).',
    example:
      'Usuario que realiza la creación de la instancia (CreateLogin).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateLogin).',
    example: 'Estado de activación de la instancia (CreateLogin).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del intento o flujo de login',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del intento o flujo de login', nullable: false })
  correlationCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Usuario autenticado cuando puede resolverse internamente',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Usuario autenticado cuando puede resolverse internamente', nullable: true })
  userId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Identificador usado por la persona para entrar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Identificador usado por la persona para entrar', nullable: false })
  loginIdentifier!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Tipo de identificador recibido',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Tipo de identificador recibido', nullable: true })
  loginIdentifierType?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de flujo de autenticación o sesión',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de flujo de autenticación o sesión', nullable: false })
  flowType!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Método efectivo de autenticación o federación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Método efectivo de autenticación o federación', nullable: false })
  authMethod!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Proveedor externo utilizado cuando aplica',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Proveedor externo utilizado cuando aplica', nullable: true })
  providerCode?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Aplicación o microservicio consumidor',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Aplicación o microservicio consumidor', nullable: true })
  subscriberId?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Código de sesión correlacionado',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Código de sesión correlacionado', nullable: true })
  sessionCode?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Resultado del flujo de login',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Resultado del flujo de login', nullable: false })
  authStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo del fallo si el flujo no termina exitosamente',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo del fallo si el flujo no termina exitosamente', nullable: true })
  failureReason?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'IP reportada por el canal de entrada',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'IP reportada por el canal de entrada', nullable: true })
  ipAddress?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Huella del dispositivo cuando aplique',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Huella del dispositivo cuando aplique', nullable: true })
  deviceFingerprint?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Cadena user-agent del canal',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Cadena user-agent del canal', nullable: true })
  userAgent?: string = '';

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si el flujo emitió access token',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si el flujo emitió access token', nullable: false })
  accessTokenIssued!: boolean;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si el flujo emitió refresh token o continuidad de sesión',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si el flujo emitió refresh token o continuidad de sesión', nullable: false })
  refreshTokenIssued!: boolean;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si el flujo requiere PKCE',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si el flujo requiere PKCE', nullable: false })
  pkceRequired!: boolean;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'ACLs resueltas al completar la autenticación',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'ACLs resueltas al completar la autenticación', nullable: true })
  authenticatedUserAcls?: Record<string, any> = {};

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Momento del resultado del flujo',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Momento del resultado del flujo', nullable: false })
  occurredAt!: Date;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos del login',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos del login', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseLoginDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class LoginDto extends BaseLoginDto {
  // Propiedades específicas de la clase LoginDto en cuestión

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
  constructor(partial: Partial<LoginDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<LoginDto>): LoginDto {
    const instance = new LoginDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class LoginValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => LoginDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => LoginDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class LoginOutPutDto extends BaseLoginDto {
  // Propiedades específicas de la clase LoginOutPutDto en cuestión

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
  constructor(partial: Partial<LoginOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<LoginOutPutDto>): LoginOutPutDto {
    const instance = new LoginOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateLoginDto extends BaseLoginDto {
  // Propiedades específicas de la clase CreateLoginDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateLogin a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateLoginDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateLoginDto>): CreateLoginDto {
    const instance = new CreateLoginDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateLoginDto {
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
    type: () => CreateLoginDto,
    description: 'Instancia CreateLogin o UpdateLogin',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateLoginDto, { nullable: true })
  input?: CreateLoginDto | UpdateLoginDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteLoginDto {
  // Propiedades específicas de la clase DeleteLoginDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteLogin a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteLogin a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateLoginDto extends BaseLoginDto {
  // Propiedades específicas de la clase UpdateLoginDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateLogin a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateLoginDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateLoginDto>): UpdateLoginDto {
    const instance = new UpdateLoginDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 


@InputType()
export class LoginAuthenticateWithPasswordDto {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Nombre de usuario, correo o teléfono usado para entrar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Nombre de usuario, correo o teléfono usado para entrar', nullable: false })
  identifier!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Contraseña asociada a la cuenta',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Contraseña asociada a la cuenta', nullable: false })
  password!: string;

  constructor(partial: Partial<LoginAuthenticateWithPasswordDto> = {}) {
    Object.assign(this, partial);
  }
}


@InputType()
export class LoginStartFederatedLoginDto {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del proveedor de identidad externo habilitado',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del proveedor de identidad externo habilitado', nullable: false })
  providerCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'URL de retorno de la aplicación consumidora',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'URL de retorno de la aplicación consumidora', nullable: false })
  redirectUri!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador sugerido para el proveedor externo',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Identificador sugerido para el proveedor externo', nullable: true })
  loginHint?: string = '';

  constructor(partial: Partial<LoginStartFederatedLoginDto> = {}) {
    Object.assign(this, partial);
  }
}


@InputType()
export class LoginRefreshSessionDto {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Refresh token vigente emitido por security',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Refresh token vigente emitido por security', nullable: false })
  refreshToken!: string;

  constructor(partial: Partial<LoginRefreshSessionDto> = {}) {
    Object.assign(this, partial);
  }
}


@InputType()
export class LoginLogoutDto {
  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Código de sesión emitido por security',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Código de sesión emitido por security', nullable: true })
  sessionCode?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Refresh token de la sesión a invalidar',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Refresh token de la sesión a invalidar', nullable: true })
  refreshToken?: string = '';

  constructor(partial: Partial<LoginLogoutDto> = {}) {
    Object.assign(this, partial);
  }
}

