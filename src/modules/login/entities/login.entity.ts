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
import { CreateLoginDto, UpdateLoginDto, DeleteLoginDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';


@Index('idx_login_correlation_code', ['correlationCode'], { unique: true })
@Index('idx_login_identifier_status', ['loginIdentifier', 'authStatus'])
@Index('idx_login_session_code', ['sessionCode'])
@Unique('uq_login_correlation_code', ['correlationCode'])
@ChildEntity('login')
@ObjectType()
export class Login extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de Login",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de Login", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia Login' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de Login",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de Login", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia Login' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del intento o flujo de login',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del intento o flujo de login', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, unique: true, comment: 'Código único del intento o flujo de login' })
  correlationCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Usuario autenticado cuando puede resolverse internamente',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Usuario autenticado cuando puede resolverse internamente', nullable: true })
  @Column({ type: 'uuid', nullable: true, comment: 'Usuario autenticado cuando puede resolverse internamente' })
  userId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Identificador usado por la persona para entrar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Identificador usado por la persona para entrar', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 150, comment: 'Identificador usado por la persona para entrar' })
  loginIdentifier!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Tipo de identificador recibido',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Tipo de identificador recibido', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 255, comment: 'Tipo de identificador recibido' })
  loginIdentifierType?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de flujo de autenticación o sesión',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de flujo de autenticación o sesión', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'PASSWORD', comment: 'Tipo de flujo de autenticación o sesión' })
  flowType!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Método efectivo de autenticación o federación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Método efectivo de autenticación o federación', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'LOCAL_PASSWORD', comment: 'Método efectivo de autenticación o federación' })
  authMethod!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Proveedor externo utilizado cuando aplica',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Proveedor externo utilizado cuando aplica', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, comment: 'Proveedor externo utilizado cuando aplica' })
  providerCode?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Aplicación o microservicio consumidor',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Aplicación o microservicio consumidor', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Aplicación o microservicio consumidor' })
  subscriberId?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Código de sesión correlacionado',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Código de sesión correlacionado', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Código de sesión correlacionado' })
  sessionCode?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Resultado del flujo de login',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Resultado del flujo de login', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'PENDING', comment: 'Resultado del flujo de login' })
  authStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo del fallo si el flujo no termina exitosamente',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo del fallo si el flujo no termina exitosamente', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 180, comment: 'Motivo del fallo si el flujo no termina exitosamente' })
  failureReason?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'IP reportada por el canal de entrada',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'IP reportada por el canal de entrada', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 64, comment: 'IP reportada por el canal de entrada' })
  ipAddress?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Huella del dispositivo cuando aplique',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Huella del dispositivo cuando aplique', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 180, comment: 'Huella del dispositivo cuando aplique' })
  deviceFingerprint?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Cadena user-agent del canal',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Cadena user-agent del canal', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 255, comment: 'Cadena user-agent del canal' })
  userAgent?: string = '';

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si el flujo emitió access token',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si el flujo emitió access token', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si el flujo emitió access token' })
  accessTokenIssued!: boolean;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si el flujo emitió refresh token o continuidad de sesión',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si el flujo emitió refresh token o continuidad de sesión', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si el flujo emitió refresh token o continuidad de sesión' })
  refreshTokenIssued!: boolean;

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si el flujo requiere PKCE',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si el flujo requiere PKCE', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: false, comment: 'Indica si el flujo requiere PKCE' })
  pkceRequired!: boolean;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'ACLs resueltas al completar la autenticación',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'ACLs resueltas al completar la autenticación', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'ACLs resueltas al completar la autenticación' })
  authenticatedUserAcls?: Record<string, any> = {};

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Momento del resultado del flujo',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Momento del resultado del flujo', nullable: false })
  @Column({ type: 'timestamp', nullable: false, comment: 'Momento del resultado del flujo' })
  occurredAt!: Date;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos del login',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos del login', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos operativos del login' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: successful-login-must-issue-session-material
    // Un login exitoso o renovado debe emitir material de sesión para que la aplicación pueda continuar operando.
    if (!(['SUCCEEDED', 'REFRESHED'].includes(this.authStatus) && this.accessTokenIssued === true)) {
      throw new Error('LOGIN_001: Un login exitoso o refrescado debe emitir token de acceso');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'login';
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
  static fromDto(dto: CreateLoginDto): Login;
  static fromDto(dto: UpdateLoginDto): Login;
  static fromDto(dto: DeleteLoginDto): Login;
  static fromDto(dto: any): Login {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(Login, dto);
  }
}
