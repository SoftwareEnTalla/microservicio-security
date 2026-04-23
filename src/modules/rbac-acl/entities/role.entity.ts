import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@Entity('rbac_roles')
@Unique('uq_role_code', ['roleCode'])
@Index('idx_role_code', ['roleCode'], { unique: true })
@ObjectType()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String, description: 'Identificador único del rol' })
  @Field(() => String, { nullable: false })
  id!: string;

  @ApiProperty({ type: String, description: 'Código único del rol (USER, MERCHANT, ADMIN, SALES_MANAGER, etc.)' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true, comment: 'Código único del rol' })
  roleCode!: string;

  @ApiProperty({ type: String, description: 'Nombre descriptivo del rol' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', length: 120, nullable: false, comment: 'Nombre descriptivo del rol' })
  roleName!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Descripción extendida del rol' })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, default: '', comment: 'Descripción del rol' })
  description?: string;

  @ApiProperty({ type: Boolean, description: 'Indica si el rol está activo' })
  @IsBoolean()
  @Field(() => Boolean, { nullable: false })
  @Column({ type: 'boolean', nullable: false, default: true, comment: 'Estado activo del rol' })
  isActive!: boolean;

  @ApiProperty({ type: Object, nullable: true, description: 'Metadatos del rol' })
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
