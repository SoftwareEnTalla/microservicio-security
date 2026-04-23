import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { RoleCreatedEvent } from '../events/rolecreated.event';
import { RoleUpdatedEvent } from '../events/roleupdated.event';
import { RoleDeactivatedEvent } from '../events/roledeactivated.event';
import { RoleDeletedEvent } from '../events/roledeleted.event';
import { UserRoleAssignment } from '../entities/user-role-assignment.entity';
import { logger } from '@core/logs/logger';

@Injectable()
export class RoleCommandService {
  private readonly log = new Logger(RoleCommandService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRoleAssignment)
    private readonly uraRepo: Repository<UserRoleAssignment>,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
  ) {}

  async createRole(data: Partial<Role>, userId: string): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { roleCode: data.roleCode } });
    if (existing) {
      throw new ConflictException(`El rol con código '${data.roleCode}' ya existe.`);
    }
    const role = this.roleRepo.create(data);
    const saved = await this.roleRepo.save(role);
    const event = RoleCreatedEvent.create(saved.id, saved, userId);
    await this.publishEvent(event);
    logger.info('Rol creado:', saved.id);
    return saved;
  }

  async updateRole(id: string, data: Partial<Role>, userId: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Rol ${id} no encontrado.`);
    Object.assign(role, data);
    const saved = await this.roleRepo.save(role);
    const event = RoleUpdatedEvent.create(saved.id, saved, userId);
    await this.publishEvent(event);
    logger.info('Rol actualizado:', saved.id);
    return saved;
  }

  async deactivateRole(id: string, userId: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Rol ${id} no encontrado.`);
    role.isActive = false;
    const saved = await this.roleRepo.save(role);
    const event = RoleDeactivatedEvent.create(saved.id, saved, userId);
    await this.publishEvent(event);
    logger.info('Rol desactivado:', saved.id);
    return saved;
  }

  async deleteRole(id: string, userId: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Rol ${id} no encontrado.`);
    // Regla: role-cannot-be-deleted-if-assigned
    const assignmentCount = await this.uraRepo.count({
      where: { roleId: id, isActive: true },
    });
    if (assignmentCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol '${role.roleCode}': tiene ${assignmentCount} usuario(s) asignado(s) activo(s).`,
      );
    }
    await this.roleRepo.remove(role);
    const event = RoleDeletedEvent.create(id, role, userId);
    await this.publishEvent(event);
    logger.info('Rol eliminado:', id);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ order: { roleCode: 'ASC' } });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Rol ${id} no encontrado.`);
    return role;
  }

  async findByCode(roleCode: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { roleCode } });
    if (!role) throw new NotFoundException(`Rol con código '${roleCode}' no encontrado.`);
    return role;
  }

  private async publishEvent(event: any): Promise<void> {
    await this.eventPublisher.publish(event);
    if (process.env.EVENT_STORE_ENABLED === 'true') {
      await this.eventStore.appendEvent('role-' + event.aggregateId, event);
    }
  }
}
