import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from './role.entity';

@Entity('rbac_user_role_assignments')
@Unique('uq_user_role', ['userId', 'roleId'])
@Index('idx_ura_user', ['userId'])
@Index('idx_ura_role', ['roleId'])
@Index('idx_ura_active', ['userId', 'isActive'])
@ObjectType()
export class UserRoleAssignment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String, description: 'Identificador único de la asignación' })
  @Field(() => String, { nullable: false })
  id!: string;

  @ApiProperty({ type: String, description: 'ID del usuario al que se asigna el rol' })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'ID del usuario' })
  userId!: string;

  @ApiProperty({ type: String, description: 'ID del rol asignado' })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'ID del rol' })
  roleId!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Usuario que realizó la asignación' })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 150, nullable: true, comment: 'Asignado por' })
  assignedBy?: string;

  @CreateDateColumn({ type: 'timestamp', comment: 'Fecha de asignación' })
  @Field(() => Date, { nullable: false })
  assignedAt!: Date;

  @ApiProperty({ type: Date, nullable: true, description: 'Fecha de revocación' })
  @IsOptional()
  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de revocación' })
  revokedAt?: Date;

  @ApiProperty({ type: Boolean, description: 'Indica si la asignación está activa' })
  @IsBoolean()
  @Field(() => Boolean, { nullable: false })
  @Column({ type: 'boolean', default: true, comment: 'Asignación activa' })
  isActive!: boolean;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role?: Role;
}
