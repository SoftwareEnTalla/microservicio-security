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
import { CreateSecurityMasterDataDto, UpdateSecurityMasterDataDto, DeleteSecurityMasterDataDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';


@Index('idx_security_master_data_code', ['code'], { unique: true })
@Index('idx_security_master_data_category_sort', ['category', 'sortOrder'])
@Unique('uq_security_master_data_code', ['code'])
@ChildEntity('securitymasterdata')
@ObjectType()
export class SecurityMasterData extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de SecurityMasterData",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de SecurityMasterData", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia SecurityMasterData' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de SecurityMasterData",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de SecurityMasterData", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia SecurityMasterData' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Categoría del dato maestro de seguridad',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Categoría del dato maestro de seguridad', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, comment: 'Categoría del dato maestro de seguridad' })
  category!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código del valor de catálogo',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código del valor de catálogo', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, unique: true, comment: 'Código del valor de catálogo' })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Nombre visible',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Nombre visible', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 180, comment: 'Nombre visible' })
  displayName!: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Orden de visualización',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Orden de visualización', nullable: false })
  @Column({ type: 'int', nullable: false, default: 0, comment: 'Orden de visualización' })
  sortOrder!: number;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del dato maestro',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del dato maestro', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos del dato maestro' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: security-master-data-must-have-category
    // Todo dato maestro de seguridad debe declarar categoría y código.
    if (!(!(this.category === undefined || this.category === null || (typeof this.category === 'string' && String(this.category).trim() === '') || (Array.isArray(this.category) && this.category.length === 0) || (typeof this.category === 'object' && !Array.isArray(this.category) && Object.prototype.toString.call(this.category) === '[object Object]' && Object.keys(Object(this.category)).length === 0)) && !(this.code === undefined || this.code === null || (typeof this.code === 'string' && String(this.code).trim() === '') || (Array.isArray(this.code) && this.code.length === 0) || (typeof this.code === 'object' && !Array.isArray(this.code) && Object.prototype.toString.call(this.code) === '[object Object]' && Object.keys(Object(this.code)).length === 0)))) {
      throw new Error('SEC_MD_001: El dato maestro de seguridad requiere categoría y código');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'securitymasterdata';
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
  static fromDto(dto: CreateSecurityMasterDataDto): SecurityMasterData;
  static fromDto(dto: UpdateSecurityMasterDataDto): SecurityMasterData;
  static fromDto(dto: DeleteSecurityMasterDataDto): SecurityMasterData;
  static fromDto(dto: any): SecurityMasterData {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(SecurityMasterData, dto);
  }
}
