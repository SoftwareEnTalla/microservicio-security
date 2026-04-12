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
import { CreateSecurityMerchantDto, UpdateSecurityMerchantDto, DeleteSecurityMerchantDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';


@Index('idx_security_merchant_user_id', ['userId'], { unique: true })
@Index('idx_security_merchant_code', ['merchantCode'], { unique: true })
@Unique('uq_security_merchant_user_id', ['userId'])
@Unique('uq_security_merchant_code', ['merchantCode'])
@ChildEntity('securitymerchant')
@ObjectType()
export class SecurityMerchant extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de SecurityMerchant",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de SecurityMerchant", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia SecurityMerchant' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de SecurityMerchant",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de SecurityMerchant", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia SecurityMerchant' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Referencia al user canónico',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Referencia al user canónico', nullable: false })
  @Column({ type: 'uuid', nullable: false, unique: true, comment: 'Referencia al user canónico' })
  userId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del comercio',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del comercio', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, unique: true, comment: 'Código único del comercio' })
  merchantCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Representante legal',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Representante legal', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 180, comment: 'Representante legal' })
  legalRepresentative?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Razón social o entidad jurídica',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Razón social o entidad jurídica', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 180, comment: 'Razón social o entidad jurídica' })
  legalEntityName?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Medios de cobro del merchant',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Medios de cobro del merchant', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Medios de cobro del merchant' })
  collectionMethods?: Record<string, any> = {};

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Cuentas bancarias del merchant',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Cuentas bancarias del merchant', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Cuentas bancarias del merchant' })
  bankAccounts?: Record<string, any> = {};

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado de aprobación operativa',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado de aprobación operativa', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'PENDING', comment: 'Estado de aprobación operativa' })
  approvalStatus!: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de aprobación',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de aprobación', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de aprobación' })
  approvedAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del merchant',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos del merchant', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos del merchant' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: approved-merchant-must-have-code
    // Todo merchant aprobado debe tener código comercial.
    if (!(!(this.merchantCode === undefined || this.merchantCode === null || (typeof this.merchantCode === 'string' && String(this.merchantCode).trim() === '') || (Array.isArray(this.merchantCode) && this.merchantCode.length === 0) || (typeof this.merchantCode === 'object' && !Array.isArray(this.merchantCode) && Object.prototype.toString.call(this.merchantCode) === '[object Object]' && Object.keys(Object(this.merchantCode)).length === 0)))) {
      throw new Error('SEC_MERCHANT_001: El merchant requiere merchantCode');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'securitymerchant';
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
  static fromDto(dto: CreateSecurityMerchantDto): SecurityMerchant;
  static fromDto(dto: UpdateSecurityMerchantDto): SecurityMerchant;
  static fromDto(dto: DeleteSecurityMerchantDto): SecurityMerchant;
  static fromDto(dto: any): SecurityMerchant {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(SecurityMerchant, dto);
  }
}
