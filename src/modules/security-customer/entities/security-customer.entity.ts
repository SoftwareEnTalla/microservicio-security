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
import { CreateSecurityCustomerDto, UpdateSecurityCustomerDto, DeleteSecurityCustomerDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';


@Index('idx_security_customer_user_id', ['userId'], { unique: true })
@Unique('uq_security_customer_user_id', ['userId'])
@ChildEntity('securitycustomer')
@ObjectType()
export class SecurityCustomer extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de SecurityCustomer",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de SecurityCustomer", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia SecurityCustomer' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de SecurityCustomer",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de SecurityCustomer", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia SecurityCustomer' })
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
    description: 'Nivel de riesgo del customer',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Nivel de riesgo del customer', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'LOW', comment: 'Nivel de riesgo del customer' })
  riskLevel!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia externa del customer',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia externa del customer', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Referencia externa del customer' })
  externalReference?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Medios de pago asociados al customer',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Medios de pago asociados al customer', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Medios de pago asociados al customer' })
  paymentMethods?: Record<string, any> = {};

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del customer en security',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del customer en security', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos del customer en security' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: security-customer-must-reference-user
    // Todo security-customer debe referenciar un user base.
    if (!(!(this.userId === undefined || this.userId === null || (typeof this.userId === 'string' && String(this.userId).trim() === '') || (Array.isArray(this.userId) && this.userId.length === 0) || (typeof this.userId === 'object' && !Array.isArray(this.userId) && Object.prototype.toString.call(this.userId) === '[object Object]' && Object.keys(Object(this.userId)).length === 0)))) {
      throw new Error('SEC_CUSTOMER_001: El customer debe referenciar un user');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'securitycustomer';
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
  static fromDto(dto: CreateSecurityCustomerDto): SecurityCustomer;
  static fromDto(dto: UpdateSecurityCustomerDto): SecurityCustomer;
  static fromDto(dto: DeleteSecurityCustomerDto): SecurityCustomer;
  static fromDto(dto: any): SecurityCustomer {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(SecurityCustomer, dto);
  }
}
