import { Injectable, Logger } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable, map, filter, tap } from 'rxjs';
import { CreateAuthenticationCommand } from '../../authentication/commands/createauthentication.command';
import { LoginCompletedEvent } from '../events/login.events';

@Injectable()
export class LoginAuthenticationSaga {
  private readonly logger = new Logger(LoginAuthenticationSaga.name);

  @Saga()
  recordLoginOutcome = (
    events$: Observable<LoginCompletedEvent>,
  ): Observable<CreateAuthenticationCommand> => {
    return events$.pipe(
      ofType(LoginCompletedEvent),
      filter((event) =>
        ['SUCCEEDED', 'FAILED', 'REFRESHED'].includes(event.payload.authStatus),
      ),
      tap((event) => {
        this.logger.log(
          `Registrando resultado de login en authentication: ${event.aggregateId} -> ${event.payload.authStatus}`,
        );
      }),
      map(
        (event) =>
          new CreateAuthenticationCommand({
            name: `Login ${event.payload.authStatus}`,
            creationDate: event.payload.occurredAt,
            modificationDate: event.payload.occurredAt,
            createdBy: 'login-module',
            isActive: true,
            userId: event.payload.userId,
            loginIdentifier: event.payload.loginIdentifier,
            authMethod: event.payload.authMethod,
            authStatus: event.payload.authStatus,
            failureReason: event.payload.failureReason,
            ipAddress: event.payload.ipAddress,
            deviceFingerprint: event.payload.deviceFingerprint,
            userAgent: event.payload.userAgent,
            authenticatedUserAcls: event.payload.authenticatedUserAcls ?? {},
            occurredAt: event.payload.occurredAt,
            metadata: event.payload.metadata ?? {},
          }),
      ),
    );
  };
}
