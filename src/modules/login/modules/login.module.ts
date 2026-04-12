import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { LoginController } from '../controllers/login.controller';
import { LoginService } from '../services/login.service';
import { LoginAuthenticationSaga } from '../sagas/login-authentication.saga';
import { User } from '../../user/entities/user.entity';
import { IdentityFederation } from '../../identity-federation/entities/identity-federation.entity';
import { SessionToken } from '../../session-token/entities/session-token.entity';
import { SessionTokenModule } from '../../session-token/modules/sessiontoken.module';
import { AuthenticationModule } from '../../authentication/modules/authentication.module';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    AuthenticationModule,
    SessionTokenModule,
    TypeOrmModule.forFeature([User, IdentityFederation, SessionToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'change-me',
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, LoginAuthenticationSaga],
  exports: [LoginService],
})
export class LoginModule {}
