import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@Entity('rbac_permissions')
@Unique('uq_permission_code', ['permissionCode'])
@Index('idx_permission_code', ['permissionCode'], { unique: true })
@Index('idx_permission_resource_action', ['resource', 'action'])
@ObjectType()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String, description: 'Identificador único del permiso' })
  @Field(() => String, { nullable: false })
  id!: string;

  @ApiProperty({ type: String, description: 'Código único del permiso' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', length: 120, nullable: false, unique: true, comment: 'Código único del permiso' })
  permissionCode!: string;

  @ApiProperty({ type: String, description: 'Recurso protegido (e.g., users, orders, products)' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', length: 120, nullable: false, comment: 'Recurso protegido' })
  resource!: string;

  @ApiProperty({ type: String, description: 'Acción autorizada (create, read, update, delete, execute, *)' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', length: 120, nullable: false, comment: 'Acción autorizada' })
  action!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Ámbito del permiso (own, team, all)' })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 120, nullable: true, default: 'all', comment: 'Ámbito del permiso' })
  scope?: string;

  @ApiProperty({ type: String, description: 'Efecto del permiso: ALLOW o DENY' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', length: 10, nullable: false, default: 'ALLOW', comment: 'Efecto: ALLOW o DENY' })
  effect!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Descripción del permiso' })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, default: '', comment: 'Descripción del permiso' })
  description?: string;

  @ApiProperty({ type: Boolean, description: 'Indica si el permiso está activo' })
  @IsBoolean()
  @Field(() => Boolean, { nullable: false })
  @Column({ type: 'boolean', nullable: false, default: true, comment: 'Estado activo del permiso' })
  isActive!: boolean;

  @ApiProperty({ type: Object, nullable: true, description: 'Metadatos del permiso' })
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos adicionales' })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', comment: 'Fecha de creación' })
  @Field(() => Date, { nullable: false })
  creationDate!: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: 'Fecha de modificación' })
  @Field(() => Date, { nullable: false })
  modificationDate!: Date;
}
