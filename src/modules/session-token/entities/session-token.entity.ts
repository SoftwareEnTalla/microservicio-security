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
import { CreateSessionTokenDto, UpdateSessionTokenDto, DeleteSessionTokenDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';


@Index('idx_session_token_session_code', ['sessionCode'], { unique: true })
@Index('idx_session_token_token_id', ['tokenId'], { unique: true })
@Unique('uq_session_token_session_code', ['sessionCode'])
@Unique('uq_session_token_token_id', ['tokenId'])
@ChildEntity('sessiontoken')
@ObjectType()
export class SessionToken extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de SessionToken",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de SessionToken", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia SessionToken' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de SessionToken",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de SessionToken", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia SessionToken' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Usuario dueño de la sesión',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Usuario dueño de la sesión', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Usuario dueño de la sesión' })
  userId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Aplicación o microservicio suscrito',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Aplicación o microservicio suscrito', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Aplicación o microservicio suscrito' })
  subscriberId?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único de sesión',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único de sesión', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, unique: true, comment: 'Código único de sesión' })
  sessionCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Identificador del token',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Identificador del token', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 180, unique: true, comment: 'Identificador del token' })
  tokenId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de token o artefacto de seguridad',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de token o artefacto de seguridad', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, comment: 'Tipo de token o artefacto de seguridad' })
  tokenType!: string;

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Fecha de emisión',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Fecha de emisión', nullable: false })
  @Column({ type: 'timestamp', nullable: false, comment: 'Fecha de emisión' })
  issuedAt!: Date;

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Fecha de expiración',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Fecha de expiración', nullable: false })
  @Column({ type: 'timestamp', nullable: false, comment: 'Fecha de expiración' })
  expiresAt!: Date;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de revocación',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de revocación', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de revocación' })
  revokedAt?: Date = new Date();

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo de revocación',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo de revocación', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 150, comment: 'Motivo de revocación' })
  revocationReason?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de cierre de sesión',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de cierre de sesión', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de cierre de sesión' })
  logoutAt?: Date = new Date();

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado del token o sesión',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado del token o sesión', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'ISSUED', comment: 'Estado del token o sesión' })
  certificationStatus!: string;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'ACLs devueltas en refresh o revalidación',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'ACLs devueltas en refresh o revalidación', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'ACLs devueltas en refresh o revalidación' })
  authenticatedUserAcls?: Record<string, any> = {};

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del token o sesión',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del token o sesión', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos del token o sesión' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: token-must-have-validity-window
    // Todo token debe tener ventana de validez definida.
    if (!(!(this.issuedAt === undefined || this.issuedAt === null || (typeof this.issuedAt === 'string' && String(this.issuedAt).trim() === '') || (Array.isArray(this.issuedAt) && this.issuedAt.length === 0) || (typeof this.issuedAt === 'object' && !Array.isArray(this.issuedAt) && Object.prototype.toString.call(this.issuedAt) === '[object Object]' && Object.keys(Object(this.issuedAt)).length === 0)) && !(this.expiresAt === undefined || this.expiresAt === null || (typeof this.expiresAt === 'string' && String(this.expiresAt).trim() === '') || (Array.isArray(this.expiresAt) && this.expiresAt.length === 0) || (typeof this.expiresAt === 'object' && !Array.isArray(this.expiresAt) && Object.prototype.toString.call(this.expiresAt) === '[object Object]' && Object.keys(Object(this.expiresAt)).length === 0)))) {
      throw new Error('TOKEN_001: El token requiere fechas de emisión y expiración');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'sessiontoken';
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
  static fromDto(dto: CreateSessionTokenDto): SessionToken;
  static fromDto(dto: UpdateSessionTokenDto): SessionToken;
  static fromDto(dto: DeleteSessionTokenDto): SessionToken;
  static fromDto(dto: any): SessionToken {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(SessionToken, dto);
  }
}
