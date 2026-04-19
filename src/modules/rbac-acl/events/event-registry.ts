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


import { BaseEvent } from './base.event';
import { RbacAclCreatedEvent } from './rbacaclcreated.event';
import { RbacAclUpdatedEvent } from './rbacaclupdated.event';
import { RbacAclDeletedEvent } from './rbacacldeleted.event';
import { RoleCreatedEvent } from './rolecreated.event';
import { RoleUpdatedEvent } from './roleupdated.event';
import { RoleDeactivatedEvent } from './roledeactivated.event';
import { RoleDeletedEvent } from './roledeleted.event';
import { PermissionAssignedToRoleEvent } from './permissionassignedtorole.event';
import { PermissionRemovedFromRoleEvent } from './permissionremovedfromrole.event';
import { UserRoleAssignedEvent } from './userroleassigned.event';
import { UserRoleRevokedEvent } from './userrolerevoked.event';
import { AuthenticatedUserAclResolvedEvent } from './authenticateduseraclresolved.event';

export type RegisteredEventClass<T extends BaseEvent = BaseEvent> = new (
  aggregateId: string,
  payload: any
) => T;

export interface RegisteredEventDefinition<T extends BaseEvent = BaseEvent> {
  topic: string;
  eventName: string;
  version: string;
  eventClass: RegisteredEventClass<T>;
  retryTopic: string;
  dlqTopic: string;
  maxRetries: number;
  replayable: boolean;
}

const createEventDefinition = <T extends BaseEvent>(
  topic: string,
  eventClass: RegisteredEventClass<T>,
  overrides?: Partial<Omit<RegisteredEventDefinition<T>, 'topic' | 'eventName' | 'eventClass'>>,
): RegisteredEventDefinition<T> => ({
  topic,
  eventName: eventClass.name,
  version: overrides?.version ?? '1.0.0',
  eventClass,
  retryTopic: overrides?.retryTopic ?? topic + '-retry',
  dlqTopic: overrides?.dlqTopic ?? topic + '-dlq',
  maxRetries: overrides?.maxRetries ?? 3,
  replayable: overrides?.replayable ?? true,
});

const EVENT_DEFINITION_OVERRIDES: Partial<Record<string, Partial<Omit<RegisteredEventDefinition, 'topic' | 'eventName' | 'eventClass'>>>> = {

};

export const EVENT_DEFINITIONS: Record<string, RegisteredEventDefinition> = {
  'rbac-acl-created': createEventDefinition('rbac-acl-created', RbacAclCreatedEvent, EVENT_DEFINITION_OVERRIDES['rbac-acl-created']),
  'rbac-acl-updated': createEventDefinition('rbac-acl-updated', RbacAclUpdatedEvent, EVENT_DEFINITION_OVERRIDES['rbac-acl-updated']),
  'rbac-acl-deleted': createEventDefinition('rbac-acl-deleted', RbacAclDeletedEvent, EVENT_DEFINITION_OVERRIDES['rbac-acl-deleted']),
  'role-created': createEventDefinition('role-created', RoleCreatedEvent, { version: '2.0.0' }),
  'role-updated': createEventDefinition('role-updated', RoleUpdatedEvent, { version: '2.0.0' }),
  'role-deactivated': createEventDefinition('role-deactivated', RoleDeactivatedEvent, { version: '2.0.0' }),
  'role-deleted': createEventDefinition('role-deleted', RoleDeletedEvent, { version: '2.0.0' }),
  'permission-assigned-to-role': createEventDefinition('permission-assigned-to-role', PermissionAssignedToRoleEvent, { version: '2.0.0' }),
  'permission-removed-from-role': createEventDefinition('permission-removed-from-role', PermissionRemovedFromRoleEvent, { version: '2.0.0' }),
  'user-role-assigned': createEventDefinition('user-role-assigned', UserRoleAssignedEvent, { version: '2.0.0' }),
  'user-role-revoked': createEventDefinition('user-role-revoked', UserRoleRevokedEvent, { version: '2.0.0' }),
  'authenticated-user-acl-resolved': createEventDefinition('authenticated-user-acl-resolved', AuthenticatedUserAclResolvedEvent, { version: '2.0.0' }),
};

export const EVENT_REGISTRY: Record<string, RegisteredEventClass> = Object.fromEntries(
  Object.values(EVENT_DEFINITIONS).map((definition) => [definition.topic, definition.eventClass])
);

export const EVENT_TOPICS = Object.values(EVENT_DEFINITIONS).map((definition) => definition.topic);
export const EVENT_RETRY_TOPICS = Object.values(EVENT_DEFINITIONS).map((definition) => definition.retryTopic);
export const EVENT_DLQ_TOPICS = Object.values(EVENT_DEFINITIONS).map((definition) => definition.dlqTopic);
export const EVENT_CONSUMER_TOPICS = Array.from(new Set([...EVENT_TOPICS, ...EVENT_RETRY_TOPICS]));
export const EVENT_ADMIN_TOPICS = Array.from(new Set([...EVENT_TOPICS, ...EVENT_RETRY_TOPICS, ...EVENT_DLQ_TOPICS]));

export const resolveEventDefinition = (candidate?: string): RegisteredEventDefinition | undefined => {
  if (!candidate) {
    return undefined;
  }

  if (EVENT_DEFINITIONS[candidate]) {
    return EVENT_DEFINITIONS[candidate];
  }

  return Object.values(EVENT_DEFINITIONS).find(
    (definition) =>
      definition.topic === candidate ||
      definition.retryTopic === candidate ||
      definition.dlqTopic === candidate ||
      definition.eventName === candidate,
  );
};
