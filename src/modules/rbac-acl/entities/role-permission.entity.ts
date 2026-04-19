import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('rbac_role_permissions')
@Unique('uq_role_permission', ['roleId', 'permissionId'])
@Index('idx_role_permission_role', ['roleId'])
@Index('idx_role_permission_perm', ['permissionId'])
@ObjectType()
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String, description: 'Identificador único de la asignación rol-permiso' })
  @Field(() => String, { nullable: false })
  id!: string;

  @ApiProperty({ type: String, description: 'ID del rol' })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'ID del rol' })
  roleId!: string;

  @ApiProperty({ type: String, description: 'ID del permiso' })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'ID del permiso' })
  permissionId!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Usuario que realizó la asignación' })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 150, nullable: true, comment: 'Asignado por' })
  assignedBy?: string;

  @CreateDateColumn({ type: 'timestamp', comment: 'Fecha de asignación' })
  @Field(() => Date, { nullable: false })
  assignedAt!: Date;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission?: Permission;
}
