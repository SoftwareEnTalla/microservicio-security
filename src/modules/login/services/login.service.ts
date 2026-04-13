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
import { Login } from "../entities/login.entity";
import { LoginResponse, FederatedLoginStartResponse, LogoutResponse } from "../types/login.types";
import { LoginAuthenticateWithPasswordDto, LoginStartFederatedLoginDto, LoginRefreshSessionDto, LoginLogoutDto } from "../dtos/all-dto";

@Injectable()
export class LoginService {

  async authenticateWithPassword(payload: LoginAuthenticateWithPasswordDto): Promise<LoginResponse<Login>> {
    throw new BadRequestException('La acción Autenticar localmente con identificador y contraseña requiere implementación de negocio específica en el servicio Login.');
  }

  async startFederatedLogin(payload: LoginStartFederatedLoginDto): Promise<FederatedLoginStartResponse> {
    throw new BadRequestException('La acción Iniciar autenticación con proveedor externo requiere implementación de negocio específica en el servicio Login.');
  }

  async refreshSession(payload: LoginRefreshSessionDto): Promise<LoginResponse<Login>> {
    throw new BadRequestException('La acción Renovar una sesión vigente requiere implementación de negocio específica en el servicio Login.');
  }

  async logout(payload: LoginLogoutDto): Promise<LogoutResponse> {
    throw new BadRequestException('La acción Cerrar sesión requiere implementación de negocio específica en el servicio Login.');
  }
}
