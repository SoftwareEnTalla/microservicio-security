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
export class BaseSessionTokenDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateSessionToken',
    example: 'Nombre de instancia CreateSessionToken',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateSessionTokenDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateSessionToken).',
    example: 'Fecha de creación de la instancia (CreateSessionToken).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateSessionToken).',
    example: 'Fecha de actualización de la instancia (CreateSessionToken).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateSessionToken).',
    example:
      'Usuario que realiza la creación de la instancia (CreateSessionToken).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateSessionToken).',
    example: 'Estado de activación de la instancia (CreateSessionToken).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Usuario dueño de la sesión',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Usuario dueño de la sesión', nullable: false })
  userId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Aplicación o microservicio suscrito',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Aplicación o microservicio suscrito', nullable: true })
  subscriberId?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único de sesión',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único de sesión', nullable: false })
  sessionCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Identificador del token',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Identificador del token', nullable: false })
  tokenId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de token o artefacto de seguridad',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de token o artefacto de seguridad', nullable: false })
  tokenType!: string;

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Fecha de emisión',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Fecha de emisión', nullable: false })
  issuedAt!: Date;

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Fecha de expiración',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Fecha de expiración', nullable: false })
  expiresAt!: Date;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de revocación',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de revocación', nullable: true })
  revokedAt?: Date = new Date();

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo de revocación',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo de revocación', nullable: true })
  revocationReason?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de cierre de sesión',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de cierre de sesión', nullable: true })
  logoutAt?: Date = new Date();

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado del token o sesión',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado del token o sesión', nullable: false })
  certificationStatus!: string;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'ACLs devueltas en refresh o revalidación',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'ACLs devueltas en refresh o revalidación', nullable: true })
  authenticatedUserAcls?: Record<string, any> = {};

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del token o sesión',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos del token o sesión', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseSessionTokenDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class SessionTokenDto extends BaseSessionTokenDto {
  // Propiedades específicas de la clase SessionTokenDto en cuestión

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
  constructor(partial: Partial<SessionTokenDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<SessionTokenDto>): SessionTokenDto {
    const instance = new SessionTokenDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class SessionTokenValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => SessionTokenDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => SessionTokenDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class SessionTokenOutPutDto extends BaseSessionTokenDto {
  // Propiedades específicas de la clase SessionTokenOutPutDto en cuestión

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
  constructor(partial: Partial<SessionTokenOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<SessionTokenOutPutDto>): SessionTokenOutPutDto {
    const instance = new SessionTokenOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateSessionTokenDto extends BaseSessionTokenDto {
  // Propiedades específicas de la clase CreateSessionTokenDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateSessionToken a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateSessionTokenDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateSessionTokenDto>): CreateSessionTokenDto {
    const instance = new CreateSessionTokenDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateSessionTokenDto {
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
    type: () => CreateSessionTokenDto,
    description: 'Instancia CreateSessionToken o UpdateSessionToken',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateSessionTokenDto, { nullable: true })
  input?: CreateSessionTokenDto | UpdateSessionTokenDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteSessionTokenDto {
  // Propiedades específicas de la clase DeleteSessionTokenDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteSessionToken a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteSessionToken a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateSessionTokenDto extends BaseSessionTokenDto {
  // Propiedades específicas de la clase UpdateSessionTokenDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateSessionToken a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateSessionTokenDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateSessionTokenDto>): UpdateSessionTokenDto {
    const instance = new UpdateSessionTokenDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



