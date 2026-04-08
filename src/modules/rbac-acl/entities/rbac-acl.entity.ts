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
import { CreateRbacAclDto, UpdateRbacAclDto, DeleteRbacAclDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';


@Index('idx_rbac_acl_role_permission', ['roleCode', 'permissionCode'])
@Index('idx_rbac_acl_user_resource', ['userId', 'resource'])
@ChildEntity('rbacacl')
@ObjectType()
export class RbacAcl extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de RbacAcl",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de RbacAcl", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia RbacAcl' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de RbacAcl",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de RbacAcl", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia RbacAcl' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del rol',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del rol', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, comment: 'Código del rol' })
  roleCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Nombre descriptivo del rol',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Nombre descriptivo del rol', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, comment: 'Nombre descriptivo del rol' })
  roleName!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del permiso',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del permiso', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, comment: 'Código del permiso' })
  permissionCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Recurso protegido',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Recurso protegido', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, comment: 'Recurso protegido' })
  resource!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Acción autorizada',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Acción autorizada', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, comment: 'Acción autorizada' })
  action!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Ámbito del permiso',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Ámbito del permiso', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Ámbito del permiso' })
  scope?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Efecto del permiso',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Efecto del permiso', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'ALLOW', comment: 'Efecto del permiso' })
  effect!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Usuario al que aplica la ACL si está materializada',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Usuario al que aplica la ACL si está materializada', nullable: true })
  @Column({ type: 'uuid', nullable: true, comment: 'Usuario al que aplica la ACL si está materializada' })
  userId?: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Fecha de asignación',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Fecha de asignación', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de asignación' })
  assignedAt?: Date = new Date();

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
    type: () => Object,
    nullable: true,
    description: 'Metadatos de autorización',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos de autorización', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos de autorización' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: acl-must-have-resource-and-action
    // Toda ACL debe definir recurso y acción.
    if (!(!(this.resource === undefined || this.resource === null || (typeof this.resource === 'string' && String(this.resource).trim() === '') || (Array.isArray(this.resource) && this.resource.length === 0) || (typeof this.resource === 'object' && !Array.isArray(this.resource) && Object.prototype.toString.call(this.resource) === '[object Object]' && Object.keys(Object(this.resource)).length === 0)) && !(this.action === undefined || this.action === null || (typeof this.action === 'string' && String(this.action).trim() === '') || (Array.isArray(this.action) && this.action.length === 0) || (typeof this.action === 'object' && !Array.isArray(this.action) && Object.prototype.toString.call(this.action) === '[object Object]' && Object.keys(Object(this.action)).length === 0)))) {
      throw new Error('RBAC_001: La ACL requiere recurso y acción');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'rbacacl';
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
  static fromDto(dto: CreateRbacAclDto): RbacAcl;
  static fromDto(dto: UpdateRbacAclDto): RbacAcl;
  static fromDto(dto: DeleteRbacAclDto): RbacAcl;
  static fromDto(dto: any): RbacAcl {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(RbacAcl, dto);
  }
}
