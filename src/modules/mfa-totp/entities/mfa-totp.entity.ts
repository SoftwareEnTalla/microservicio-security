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
import { CreateMfaTotpDto, UpdateMfaTotpDto, DeleteMfaTotpDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';


@Index('idx_mfa_totp_user_id', ['userId'], { unique: true })
@Unique('uq_mfa_totp_user_id', ['userId'])
@ChildEntity('mfatotp')
@ObjectType()
export class MfaTotp extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de MfaTotp",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de MfaTotp", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia MfaTotp' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de MfaTotp",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de MfaTotp", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia MfaTotp' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Usuario dueño de la configuración MFA',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Usuario dueño de la configuración MFA', nullable: false })
  @Column({ type: 'uuid', nullable: false, unique: true, comment: 'Usuario dueño de la configuración MFA' })
  userId!: string;

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
    type: () => String,
    nullable: false,
    description: 'Modo de MFA',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Modo de MFA', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'OPTIONAL', comment: 'Modo de MFA' })
  mfaMode!: string;

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
    type: () => String,
    nullable: true,
    description: 'Referencia segura al secreto TOTP',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia segura al secreto TOTP', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 255, comment: 'Referencia segura al secreto TOTP' })
  totpSecretRef?: string = '';

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Versión del set de códigos de recuperación',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Versión del set de códigos de recuperación', nullable: false })
  @Column({ type: 'int', nullable: false, default: 1, comment: 'Versión del set de códigos de recuperación' })
  recoveryCodesVersion!: number;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado del reto MFA',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado del reto MFA', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'NOT_REQUIRED', comment: 'Estado del reto MFA' })
  challengeStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Tipo de challenge MFA',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Tipo de challenge MFA', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 255, comment: 'Tipo de challenge MFA' })
  challengeType?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Última verificación exitosa',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Última verificación exitosa', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Última verificación exitosa' })
  verifiedAt?: Date = new Date();

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Último uso de MFA',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Último uso de MFA', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Último uso de MFA' })
  lastUsedAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos de configuración MFA',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos de configuración MFA', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos de configuración MFA' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: totp-enabled-requires-secret
    // No se puede habilitar TOTP sin una referencia válida al secreto.
    if (!(this.totpEnabled === true && !(this.totpSecretRef === undefined || this.totpSecretRef === null || (typeof this.totpSecretRef === 'string' && String(this.totpSecretRef).trim() === '') || (Array.isArray(this.totpSecretRef) && this.totpSecretRef.length === 0) || (typeof this.totpSecretRef === 'object' && !Array.isArray(this.totpSecretRef) && Object.prototype.toString.call(this.totpSecretRef) === '[object Object]' && Object.keys(Object(this.totpSecretRef)).length === 0)))) {
      throw new Error('MFA_001: TOTP habilitado requiere secreto configurado');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'mfatotp';
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
  static fromDto(dto: CreateMfaTotpDto): MfaTotp;
  static fromDto(dto: UpdateMfaTotpDto): MfaTotp;
  static fromDto(dto: DeleteMfaTotpDto): MfaTotp;
  static fromDto(dto: any): MfaTotp {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(MfaTotp, dto);
  }
}
