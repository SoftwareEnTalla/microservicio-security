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
import { CreateCatalogSyncLogDto, UpdateCatalogSyncLogDto, DeleteCatalogSyncLogDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';


@Index('idx_catalog_sync_log_category', ['categoryCode'])
@Index('idx_catalog_sync_log_synced_at', ['syncedAt'])
@Index('idx_catalog_sync_log_outcome', ['outcome'])
@ChildEntity('catalogsynclog')
@ObjectType()
export class CatalogSyncLog extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de CatalogSyncLog",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de CatalogSyncLog", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia CatalogSyncLog' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de CatalogSyncLog",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de CatalogSyncLog", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia CatalogSyncLog' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Categoría sincronizada (CURRENCY, APPROVAL_STATUS, ...)',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Categoría sincronizada (CURRENCY, APPROVAL_STATUS, ...)', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, comment: 'Categoría sincronizada (CURRENCY, APPROVAL_STATUS, ...)' })
  categoryCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Qué disparó el sync',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Qué disparó el sync', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'SCHEDULED', comment: 'Qué disparó el sync' })
  triggeredBy!: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Cantidad de ítems nuevos añadidos',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Cantidad de ítems nuevos añadidos', nullable: false })
  @Column({ type: 'int', nullable: false, default: 0, comment: 'Cantidad de ítems nuevos añadidos' })
  itemsAddedCount!: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Cantidad de ítems actualizados',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Cantidad de ítems actualizados', nullable: false })
  @Column({ type: 'int', nullable: false, default: 0, comment: 'Cantidad de ítems actualizados' })
  itemsUpdatedCount!: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Cantidad de ítems removidos/archivados',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Cantidad de ítems removidos/archivados', nullable: false })
  @Column({ type: 'int', nullable: false, default: 0, comment: 'Cantidad de ítems removidos/archivados' })
  itemsRemovedCount!: number;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Diff detallado (added[], updated[], removed[])',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Diff detallado (added[], updated[], removed[])', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Diff detallado (added[], updated[], removed[])' })
  diffSnapshot?: Record<string, any> = {};

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Causa del sync',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Causa del sync', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 500, comment: 'Causa del sync' })
  reason?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Versión reportada por catalog',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Versión reportada por catalog', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 20, comment: 'Versión reportada por catalog' })
  catalogVersion?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Hash SHA-256 del contenido remoto',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Hash SHA-256 del contenido remoto', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, comment: 'Hash SHA-256 del contenido remoto' })
  catalogHash?: string = '';

  @ApiProperty({
    type: () => Number,
    nullable: true,
    description: 'Duración de la operación (ms)',
  })
  @IsInt()
  @IsOptional()
  @Field(() => Int, { description: 'Duración de la operación (ms)', nullable: true })
  @Column({ type: 'int', nullable: true, comment: 'Duración de la operación (ms)' })
  durationMs?: number = 0;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Resultado del ciclo de sync',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Resultado del ciclo de sync', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'SUCCESS', comment: 'Resultado del ciclo de sync' })
  outcome!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Mensaje de error si outcome=ERROR',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Mensaje de error si outcome=ERROR', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 1000, comment: 'Mensaje de error si outcome=ERROR' })
  errorMessage?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Momento de finalización del sync',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Momento de finalización del sync', nullable: false })
  @Column({ type: 'timestamp', nullable: false, comment: 'Momento de finalización del sync' })
  syncedAt!: Date;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos libres',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos libres', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos libres' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: sync-log-requires-category
    // El log de sync requiere categoryCode.
    if (!(!(this.categoryCode === undefined || this.categoryCode === null || (typeof this.categoryCode === 'string' && String(this.categoryCode).trim() === '') || (Array.isArray(this.categoryCode) && this.categoryCode.length === 0) || (typeof this.categoryCode === 'object' && !Array.isArray(this.categoryCode) && Object.prototype.toString.call(this.categoryCode) === '[object Object]' && Object.keys(Object(this.categoryCode)).length === 0)))) {
      throw new Error('CAT_SYNC_001: categoryCode requerido');
    }

    // Rule: sync-log-requires-synced-at
    // El log de sync requiere syncedAt.
    if (!(!(this.syncedAt === undefined || this.syncedAt === null || (typeof this.syncedAt === 'string' && String(this.syncedAt).trim() === '') || (Array.isArray(this.syncedAt) && this.syncedAt.length === 0) || (typeof this.syncedAt === 'object' && !Array.isArray(this.syncedAt) && Object.prototype.toString.call(this.syncedAt) === '[object Object]' && Object.keys(Object(this.syncedAt)).length === 0)))) {
      throw new Error('CAT_SYNC_002: syncedAt requerido');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'catalogsynclog';
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
  static fromDto(dto: CreateCatalogSyncLogDto): CatalogSyncLog;
  static fromDto(dto: UpdateCatalogSyncLogDto): CatalogSyncLog;
  static fromDto(dto: DeleteCatalogSyncLogDto): CatalogSyncLog;
  static fromDto(dto: any): CatalogSyncLog {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(CatalogSyncLog, dto);
  }
}
