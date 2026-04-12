import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class LoginWithPasswordDto {
  @ApiProperty({ description: 'Nombre de usuario, correo, teléfono o identificador configurado.' })
  @IsString()
  identifier!: string;

  @ApiProperty({ description: 'Contraseña del usuario.' })
  @IsString()
  password!: string;

  @ApiPropertyOptional({ description: 'Aplicación o microservicio que consume el login.' })
  @IsOptional()
  @IsString()
  subscriberId?: string;

  @ApiPropertyOptional({ description: 'Huella o identificador del dispositivo.' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ description: 'Dirección IP reportada por el canal.' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Cadena user-agent del cliente.' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class LogoutDto {
  @ApiPropertyOptional({ description: 'Refresh token emitido por security.' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({ description: 'Código de sesión a cerrar.' })
  @IsOptional()
  @IsString()
  sessionCode?: string;

  @ApiPropertyOptional({ description: 'Motivo funcional del cierre de sesión.' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RefreshSecurityTokenDto {
  @ApiProperty({ description: 'Refresh token emitido por security.' })
  @IsString()
  refreshToken!: string;

  @ApiPropertyOptional({ description: 'Aplicación o microservicio consumidor.' })
  @IsOptional()
  @IsString()
  subscriberId?: string;

  @ApiPropertyOptional({ description: 'Nueva huella del dispositivo si cambió.' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ description: 'Dirección IP reportada por el canal.' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Cadena user-agent del cliente.' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class StartFederatedLoginDto {
  @ApiProperty({ description: 'Código del proveedor configurado en identity-federation.' })
  @IsString()
  providerCode!: string;

  @ApiProperty({ description: 'URL de retorno de la aplicación consumidora.' })
  @IsString()
  redirectUri!: string;

  @ApiPropertyOptional({ description: 'Aplicación o microservicio consumidor.' })
  @IsOptional()
  @IsString()
  subscriberId?: string;

  @ApiPropertyOptional({ description: 'Scopes solicitados al proveedor.' , type: [String]})
  @IsOptional()
  @IsArray()
  scopes?: string[];

  @ApiPropertyOptional({ description: 'Estado correlacionado del flujo federado.' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Código challenge PKCE calculado por el cliente.' })
  @IsOptional()
  @IsString()
  codeChallenge?: string;

  @ApiPropertyOptional({ description: 'Método del challenge PKCE.' })
  @IsOptional()
  @IsString()
  codeChallengeMethod?: string;

  @ApiPropertyOptional({ description: 'Código verifier PKCE. Solo para entornos donde security genera el challenge.' })
  @IsOptional()
  @IsString()
  codeVerifier?: string;

  @ApiPropertyOptional({ description: 'Sugerencia de login para el proveedor externo.' })
  @IsOptional()
  @IsString()
  loginHint?: string;
}

export class CompleteFederatedLoginDto {
  @ApiProperty({ description: 'Código del proveedor configurado en identity-federation.' })
  @IsString()
  providerCode!: string;

  @ApiPropertyOptional({ description: 'Authorization code devuelto por el proveedor OAuth/OIDC.' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Respuesta SAML codificada devuelta por el proveedor.' })
  @IsOptional()
  @IsString()
  samlResponse?: string;

  @ApiPropertyOptional({ description: 'RelayState o estado devuelto por el proveedor.' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'URL de retorno utilizada durante el flujo.' })
  @IsOptional()
  @IsString()
  redirectUri?: string;

  @ApiPropertyOptional({ description: 'PKCE verifier original.' })
  @IsOptional()
  @IsString()
  codeVerifier?: string;

  @ApiPropertyOptional({ description: 'Aplicación o microservicio consumidor.' })
  @IsOptional()
  @IsString()
  subscriberId?: string;

  @ApiPropertyOptional({ description: 'Huella del dispositivo.' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ description: 'Dirección IP reportada por el canal.' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Cadena user-agent del cliente.' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
