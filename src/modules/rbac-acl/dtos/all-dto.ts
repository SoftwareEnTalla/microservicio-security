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
export class BaseRbacAclDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateRbacAcl',
    example: 'Nombre de instancia CreateRbacAcl',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateRbacAclDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateRbacAcl).',
    example: 'Fecha de creación de la instancia (CreateRbacAcl).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateRbacAcl).',
    example: 'Fecha de actualización de la instancia (CreateRbacAcl).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateRbacAcl).',
    example:
      'Usuario que realiza la creación de la instancia (CreateRbacAcl).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateRbacAcl).',
    example: 'Estado de activación de la instancia (CreateRbacAcl).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del rol',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del rol', nullable: false })
  roleCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Nombre descriptivo del rol',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Nombre descriptivo del rol', nullable: false })
  roleName!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del permiso',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del permiso', nullable: false })
  permissionCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Recurso protegido',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Recurso protegido', nullable: false })
  resource!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Acción autorizada',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Acción autorizada', nullable: false })
  action!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Ámbito del permiso',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Ámbito del permiso', nullable: true })
  scope?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Efecto del permiso',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Efecto del permiso', nullable: false })
  effect!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Usuario al que aplica la ACL si está materializada',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Usuario al que aplica la ACL si está materializada', nullable: true })
  userId?: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de asignación',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de asignación', nullable: true })
  assignedAt?: Date = new Date();

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
    type: () => Object,
    nullable: true,
    description: 'Metadatos de autorización',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos de autorización', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseRbacAclDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class RbacAclDto extends BaseRbacAclDto {
  // Propiedades específicas de la clase RbacAclDto en cuestión

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
  constructor(partial: Partial<RbacAclDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<RbacAclDto>): RbacAclDto {
    const instance = new RbacAclDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class RbacAclValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => RbacAclDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => RbacAclDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class RbacAclOutPutDto extends BaseRbacAclDto {
  // Propiedades específicas de la clase RbacAclOutPutDto en cuestión

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
  constructor(partial: Partial<RbacAclOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<RbacAclOutPutDto>): RbacAclOutPutDto {
    const instance = new RbacAclOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateRbacAclDto extends BaseRbacAclDto {
  // Propiedades específicas de la clase CreateRbacAclDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateRbacAcl a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateRbacAclDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateRbacAclDto>): CreateRbacAclDto {
    const instance = new CreateRbacAclDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateRbacAclDto {
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
    type: () => CreateRbacAclDto,
    description: 'Instancia CreateRbacAcl o UpdateRbacAcl',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateRbacAclDto, { nullable: true })
  input?: CreateRbacAclDto | UpdateRbacAclDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteRbacAclDto {
  // Propiedades específicas de la clase DeleteRbacAclDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteRbacAcl a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteRbacAcl a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateRbacAclDto extends BaseRbacAclDto {
  // Propiedades específicas de la clase UpdateRbacAclDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateRbacAcl a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateRbacAclDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateRbacAclDto>): UpdateRbacAclDto {
    const instance = new UpdateRbacAclDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 

