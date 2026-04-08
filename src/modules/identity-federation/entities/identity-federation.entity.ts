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
import { CreateIdentityFederationDto, UpdateIdentityFederationDto, DeleteIdentityFederationDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';


@Index('idx_identity_federation_code', ['code'], { unique: true })
@Unique('uq_identity_federation_code', ['code'])
@ChildEntity('identityfederation')
@ObjectType()
export class IdentityFederation extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de IdentityFederation",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de IdentityFederation", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia IdentityFederation' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de IdentityFederation",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de IdentityFederation", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia IdentityFederation' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código interno del proveedor o conexión federada',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código interno del proveedor o conexión federada', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, unique: true, comment: 'Código interno del proveedor o conexión federada' })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Proveedor de identidad',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Proveedor de identidad', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'GENERIC', comment: 'Proveedor de identidad' })
  providerType!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Familia de protocolo',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Familia de protocolo', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, comment: 'Familia de protocolo' })
  protocolFamily!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Versión concreta del protocolo',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Versión concreta del protocolo', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 20, comment: 'Versión concreta del protocolo' })
  protocolVersion!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Issuer o entidad emisora',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Issuer o entidad emisora', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 250, comment: 'Issuer o entidad emisora' })
  issuer?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de autorización',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de autorización', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 250, comment: 'URL de autorización' })
  authorizationUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de obtención de token',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de obtención de token', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 250, comment: 'URL de obtención de token' })
  tokenUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de JWKS o claves',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de JWKS o claves', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 250, comment: 'URL de JWKS o claves' })
  jwksUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de userinfo o perfil',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de userinfo o perfil', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 250, comment: 'URL de userinfo o perfil' })
  userInfoUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Client id o identificador del RP/SP',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Client id o identificador del RP/SP', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 180, comment: 'Client id o identificador del RP/SP' })
  clientId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Referencia segura al secreto',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Referencia segura al secreto', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 255, comment: 'Referencia segura al secreto' })
  clientSecretRef?: string = '';

  @ApiProperty({
    type: () => Boolean,
    nullable: false,
    description: 'Indica si la integración está habilitada',
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { description: 'Indica si la integración está habilitada', nullable: false })
  @Column({ type: 'boolean', nullable: false, default: true, comment: 'Indica si la integración está habilitada' })
  enabled!: boolean;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Política de mapeo de claims',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Política de mapeo de claims', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Política de mapeo de claims' })
  claimMappingPolicy?: Record<string, any> = {};

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del proveedor federado',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del proveedor federado', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos del proveedor federado' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: enabled-provider-must-have-protocol
    // Toda integración federada habilitada debe declarar familia y versión de protocolo.
    if (!(!(this.protocolFamily === undefined || this.protocolFamily === null || (typeof this.protocolFamily === 'string' && String(this.protocolFamily).trim() === '') || (Array.isArray(this.protocolFamily) && this.protocolFamily.length === 0) || (typeof this.protocolFamily === 'object' && !Array.isArray(this.protocolFamily) && Object.prototype.toString.call(this.protocolFamily) === '[object Object]' && Object.keys(Object(this.protocolFamily)).length === 0)) && !(this.protocolVersion === undefined || this.protocolVersion === null || (typeof this.protocolVersion === 'string' && String(this.protocolVersion).trim() === '') || (Array.isArray(this.protocolVersion) && this.protocolVersion.length === 0) || (typeof this.protocolVersion === 'object' && !Array.isArray(this.protocolVersion) && Object.prototype.toString.call(this.protocolVersion) === '[object Object]' && Object.keys(Object(this.protocolVersion)).length === 0)))) {
      throw new Error('FEDERATION_001: La federación requiere familia y versión de protocolo');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'identityfederation';
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
  static fromDto(dto: CreateIdentityFederationDto): IdentityFederation;
  static fromDto(dto: UpdateIdentityFederationDto): IdentityFederation;
  static fromDto(dto: DeleteIdentityFederationDto): IdentityFederation;
  static fromDto(dto: any): IdentityFederation {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(IdentityFederation, dto);
  }
}
