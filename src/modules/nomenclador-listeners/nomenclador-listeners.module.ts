/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 *
 * NomencladorListenersModule — registra los listeners on<Nomenclador>Change
 * para todos los nomencladores referenciados por las entidades de este
 * microservicio. Se importa una sola vez desde app.module.ts.
 *
 * Generado por sources/scaffold_nomenclador_listeners.py — NO editar a mano.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OnAccountStatusChangeListener } from './on-account-status-change.listener';
import { OnApprovalStatusChangeListener } from './on-approval-status-change.listener';
import { OnAuthMethodChangeListener } from './on-auth-method-change.listener';
import { OnAuthMethod2ChangeListener } from './on-auth-method-2-change.listener';
import { OnAuthStatusChangeListener } from './on-auth-status-change.listener';
import { OnAuthStatus2ChangeListener } from './on-auth-status-2-change.listener';
import { OnCertificationStatusChangeListener } from './on-certification-status-change.listener';
import { OnChallengeStatusChangeListener } from './on-challenge-status-change.listener';
import { OnChallengeTypeChangeListener } from './on-challenge-type-change.listener';
import { OnDeliveryModeChangeListener } from './on-delivery-mode-change.listener';
import { OnFlowTypeChangeListener } from './on-flow-type-change.listener';
import { OnIdentifierTypeChangeListener } from './on-identifier-type-change.listener';
import { OnLoginIdentifierTypeChangeListener } from './on-login-identifier-type-change.listener';
import { OnMfaModeChangeListener } from './on-mfa-mode-change.listener';
import { OnPermissionEffectChangeListener } from './on-permission-effect-change.listener';
import { OnProtocolFamilyChangeListener } from './on-protocol-family-change.listener';
import { OnProviderTypeChangeListener } from './on-provider-type-change.listener';
import { OnRiskLevelChangeListener } from './on-risk-level-change.listener';
import { OnSystemAdminPolicyDecisionChangeListener } from './on-system-admin-policy-decision-change.listener';
import { OnTokenTypeChangeListener } from './on-token-type-change.listener';
import { OnUserTypeChangeListener } from './on-user-type-change.listener';

@Module({
  imports: [ConfigModule, CqrsModule],
  providers: [
    OnAccountStatusChangeListener,
    OnApprovalStatusChangeListener,
    OnAuthMethodChangeListener,
    OnAuthMethod2ChangeListener,
    OnAuthStatusChangeListener,
    OnAuthStatus2ChangeListener,
    OnCertificationStatusChangeListener,
    OnChallengeStatusChangeListener,
    OnChallengeTypeChangeListener,
    OnDeliveryModeChangeListener,
    OnFlowTypeChangeListener,
    OnIdentifierTypeChangeListener,
    OnLoginIdentifierTypeChangeListener,
    OnMfaModeChangeListener,
    OnPermissionEffectChangeListener,
    OnProtocolFamilyChangeListener,
    OnProviderTypeChangeListener,
    OnRiskLevelChangeListener,
    OnSystemAdminPolicyDecisionChangeListener,
    OnTokenTypeChangeListener,
    OnUserTypeChangeListener,
  ],
  exports: [
    OnAccountStatusChangeListener,
    OnApprovalStatusChangeListener,
    OnAuthMethodChangeListener,
    OnAuthMethod2ChangeListener,
    OnAuthStatusChangeListener,
    OnAuthStatus2ChangeListener,
    OnCertificationStatusChangeListener,
    OnChallengeStatusChangeListener,
    OnChallengeTypeChangeListener,
    OnDeliveryModeChangeListener,
    OnFlowTypeChangeListener,
    OnIdentifierTypeChangeListener,
    OnLoginIdentifierTypeChangeListener,
    OnMfaModeChangeListener,
    OnPermissionEffectChangeListener,
    OnProtocolFamilyChangeListener,
    OnProviderTypeChangeListener,
    OnRiskLevelChangeListener,
    OnSystemAdminPolicyDecisionChangeListener,
    OnTokenTypeChangeListener,
    OnUserTypeChangeListener,
  ],
})
export class NomencladorListenersModule {}
