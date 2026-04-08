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
import { CreateUserProfileDto, UpdateUserProfileDto, DeleteUserProfileDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { plainToInstance } from 'class-transformer';


@Index('idx_user_profile_user_id', ['userId'], { unique: true })
@Unique('uq_user_profile_user_id', ['userId'])
@ChildEntity('userprofile')
@ObjectType()
export class UserProfile extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de UserProfile",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de UserProfile", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia UserProfile' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de UserProfile",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de UserProfile", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia UserProfile' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Referencia al usuario dueño del perfil',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Referencia al usuario dueño del perfil', nullable: false })
  @Column({ type: 'uuid', nullable: false, unique: true, comment: 'Referencia al usuario dueño del perfil' })
  userId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Nombre',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Nombre', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Nombre' })
  firstName?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Apellidos',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Apellidos', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Apellidos' })
  lastName?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'URL de la foto de perfil',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'URL de la foto de perfil', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 250, comment: 'URL de la foto de perfil' })
  profilePhotoUrl?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Idioma preferido',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Idioma preferido', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 15, comment: 'Idioma preferido' })
  language?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'País',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'País', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, comment: 'País' })
  country?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Provincia o estado',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Provincia o estado', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, comment: 'Provincia o estado' })
  stateOrProvince?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Ciudad',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Ciudad', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, comment: 'Ciudad' })
  city?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Dirección física',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Dirección física', nullable: true })
  @Column({ type: 'text', nullable: true, comment: 'Dirección física' })
  address?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos del perfil',
  })
  @IsObject()
  @IsOptional()
  @Field(() => String, { description: 'Metadatos del perfil', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos del perfil' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: profile-must-reference-user
    // Todo perfil debe estar asociado a un usuario.
    if (!(!(this.userId === undefined || this.userId === null || (typeof this.userId === 'string' && String(this.userId).trim() === '') || (Array.isArray(this.userId) && this.userId.length === 0) || (typeof this.userId === 'object' && !Array.isArray(this.userId) && Object.prototype.toString.call(this.userId) === '[object Object]' && Object.keys(Object(this.userId)).length === 0)))) {
      throw new Error('USER_PROFILE_001: El perfil requiere referencia a user');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'userprofile';
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
  static fromDto(dto: CreateUserProfileDto): UserProfile;
  static fromDto(dto: UpdateUserProfileDto): UserProfile;
  static fromDto(dto: DeleteUserProfileDto): UserProfile;
  static fromDto(dto: any): UserProfile {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(UserProfile, dto);
  }
}
