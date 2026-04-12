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
import { CreateAuthenticationDto, UpdateAuthenticationDto, DeleteAuthenticationDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';


@Index('idx_authentication_user_status', ['userId', 'authStatus'])
@Index('idx_authentication_identifier', ['loginIdentifier'])
@ChildEntity('authentication')
@ObjectType()
export class Authentication extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de Authentication",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de Authentication", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia Authentication' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de Authentication",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de Authentication", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia Authentication' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Usuario autenticado o que intenta autenticarse cuando puede resolverse internamente',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Usuario autenticado o que intenta autenticarse cuando puede resolverse internamente', nullable: true })
  @Column({ type: 'uuid', nullable: true, comment: 'Usuario autenticado o que intenta autenticarse cuando puede resolverse internamente' })
  userId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Identificador usado en el login',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Identificador usado en el login', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 150, comment: 'Identificador usado en el login' })
  loginIdentifier!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Método de autenticación utilizado',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Método de autenticación utilizado', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'LOCAL_PASSWORD', comment: 'Método de autenticación utilizado' })
  authMethod!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Resultado del proceso de autenticación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Resultado del proceso de autenticación', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'PENDING', comment: 'Resultado del proceso de autenticación' })
  authStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo del fallo si aplica',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo del fallo si aplica', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 150, comment: 'Motivo del fallo si aplica' })
  failureReason?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Dirección IP del intento',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Dirección IP del intento', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 64, comment: 'Dirección IP del intento' })
  ipAddress?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Huella del dispositivo',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Huella del dispositivo', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 180, comment: 'Huella del dispositivo' })
  deviceFingerprint?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Cadena user-agent',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Cadena user-agent', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 255, comment: 'Cadena user-agent' })
  userAgent?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'ACLs resueltas devueltas al autenticarse',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'ACLs resueltas devueltas al autenticarse', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'ACLs resueltas devueltas al autenticarse' })
  authenticatedUserAcls?: Record<string, any> = {};

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Momento del evento de autenticación',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Momento del evento de autenticación', nullable: false })
  @Column({ type: 'timestamp', nullable: false, comment: 'Momento del evento de autenticación' })
  occurredAt!: Date;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos del evento de autenticación',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos del evento de autenticación', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos operativos del evento de autenticación' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: successful-authentication-must-return-acls
    // Una autenticación exitosa debe devolver ACLs resueltas.
    if (!(this.authStatus === 'SUCCEEDED' && !(this.authenticatedUserAcls === undefined || this.authenticatedUserAcls === null || (typeof this.authenticatedUserAcls === 'string' && String(this.authenticatedUserAcls).trim() === '') || (Array.isArray(this.authenticatedUserAcls) && this.authenticatedUserAcls.length === 0) || (typeof this.authenticatedUserAcls === 'object' && !Array.isArray(this.authenticatedUserAcls) && Object.prototype.toString.call(this.authenticatedUserAcls) === '[object Object]' && Object.keys(Object(this.authenticatedUserAcls)).length === 0)))) {
      throw new Error('AUTH_001: La autenticación exitosa debe devolver ACLs');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'authentication';
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
  static fromDto(dto: CreateAuthenticationDto): Authentication;
  static fromDto(dto: UpdateAuthenticationDto): Authentication;
  static fromDto(dto: DeleteAuthenticationDto): Authentication;
  static fromDto(dto: any): Authentication {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(Authentication, dto);
  }
}
