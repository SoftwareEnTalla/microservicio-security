import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompleteFederatedLoginDto,
  LoginWithPasswordDto,
  LogoutDto,
  RefreshSecurityTokenDto,
  StartFederatedLoginDto,
} from '../dtos/login.dto';
import {
  FederatedLoginStartResponse,
  LoginResponse,
  LogoutResponse,
} from '../types/login.types';
import { LoginService } from '../services/login.service';

@ApiTags('Login')
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @ApiOperation({ summary: 'Iniciar sesión con identificador y contraseña.' })
  @ApiBody({ type: LoginWithPasswordDto })
  @ApiResponse({ status: 201, type: LoginResponse })
  @Post('authenticate/password')
  async authenticateWithPassword(
    @Body() dto: LoginWithPasswordDto,
  ): Promise<LoginResponse> {
    return this.loginService.authenticateWithPassword(dto);
  }

  @ApiOperation({ summary: 'Renovar el token de seguridad a partir de un refresh token válido.' })
  @ApiBody({ type: RefreshSecurityTokenDto })
  @ApiResponse({ status: 201, type: LoginResponse })
  @Post('token/refresh')
  async refreshSecurityToken(
    @Body() dto: RefreshSecurityTokenDto,
  ): Promise<LoginResponse> {
    return this.loginService.refreshSecurityToken(dto);
  }

  @ApiOperation({ summary: 'Cerrar sesión e invalidar la continuidad de seguridad asociada.' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 201, type: LogoutResponse })
  @Post('logout')
  async logout(@Body() dto: LogoutDto): Promise<LogoutResponse> {
    return this.loginService.logout(dto);
  }

  @ApiOperation({ summary: 'Preparar el inicio de sesión con un proveedor externo.' })
  @ApiBody({ type: StartFederatedLoginDto })
  @ApiResponse({ status: 201, type: FederatedLoginStartResponse })
  @Post('authenticate/federated/start')
  async startFederatedLogin(
    @Body() dto: StartFederatedLoginDto,
  ): Promise<FederatedLoginStartResponse> {
    return this.loginService.startFederatedLogin(dto);
  }

  @ApiOperation({ summary: 'Completar el inicio de sesión federado y emitir tokens internos de security.' })
  @ApiBody({ type: CompleteFederatedLoginDto })
  @ApiResponse({ status: 201, type: LoginResponse })
  @Post('authenticate/federated/complete')
  async completeFederatedLogin(
    @Body() dto: CompleteFederatedLoginDto,
  ): Promise<LoginResponse> {
    return this.loginService.completeFederatedLogin(dto);
  }
}
