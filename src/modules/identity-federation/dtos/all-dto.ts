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
export class BaseIdentityFederationDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateIdentityFederation',
    example: 'Nombre de instancia CreateIdentityFederation',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateIdentityFederationDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateIdentityFederation).',
    example: 'Fecha de creación de la instancia (CreateIdentityFederation).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateIdentityFederation).',
    example: 'Fecha de actualización de la instancia (CreateIdentityFederation).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateIdentityFederation).',
    example:
      'Usuario que realiza la creación de la instancia (CreateIdentityFederation).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateIdentityFederation).',
    example: 'Estado de activación de la instancia (CreateIdentityFederation).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código interno del proveedor o conexión federada',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código interno del proveedor o conexión federada', nullable: false })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Proveedor de identidad',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Proveedor de identidad', nullable: false })
  providerType!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Familia de protocolo',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Familia de protocolo', nullable: false })
  protocolFamily!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Versión concreta del protocolo',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Versión concreta del protocolo', nullable: false })
  protocolVersion!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Issuer o entidad emisora',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Issuer o entidad emisora', nullable: true })
  issuer?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de autorización',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de autorización', nullable: true })
  authorizationUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de obtención de token',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de obtención de token', nullable: true })
  tokenUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de JWKS o claves',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de JWKS o claves', nullable: true })
  jwksUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de userinfo o perfil',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de userinfo o perfil', nullable: true })
  userInfoUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Client id o identificador del RP/SP',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Client id o identificador del RP/SP', nullable: false })
  clientId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia segura al secreto',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia segura al secreto', nullable: true })
  clientSecretRef?: string = '';

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si la integración está habilitada',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si la integración está habilitada', nullable: false })
  enabled!: boolean;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Política de mapeo de claims',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Política de mapeo de claims', nullable: true })
  claimMappingPolicy?: Record<string, any> = {};

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del proveedor federado',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del proveedor federado', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseIdentityFederationDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class IdentityFederationDto extends BaseIdentityFederationDto {
  // Propiedades específicas de la clase IdentityFederationDto en cuestión

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
  constructor(partial: Partial<IdentityFederationDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<IdentityFederationDto>): IdentityFederationDto {
    const instance = new IdentityFederationDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class IdentityFederationValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => IdentityFederationDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => IdentityFederationDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class IdentityFederationOutPutDto extends BaseIdentityFederationDto {
  // Propiedades específicas de la clase IdentityFederationOutPutDto en cuestión

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
  constructor(partial: Partial<IdentityFederationOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<IdentityFederationOutPutDto>): IdentityFederationOutPutDto {
    const instance = new IdentityFederationOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateIdentityFederationDto extends BaseIdentityFederationDto {
  // Propiedades específicas de la clase CreateIdentityFederationDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateIdentityFederation a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateIdentityFederationDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateIdentityFederationDto>): CreateIdentityFederationDto {
    const instance = new CreateIdentityFederationDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateIdentityFederationDto {
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
    type: () => CreateIdentityFederationDto,
    description: 'Instancia CreateIdentityFederation o UpdateIdentityFederation',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateIdentityFederationDto, { nullable: true })
  input?: CreateIdentityFederationDto | UpdateIdentityFederationDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteIdentityFederationDto {
  // Propiedades específicas de la clase DeleteIdentityFederationDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteIdentityFederation a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteIdentityFederation a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateIdentityFederationDto extends BaseIdentityFederationDto {
  // Propiedades específicas de la clase UpdateIdentityFederationDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateIdentityFederation a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateIdentityFederationDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateIdentityFederationDto>): UpdateIdentityFederationDto {
    const instance = new UpdateIdentityFederationDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 

