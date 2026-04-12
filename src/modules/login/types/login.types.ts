import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SecurityTokenPairResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  tokenType: string = 'Bearer';

  @ApiProperty()
  expiresIn!: number;

  @ApiProperty()
  refreshExpiresIn!: number;

  @ApiProperty()
  sessionCode!: string;
}

export class LoginUserSummary {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  username?: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  accountStatus!: string;

  @ApiProperty()
  userType!: string;

  @ApiProperty()
  identifierType!: string;

  @ApiProperty()
  identifierValue!: string;
}

export class LoginResponse {
  @ApiProperty()
  ok!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: SecurityTokenPairResponse })
  tokens!: SecurityTokenPairResponse;

  @ApiProperty({ type: LoginUserSummary })
  user!: LoginUserSummary;

  @ApiProperty({ type: Object })
  authenticatedUserAcls!: Record<string, any>;

  @ApiPropertyOptional({ type: Object })
  provider?: Record<string, any>;
}

export class LogoutResponse {
  @ApiProperty()
  ok!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  sessionCode!: string;
}

export class FederatedLoginStartResponse {
  @ApiProperty()
  ok!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  providerCode!: string;

  @ApiProperty()
  protocolFamily!: string;

  @ApiProperty()
  authorizationUrl!: string;

  @ApiProperty()
  state!: string;

  @ApiPropertyOptional()
  codeVerifier?: string;
}
