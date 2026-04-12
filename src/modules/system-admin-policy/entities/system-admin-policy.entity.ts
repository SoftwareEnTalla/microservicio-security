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
import { CreateSystemAdminPolicyDto, UpdateSystemAdminPolicyDto, DeleteSystemAdminPolicyDto } from '../dtos/all-dto';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';


@Index('idx_system_admin_policy_admin_date', ['adminUserId', 'occurredAt'])
@ChildEntity('systemadminpolicy')
@ObjectType()
export class SystemAdminPolicy extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de SystemAdminPolicy",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de SystemAdminPolicy", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia SystemAdminPolicy' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de SystemAdminPolicy",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de SystemAdminPolicy", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia SystemAdminPolicy' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Administrador al que aplica la política o auditoría',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Administrador al que aplica la política o auditoría', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Administrador al que aplica la política o auditoría' })
  adminUserId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código de la política administrativa',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código de la política administrativa', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, comment: 'Código de la política administrativa' })
  policyCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Acción administrativa ejecutada o permitida',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Acción administrativa ejecutada o permitida', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 120, comment: 'Acción administrativa ejecutada o permitida' })
  actionType!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Tipo de objetivo administrado',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Tipo de objetivo administrado', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Tipo de objetivo administrado' })
  targetType?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador del objetivo',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Identificador del objetivo', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 120, comment: 'Identificador del objetivo' })
  targetId?: string = '';

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Resultado de la evaluación de política',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Resultado de la evaluación de política', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 255, default: 'AUDITED', comment: 'Resultado de la evaluación de política' })
  decision!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Motivo o justificación',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Motivo o justificación', nullable: true })
  @Column({ type: 'text', nullable: true, comment: 'Motivo o justificación' })
  reason?: string = '';

  @ApiProperty({
    type: () => Date,
    nullable: false,
    description: 'Fecha del evento administrativo',
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { description: 'Fecha del evento administrativo', nullable: false })
  @Column({ type: 'timestamp', nullable: false, comment: 'Fecha del evento administrativo' })
  occurredAt!: Date;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos de la política o auditoría',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos de la política o auditoría', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos de la política o auditoría' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: admin-policy-must-have-action
    // Toda política o auditoría administrativa debe definir acción.
    if (!(!(this.actionType === undefined || this.actionType === null || (typeof this.actionType === 'string' && String(this.actionType).trim() === '') || (Array.isArray(this.actionType) && this.actionType.length === 0) || (typeof this.actionType === 'object' && !Array.isArray(this.actionType) && Object.prototype.toString.call(this.actionType) === '[object Object]' && Object.keys(Object(this.actionType)).length === 0)))) {
      throw new Error('ADMIN_POLICY_001: La política administrativa requiere actionType');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'systemadminpolicy';
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
  static fromDto(dto: CreateSystemAdminPolicyDto): SystemAdminPolicy;
  static fromDto(dto: UpdateSystemAdminPolicyDto): SystemAdminPolicy;
  static fromDto(dto: DeleteSystemAdminPolicyDto): SystemAdminPolicy;
  static fromDto(dto: any): SystemAdminPolicy {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(SystemAdminPolicy, dto);
  }
}
