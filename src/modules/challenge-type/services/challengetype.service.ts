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

import { Injectable } from "@nestjs/common";
import { ChallengeType } from "../entities/challenge-type.entity";
import { ChallengeTypeRepository } from "../repositories/challengetype.repository";

@Injectable()
export class ChallengeTypeService {
  constructor(private readonly repository: ChallengeTypeRepository) {}

  // Métodos delegados
  async findAll(options?: any): Promise<ChallengeType[]> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<ChallengeType | null> {
    return this.repository.findById(id);
  }

  async findByField(field: string, value: any, page: number, limit: number): Promise<ChallengeType[]> {
    return this.repository.findByField(field, value, page, limit);
  }

  async findWithPagination(options: any, page: number, limit: number): Promise<ChallengeType[]> {
    return this.repository.findWithPagination(options, page, limit);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async findAndCount(where?: Record<string, any>): Promise<[ChallengeType[], number]> {
    return this.repository.findAndCount(where);
  }

  async findOne(where?: Record<string, any>): Promise<ChallengeType | null> {
    return this.repository.findOne(where);
  }

  async findOneOrFail(where?: Record<string, any>): Promise<ChallengeType> {
    return this.repository.findOneOrFail(where);
  }

  async create(entity: ChallengeType): Promise<ChallengeType> {
    return this.repository.create(entity);
  }

  async bulkCreate(entities: ChallengeType[]): Promise<ChallengeType[]> {
    return this.repository.bulkCreate(entities);
  }

  async update(id: string, partialEntity: Partial<ChallengeType>): Promise<ChallengeType | null> {
    return this.repository.update(id, partialEntity);
  }

  async bulkUpdate(entities: Partial<ChallengeType>[]): Promise<ChallengeType[]> {
    return this.repository.bulkUpdate(entities);
  }

  async delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }

  async bulkDelete(ids: string[]): Promise<any> {
    return this.repository.bulkDelete(ids);
  }
}
