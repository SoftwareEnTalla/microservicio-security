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
import { CreateAuthMethodDto, UpdateAuthMethodDto, DeleteAuthMethodDto } from '../dtos/all-dto';
import { IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';


@Index('idx_auth_method_code', ['code'], { unique: true })
@Unique('uq_auth_method_code', ['code'])
@ChildEntity('authmethod')
@ObjectType()
export class AuthMethod extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de AuthMethod",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de AuthMethod", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia AuthMethod' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de AuthMethod",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de AuthMethod", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia AuthMethod' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Codigo del nomenclador',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Codigo del nomenclador', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, unique: true, comment: 'Codigo del nomenclador' })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Nombre visible',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Nombre visible', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, comment: 'Nombre visible' })
  displayName!: string;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Configuracion adicional',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Configuracion adicional', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Configuracion adicional' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // No se definieron business-rules en el DSL.
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'authmethod';
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
  static fromDto(dto: CreateAuthMethodDto): AuthMethod;
  static fromDto(dto: UpdateAuthMethodDto): AuthMethod;
  static fromDto(dto: DeleteAuthMethodDto): AuthMethod;
  static fromDto(dto: any): AuthMethod {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(AuthMethod, dto);
  }
}
