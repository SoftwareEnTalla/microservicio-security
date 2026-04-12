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

import { Column, Entity, OneToOne, JoinColumn, ChildEntity, ManyToOne, OneToMany, ManyToMany, JoinTable, Index, Check, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CreateUserDto, UpdateUserDto, DeleteUserDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';


@Index('idx_user_code', ['code'], { unique: true })
@Index('idx_user_email', ['email'], { unique: true })
@Index('idx_user_identifier_value', ['identifierValue'], { unique: true })
@Unique('uq_user_code', ['code'])
@Unique('uq_user_email', ['email'])
@Unique('uq_user_identifier_value', ['identifierValue'])
@ChildEntity('user')
@ObjectType()
export class User extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de User",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de User", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia User' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de User",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de User", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia User' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del usuario', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 50, unique: true, comment: 'Código único del usuario' })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Nombre de usuario si aplica',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Nombre de usuario si aplica', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, unique: true, comment: 'Nombre de usuario si aplica' })
  username?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Correo principal del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Correo principal del usuario', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 150, unique: true, comment: 'Correo principal del usuario' })
  email!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Teléfono principal del usuario',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Teléfono principal del usuario', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 40, unique: true, comment: 'Teléfono principal del usuario' })
  phone?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Hash de la contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Hash de la contraseña del usuario', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, comment: 'Hash de la contraseña del usuario' })
  passwordHash!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia al usuario que lo refirió',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Referencia al usuario que lo refirió', nullable: true })
  @Column({ type: 'uuid', nullable: true, comment: 'Referencia al usuario que lo refirió' })
  referralId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de identificador principal',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de identificador principal', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'EMAIL', comment: 'Tipo de identificador principal' })
  identifierType!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Valor del identificador principal inmutable',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Valor del identificador principal inmutable', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 150, unique: true, comment: 'Valor del identificador principal inmutable' })
  identifierValue!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado operativo de la cuenta',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado operativo de la cuenta', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'PENDING_VERIFICATION', comment: 'Estado operativo de la cuenta' })
  accountStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo funcional del usuario',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo funcional del usuario', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'USER', comment: 'Tipo funcional del usuario' })
  userType!: string;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si aceptó términos y condiciones',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si aceptó términos y condiciones', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si aceptó términos y condiciones' })
  termsAccepted!: boolean;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de aceptación de términos',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de aceptación de términos', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de aceptación de términos' })
  termsAcceptedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Último acceso exitoso',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Último acceso exitoso', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Último acceso exitoso' })
  lastLoginAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha del último cambio de contraseña',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha del último cambio de contraseña', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha del último cambio de contraseña' })
  passwordChangedAt?: Date = new Date();

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si MFA está habilitado',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si MFA está habilitado', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si MFA está habilitado' })
  mfaEnabled!: boolean;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si TOTP está habilitado',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si TOTP está habilitado', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si TOTP está habilitado' })
  totpEnabled!: boolean;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si solo puede autenticarse vía proveedor federado',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si solo puede autenticarse vía proveedor federado', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si solo puede autenticarse vía proveedor federado' })
  federatedOnly!: boolean;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos adicionales del usuario',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos adicionales del usuario', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos adicionales del usuario' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: user-must-accept-terms
    // Un usuario no puede crearse sin aceptar términos y condiciones.
    if (!(this.termsAccepted === true)) {
      throw new Error('USER_001: El usuario debe aceptar términos y condiciones');
    }

    // Rule: user-must-have-identifier-value
    // Todo usuario debe tener un identificador principal no vacío.
    if (!(!(this.identifierValue === undefined || this.identifierValue === null || (typeof this.identifierValue === 'string' && String(this.identifierValue).trim() === '') || (Array.isArray(this.identifierValue) && this.identifierValue.length === 0) || (typeof this.identifierValue === 'object' && !Array.isArray(this.identifierValue) && Object.prototype.toString.call(this.identifierValue) === '[object Object]' && Object.keys(Object(this.identifierValue)).length === 0)))) {
      throw new Error('USER_002: El usuario requiere identificador principal');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'user';
  }

  // Getters y Setters
  get getName(): string {
    return this.name;
  }
  set setName(value: string) {
    this.name = value;
  }
  get getDescription(): string {
    return this.description;
  }

  // Métodos abstractos implementados
  async create(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async update(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async delete(id: string): Promise<BaseEntity> {
    this.id = id;
    return this;
  }

  // Método estático para convertir DTOs a entidad con sobrecarga
  static fromDto(dto: CreateUserDto): User;
  static fromDto(dto: UpdateUserDto): User;
  static fromDto(dto: DeleteUserDto): User;
  static fromDto(dto: any): User {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(User, dto);
  }
}
