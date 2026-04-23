import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { EventStoreService } from '../shared/event-store/event-store.service';
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { logger } from '@core/logs/logger';

@Injectable()
export class PermissionCommandService {
  private readonly log = new Logger(PermissionCommandService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
  ) {}

  async createPermission(data: Partial<Permission>, userId: string): Promise<Permission> {
    const existing = await this.permRepo.findOne({ where: { permissionCode: data.permissionCode } });
    if (existing) {
      throw new ConflictException(`El permiso con código '${data.permissionCode}' ya existe.`);
    }
    const perm = this.permRepo.create(data);
    const saved = await this.permRepo.save(perm);
    logger.info('Permiso creado:', saved.id);
    return saved;
  }

  async updatePermission(id: string, data: Partial<Permission>, userId: string): Promise<Permission> {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException(`Permiso ${id} no encontrado.`);
    Object.assign(perm, data);
    const saved = await this.permRepo.save(perm);
    logger.info('Permiso actualizado:', saved.id);
    return saved;
  }

  async deletePermission(id: string, userId: string): Promise<void> {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException(`Permiso ${id} no encontrado.`);
    await this.permRepo.remove(perm);
    logger.info('Permiso eliminado:', id);
  }

  async findAll(): Promise<Permission[]> {
    return this.permRepo.find({ order: { permissionCode: 'ASC' } });
  }

  async findById(id: string): Promise<Permission> {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException(`Permiso ${id} no encontrado.`);
    return perm;
  }

  async findByCode(permissionCode: string): Promise<Permission> {
    const perm = await this.permRepo.findOne({ where: { permissionCode } });
    if (!perm) throw new NotFoundException(`Permiso con código '${permissionCode}' no encontrado.`);
    return perm;
  }
}
