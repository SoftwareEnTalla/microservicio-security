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

import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Login } from "../entities/login.entity";
import { LoginResponse, FederatedLoginStartResponse, LogoutResponse } from "../types/login.types";
import { LoginAuthenticateWithPasswordDto, LoginStartFederatedLoginDto, LoginRefreshSessionDto, LoginLogoutDto } from "../dtos/all-dto";
import { BaseEvent } from "../events/base.event";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";

@Injectable()
export class LoginService {
  private readonly dslDeclaredActionEvents: Record<string, string[]> = {
    authenticateWithPassword: ["LoginSucceeded", "LoginFailed"],
    startFederatedLogin: ["FederatedLoginStarted"],
    refreshSession: ["LoginRefreshed"],
    logout: ["LoginLoggedOut"],
  };

  constructor(
    @InjectRepository(Login)
    protected readonly repository: Repository<Login>,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
  ) {}

  protected async publishDslDomainEvents(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventPublisher.publish(event as any);
      if (process.env.EVENT_STORE_ENABLED === "true") {
        await this.eventStore.appendEvent("login-" + event.aggregateId, event);
      }
    }
  }

  protected getDeclaredDslEvents(actionMethod: string): string[] {
    return this.dslDeclaredActionEvents[actionMethod] || [];
  }

  protected async completeActionResponse<T>(actionMethod: string, events: BaseEvent[], response: T): Promise<T> {
    const declaredEvents = this.getDeclaredDslEvents(actionMethod);
    if (declaredEvents.length > 0 && events.length === 0) {
      throw new BadRequestException(`La acción ${actionMethod} debe publicar al menos uno de los eventos declarados por DSL: ${declaredEvents.join(", ")}.`);
    }
    await this.publishDslDomainEvents(events);
    return response;
  }

  async authenticateWithPassword(payload: LoginAuthenticateWithPasswordDto): Promise<LoginResponse<Login>> {
    const pendingEvents: BaseEvent[] = [];
    void payload;
    void this.repository;
    void pendingEvents;
    throw new BadRequestException('La acción Autenticar localmente con identificador y contraseña requiere implementación de negocio específica en el servicio Login. Debe persistir con repositorios directos y publicar los eventos declarados por DSL: LoginSucceeded, LoginFailed.');
  }

  async startFederatedLogin(payload: LoginStartFederatedLoginDto): Promise<FederatedLoginStartResponse> {
    const pendingEvents: BaseEvent[] = [];
    void payload;
    void this.repository;
    void pendingEvents;
    throw new BadRequestException('La acción Iniciar autenticación con proveedor externo requiere implementación de negocio específica en el servicio Login. Debe persistir con repositorios directos y publicar los eventos declarados por DSL: FederatedLoginStarted.');
  }

  async refreshSession(payload: LoginRefreshSessionDto): Promise<LoginResponse<Login>> {
    const pendingEvents: BaseEvent[] = [];
    void payload;
    void this.repository;
    void pendingEvents;
    throw new BadRequestException('La acción Renovar una sesión vigente requiere implementación de negocio específica en el servicio Login. Debe persistir con repositorios directos y publicar los eventos declarados por DSL: LoginRefreshed.');
  }

  async logout(payload: LoginLogoutDto): Promise<LogoutResponse> {
    const pendingEvents: BaseEvent[] = [];
    void payload;
    void this.repository;
    void pendingEvents;
    throw new BadRequestException('La acción Cerrar sesión requiere implementación de negocio específica en el servicio Login. Debe persistir con repositorios directos y publicar los eventos declarados por DSL: LoginLoggedOut.');
  }
}
