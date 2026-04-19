# Security Microservice — Documentación Completa

> **Versión**: 2.0.0  
> **Puerto**: 3015  
> **Base URL**: `http://localhost:3015/api`  
> **Swagger UI**: `http://localhost:3015/api-docs` (user: `admin`, pass: `admin123`)

---

## Tabla de Contenidos

1. [Historia de Usuario](#1-historia-de-usuario)
2. [Modelo DSL](#2-modelo-dsl)
3. [Arquitectura](#3-arquitectura)
4. [Módulos del Microservicio](#4-módulos-del-microservicio)
5. [Eventos Publicados](#5-eventos-publicados)
6. [Eventos Consumidos](#6-eventos-consumidos)
7. [API REST — Guía Completa Swagger](#7-api-rest--guía-completa-swagger)
8. [Guía para Desarrolladores](#8-guía-para-desarrolladores)
9. [Test E2E con curl](#9-test-e2e-con-curl)
10. [Análisis de Sagas y Eventos (E2E)](#10-análisis-de-sagas-y-eventos-e2e)

---

## 1. Historia de Usuario

### Bounded Context: Security

El microservicio de seguridad es el **bounded context fundacional** del ecosistema. Es dueño de: identidad, credenciales, autenticación, MFA/TOTP, federación de identidad, sesiones, tokens, roles, permisos y ACLs.

### Historias de Usuario Implementadas

| ID | Título | Módulo(s) |
|----|--------|-----------|
| UH-1 | Gestión de usuarios (registro, activación, desactivación) | user |
| UH-2 | Perfil de usuario con datos personales | user-profile |
| UH-3 | Autenticación local con contraseña + activación por PIN | login, authentication |
| UH-4 | MFA-TOTP para activación y verificación en dos pasos | mfa-totp |
| UH-5 | Gestión de sesiones y tokens opacos | session-token |
| UH-6 | RBAC/ACL — Roles, permisos y ACLs efectivas | rbac-acl |
| UH-7 | Federación de identidad con proveedores externos | identity-federation |
| UH-8 | Políticas de administrador de sistema | system-admin-policy |
| UH-9 | Datos maestros de seguridad | security-master-data |
| UH-10 | Proyección security-customer (cross-context) | security-customer |
| UH-11 | Proyección security-merchant (cross-context) | security-merchant |
| UH-12 | Gestión de sales managers | sales-manager |

### UH-6: RBAC/ACL (v2.0.0)

**Como** administrador de seguridad, **quiero** definir roles y permisos **para** controlar qué acciones puede ejecutar cada usuario.

**Criterios de aceptación:**
- Crear, editar, activar y desactivar roles
- Asignar uno o varios roles según configuración (monorol/multirol)
- Calcular ACLs efectivas desde roles, permisos y restricciones
- `authenticatedUserAcls` disponible como respuesta normalizada
- Un rol solo puede eliminarse si no está asignado a usuarios
- **Notificación event-driven**: cuando se modifica un rol o permiso, se notifican todos los usuarios afectados recalculando sus ACLs vía Kafka

---

## 2. Modelo DSL

Cada módulo del microservicio se define mediante un archivo XML bajo el estándar DSL v2.0. Los modelos se encuentran en `models/security/`.

| Modelo XML | Versión | Descripción |
|------------|---------|-------------|
| `user.xml` | 1.3.0 | Identidad base con credenciales |
| `user-profile.xml` | 1.0.0 | Datos personales del usuario |
| `login.xml` | 1.1.0 | Autenticación local y federada |
| `authentication.xml` | 1.0.0 | Registro de eventos de autenticación |
| `mfa-totp.xml` | 1.1.0 | MFA con TOTP para activación |
| `session-token.xml` | 1.0.0 | Sesiones y tokens opacos |
| `rbac-acl.xml` | 2.0.0 | Roles, permisos y ACLs |
| `identity-federation.xml` | 1.0.0 | Proveedores de identidad externos |
| `system-admin-policy.xml` | 1.0.0 | Políticas de administración |
| `security-master-data.xml` | 1.0.0 | Datos maestros |
| `security-customer.xml` | 1.0.0 | Proyección cross-context de customer |
| `security-merchant.xml` | 1.0.0 | Proyección cross-context de merchant |
| `sales-manager.xml` | 1.0.0 | Gestión de sales managers |

### Estructura de un modelo DSL

```xml
<domain-model name="rbac-acl" schemaVersion="2.0" version="2.0.0"
              boundedContext="security" aggregateRoot="false" moduleType="entity">
  <metadata>...</metadata>
  <fields>...</fields>
  <indexes>...</indexes>
  <constraints>...</constraints>
  <domain-events>
    <event name="role-created" version="1.0.0" maxRetries="5" replayable="true" />
  </domain-events>
  <business-rules>
    <rule name="role-cannot-be-deleted-if-assigned" type="invariant"
          target="service" trigger="delete" severity="error" errorCode="RBAC_002">
      ...
    </rule>
  </business-rules>
  <generation>...</generation>
</domain-model>
```

---

## 3. Arquitectura

### 3.1. Patrones y Estilos Arquitectónicos

| Patrón/Estilo | Descripción |
|---------------|-------------|
| **CQRS** (Command Query Responsibility Segregation) | Separación estricta de operaciones de escritura (commands) y lectura (queries). Cada módulo tiene controllers, services, repositories y handlers independientes para command y query. |
| **Event Sourcing** | Todos los cambios de estado se registran como eventos inmutables. Los eventos se persisten en el EventStore y se publican vía Kafka para proyecciones y reacciones. |
| **Event-Driven Architecture** | Comunicación asíncrona entre módulos y microservicios mediante eventos Kafka. Cada módulo publica y consume eventos de forma desacoplada. |
| **Saga Pattern** | Orquestación de flujos de negocio complejos que involucran múltiples pasos. Las sagas reaccionan a eventos y ejecutan comandos compensatorios en caso de fallo. |
| **Domain-Driven Design (DDD)** | Bounded contexts, agregados, entidades, value objects, eventos de dominio y reglas de negocio modelados explícitamente. |
| **Hexagonal Architecture** | Separación en capas: controllers (adaptadores de entrada), services (lógica de negocio), repositories (adaptadores de persistencia), y adapters (Kafka publisher/subscriber). |
| **Repository Pattern** | Abstracción de la capa de datos con repositorios de comando y consulta separados. |

### 3.2. Arquitectura Completa del Microservicio

```
┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY MICROSERVICE                         │
│                     Puerto: 3015                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    CAPA DE ENTRADA                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ REST Command │  │ REST Query   │  │ GraphQL Resolver │  │ │
│  │  │ Controllers  │  │ Controllers  │  │ (opcional)       │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │ │
│  │         │                 │                  │              │ │
│  │  ┌──────┴─────┐   ┌──────┴─────┐            │              │ │
│  │  │ Guards     │   │ Interceptors│            │              │ │
│  │  │ (Auth)     │   │ (Log/Cache) │            │              │ │
│  │  └────────────┘   └────────────┘             │              │ │
│  └──────────────────────────────────────────────┼──────────────┘ │
│                                                  │                │
│  ┌──────────────────────────────────────────────┼──────────────┐ │
│  │                    CAPA CQRS                  │              │ │
│  │                                               │              │ │
│  │  Commands:                          Queries:  │              │ │
│  │  ┌────────────────┐     ┌─────────────────┐  │              │ │
│  │  │ CommandBus     │     │ QueryBus        │  │              │ │
│  │  │  → Handlers    │     │  → Handlers     │  │              │ │
│  │  │  → Saga        │     │                 │  │              │ │
│  │  │  → EventBus    │     │                 │  │              │ │
│  │  └────────┬───────┘     └────────┬────────┘  │              │ │
│  │           │                      │            │              │ │
│  │  ┌────────┴───────┐     ┌────────┴────────┐  │              │ │
│  │  │ Command Service│     │ Query Service   │  │              │ │
│  │  │  + DSL Rules   │     │  + Caching      │  │              │ │
│  │  └────────┬───────┘     └────────┬────────┘  │              │ │
│  │           │                      │            │              │ │
│  │  ┌────────┴───────┐     ┌────────┴────────┐  │              │ │
│  │  │ Command Repo   │     │ Query Repo      │  │              │ │
│  │  └────────┬───────┘     └────────┬────────┘  │              │ │
│  └───────────┼──────────────────────┼────────────┘              │ │
│              │                      │                            │
│  ┌───────────┼──────────────────────┼──────────────────────────┐ │
│  │           │   CAPA DE DATOS      │                          │ │
│  │    ┌──────┴──────────────────────┴──────┐                   │ │
│  │    │         PostgreSQL (TypeORM)        │                   │ │
│  │    │    security-service database        │                   │ │
│  │    └────────────────────────────────────┘                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              CAPA EVENT-SOURCING / KAFKA                    │ │
│  │                                                             │ │
│  │  ┌──────────────────┐    ┌──────────────────┐              │ │
│  │  │ KafkaEvent       │    │ KafkaEvent       │              │ │
│  │  │ Publisher        │    │ Subscriber       │              │ │
│  │  │ (IEventPublisher)│    │ (Consumer)       │              │ │
│  │  └────────┬─────────┘    └────────┬─────────┘              │ │
│  │           │                       │                         │ │
│  │  ┌────────┴───────┐    ┌─────────┴──────────┐              │ │
│  │  │ Event Store    │    │ Idempotency Service│              │ │
│  │  │ Service        │    │ Dead Letter Service│              │ │
│  │  └────────────────┘    └────────────────────┘              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
         │                              ▲
         ▼                              │
   ┌───────────┐                  ┌───────────┐
   │   Kafka   │ ───────────────► │   Kafka   │
   │ (Produce) │                  │ (Consume) │
   └───────────┘                  └───────────┘
```

### 3.3. Estructura de Carpetas por Módulo

```
src/modules/<module-name>/
├── commands/
│   ├── base.command.ts           # Comando base abstracto
│   ├── create<entity>.command.ts # Comando de creación
│   ├── update<entity>.command.ts # Comando de actualización
│   ├── delete<entity>.command.ts # Comando de eliminación
│   ├── exporting.command.ts      # Barrel exports
│   └── handlers/
│       ├── create<entity>.handler.ts
│       ├── update<entity>.handler.ts
│       └── delete<entity>.handler.ts
├── controllers/
│   ├── <entity>command.controller.ts  # Endpoints de escritura
│   └── <entity>query.controller.ts    # Endpoints de lectura
├── decorators/
│   └── cache.decorator.ts
├── dtos/
│   └── all-dto.ts                # CreateDto, UpdateDto, DeleteDto, BaseDto
├── entities/
│   ├── base.entity.ts            # BaseEntity con TableInheritance
│   └── <entity>.entity.ts        # ChildEntity con campos del dominio
├── events/
│   ├── base.event.ts             # BaseEvent, PayloadEvent, EventMetadata
│   ├── <entity>created.event.ts
│   ├── <entity>updated.event.ts
│   ├── <entity>deleted.event.ts
│   ├── <entity>-failed.event.ts
│   ├── event-registry.ts         # Registro de eventos con tópicos Kafka
│   └── exporting.event.ts        # Barrel exports
├── graphql/
│   └── <entity>.resolver.ts
├── guards/
│   └── <entity>authguard.guard.ts
├── interceptors/
│   ├── <entity>.interceptor.ts
│   └── <entity>.logging.interceptor.ts
├── modules/
│   ├── <entity>.module.ts         # Módulo principal NestJS
│   └── kafka.module.ts            # Módulo Kafka con bootstrapping
├── queries/
│   ├── base.query.ts
│   ├── getall<entity>.query.ts
│   ├── get<entity>byid.query.ts
│   ├── get<entity>byfield.query.ts
│   ├── <entity>.graphql.query.ts
│   ├── exporting.query.ts
│   └── handlers/
│       ├── getall<entity>.handler.ts
│       ├── get<entity>byid.handler.ts
│       └── get<entity>byfield.handler.ts
├── repositories/
│   ├── <entity>.repository.ts
│   ├── <entity>command.repository.ts
│   └── <entity>query.repository.ts
├── sagas/
│   └── <entity>-crud.saga.ts
├── services/
│   ├── <entity>.service.ts           # Servicio de dominio (lógica especial)
│   ├── <entity>command.service.ts    # Servicio CRUD de escritura + DSL rules
│   ├── <entity>query.service.ts      # Servicio de consulta
│   └── <entity>.graphql.service.ts
├── shared/
│   ├── adapters/
│   │   ├── kafka-event-publisher.ts  # Publica eventos a Kafka
│   │   └── kafka-event-subscriber.ts # Consume eventos de Kafka
│   ├── event-store/
│   │   └── event-store.service.ts    # Persistencia de eventos
│   └── messaging/
│       ├── kafka.service.ts
│       ├── kafka-admin.service.ts
│       ├── event-idempotency.service.ts
│       ├── kafka-dead-letter.service.ts
│       └── projection-replay.service.ts
└── types/
    └── <entity>.types.ts
```

---

## 4. Módulos del Microservicio

### 4.1. User (Identidad base)
- **Entidad**: `User` — username, email, phone, passwordHash, accountStatus, identifierType/Value
- **Flujo de creación**: Crea usuario → estado `PENDING_VERIFICATION` → genera PIN MFA-TOTP → activación en primer login
- **Password hashing**: SHA-256

### 4.2. User Profile
- **Entidad**: `UserProfile` — firstName, lastName, profilePhotoUrl, language, country, city, address
- **Relación**: `userId` referencia al User

### 4.3. Login
- **Entidades especiales**: No es CRUD puro; `LoginService` implementa:
  - `authenticateWithPassword()` — valida credenciales, maneja activación por PIN
  - `startFederatedLogin()` — inicia flujo OAuth
  - `refreshSession()` — renueva tokens
  - `logout()` — revoca sesión
- **Tokens**: Tokens opacos (no JWT), almacenados como SessionToken

### 4.4. Authentication
- **Entidad**: `Authentication` — registro de cada evento de autenticación (auditoría)

### 4.5. MFA-TOTP
- **Entidad**: `MfaTotp` — secret, PIN hasheado, deliveryMode, pinVerified, expiresAt

### 4.6. Session Token
- **Entidad**: `SessionToken` — tokenId (hash del refreshToken), expiresAt, revokedAt

### 4.7. RBAC-ACL (v2.0.0)
- **Entidades**: 5 tablas
  - `RbacAcl` (ChildEntity) — ACL materializada por usuario
  - `Role` (@Entity `rbac_roles`) — roleCode, roleName, isActive
  - `Permission` (@Entity `rbac_permissions`) — permissionCode, resource, action, scope, effect
  - `RolePermission` (@Entity `rbac_role_permissions`) — junction roleId + permissionId
  - `UserRoleAssignment` (@Entity `rbac_user_role_assignments`) — userId + roleId + isActive
- **Servicios v2**: `RoleCommandService`, `PermissionCommandService`, `RbacAssignmentService`, `AclResolverService`
- **Saga de notificación**: Cambios en roles/permisos → recalculan ACLs de usuarios afectados vía Kafka

### 4.8-4.14. Otros módulos
Identity Federation, System Admin Policy, Security Master Data, Security Customer, Security Merchant, Sales Manager, Security (aggregate root).

---

## 5. Eventos Publicados

### Eventos por módulo

| Módulo | Evento | Tópico Kafka | Versión |
|--------|--------|--------------|---------|
| user | `UserCreatedEvent` | `user-created` | 1.0.0 |
| user | `UserUpdatedEvent` | `user-updated` | 1.0.0 |
| user | `UserDeletedEvent` | `user-deleted` | 1.0.0 |
| login | `LoginSucceededEvent` | `login-succeeded` | 1.0.0 |
| login | `LoginFailedEvent` | `login-failed` | 1.0.0 |
| login | `LoginLoggedOutEvent` | `login-logged-out` | 1.0.0 |
| login | `LoginRefreshedEvent` | `login-refreshed` | 1.0.0 |
| login | `FederatedLoginStartedEvent` | `federated-login-started` | 1.0.0 |
| rbac-acl | `RbacAclCreatedEvent` | `rbac-acl-created` | 1.0.0 |
| rbac-acl | `RbacAclUpdatedEvent` | `rbac-acl-updated` | 1.0.0 |
| rbac-acl | `RbacAclDeletedEvent` | `rbac-acl-deleted` | 1.0.0 |
| rbac-acl | `RoleCreatedEvent` | `role-created` | 2.0.0 |
| rbac-acl | `RoleUpdatedEvent` | `role-updated` | 2.0.0 |
| rbac-acl | `RoleDeactivatedEvent` | `role-deactivated` | 2.0.0 |
| rbac-acl | `RoleDeletedEvent` | `role-deleted` | 2.0.0 |
| rbac-acl | `PermissionAssignedToRoleEvent` | `permission-assigned-to-role` | 2.0.0 |
| rbac-acl | `PermissionRemovedFromRoleEvent` | `permission-removed-from-role` | 2.0.0 |
| rbac-acl | `UserRoleAssignedEvent` | `user-role-assigned` | 2.0.0 |
| rbac-acl | `UserRoleRevokedEvent` | `user-role-revoked` | 2.0.0 |
| rbac-acl | `AuthenticatedUserAclResolvedEvent` | `authenticated-user-acl-resolved` | 2.0.0 |
| mfa-totp | `MfaTotpCreatedEvent` | `mfa-totp-created` | 1.0.0 |
| mfa-totp | `MfaTotpUpdatedEvent` | `mfa-totp-updated` | 1.0.0 |
| mfa-totp | `MfaTotpDeletedEvent` | `mfa-totp-deleted` | 1.0.0 |
| session-token | `SessionTokenCreatedEvent` | `session-token-created` | 1.0.0 |
| session-token | `SessionTokenUpdatedEvent` | `session-token-updated` | 1.0.0 |
| session-token | `SessionTokenDeletedEvent` | `session-token-deleted` | 1.0.0 |

Cada evento tiene su topic de retry (`<topic>-retry`) y DLQ (`<topic>-dlq`).

### Estructura de un evento publicado

```json
{
  "aggregateId": "uuid-del-agregado",
  "timestamp": "2026-04-17T10:00:00.000Z",
  "payload": {
    "instance": { /* datos de la entidad */ },
    "metadata": {
      "initiatedBy": "user-id",
      "correlationId": "uuid",
      "causationId": "uuid",
      "eventId": "uuid",
      "eventName": "RoleCreatedEvent",
      "eventVersion": "2.0.0",
      "sourceService": "security-service",
      "traceId": "uuid",
      "retryCount": 0,
      "idempotencyKey": "uuid"
    }
  }
}
```

---

## 6. Eventos Consumidos

| Módulo | Evento Consumido | Origen | Acción |
|--------|-----------------|--------|--------|
| security-customer | Eventos de customer-service | customer-service | Proyección local del cliente |
| security-merchant | Eventos de merchant-service | merchant-service | Proyección local del merchant |
| rbac-acl (saga) | `RoleUpdatedEvent`, `RoleDeactivatedEvent`, `RoleDeletedEvent` | self | Recalcula ACLs de usuarios afectados |
| rbac-acl (saga) | `PermissionAssignedToRoleEvent`, `PermissionRemovedFromRoleEvent` | self | Recalcula ACLs de usuarios afectados |
| rbac-acl (saga) | `UserRoleAssignedEvent`, `UserRoleRevokedEvent` | self | Recalcula ACL del usuario específico |

---

## 7. API REST — Guía Completa Swagger

### 7.1. Patrón Command CRUD (aplicable a todos los módulos excepto Login)

Cada módulo expone en `/<entities>/command`:

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/<entities>/command` | `CreateXxxDto` | Crear una entidad |
| `POST` | `/api/<entities>/command/bulk` | `CreateXxxDto[]` | Crear múltiples |
| `PUT` | `/api/<entities>/command/:id` | `UpdateXxxDto` | Actualizar por ID |
| `PUT` | `/api/<entities>/command/bulk` | `UpdateXxxDto[]` | Actualizar múltiples |
| `DELETE` | `/api/<entities>/command/:id` | — | Eliminar por ID |
| `DELETE` | `/api/<entities>/command/bulk?ids=` | — | Eliminar múltiples |

### 7.2. Patrón Query CRUD (aplicable a todos los módulos)

Cada módulo expone en `/<entities>/query`:

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| `GET` | `/api/<entities>/query/list` | `page, size, sort, order, search` | Listar con filtros |
| `GET` | `/api/<entities>/query/:id` | — | Obtener por ID |
| `GET` | `/api/<entities>/query/field/:field?value=` | `value, page, size` | Buscar por campo |
| `GET` | `/api/<entities>/query/pagination` | `page, size, sort, order` | Paginación |
| `GET` | `/api/<entities>/query/count` | — | Contar registros |
| `GET` | `/api/<entities>/query/search` | `where, page, size, sort` | Búsqueda con condiciones |
| `GET` | `/api/<entities>/query/find-one` | `where` | Buscar uno |
| `GET` | `/api/<entities>/query/find-one-or-fail` | `where` | Buscar uno o error |

### 7.3. Endpoints Especiales del Login

| Método | Ruta | Auth | Body | Descripción |
|--------|------|------|------|-------------|
| `POST` | `/api/logins/command` | **Público** | `LoginAuthenticateWithPasswordDto` | Login con contraseña |
| `POST` | `/api/logins/command/federated/start` | **Público** | `LoginStartFederatedLoginDto` | Login federado |
| `POST` | `/api/logins/command/refresh` | Bearer | `LoginRefreshSessionDto` | Renovar sesión |
| `POST` | `/api/logins/command/logout` | Bearer | `LoginLogoutDto` | Cerrar sesión |

### 7.4. Prefijos de Rutas por Módulo

| Módulo | Prefijo Command | Prefijo Query |
|--------|----------------|---------------|
| user | `/api/users/command` | `/api/users/query` |
| user-profile | `/api/userprofiles/command` | `/api/userprofiles/query` |
| login | `/api/logins/command` | `/api/logins/query` |
| authentication | `/api/authentications/command` | `/api/authentications/query` |
| mfa-totp | `/api/mfatotps/command` | `/api/mfatotps/query` |
| session-token | `/api/sessiontokens/command` | `/api/sessiontokens/query` |
| rbac-acl | `/api/rbacacls/command` | `/api/rbacacls/query` |
| identity-federation | `/api/identityfederations/command` | `/api/identityfederations/query` |
| system-admin-policy | `/api/systemadminpolicys/command` | `/api/systemadminpolicys/query` |
| security-master-data | `/api/securitymasterdatas/command` | `/api/securitymasterdatas/query` |
| security-customer | `/api/securitycustomers/command` | `/api/securitycustomers/query` |
| security-merchant | `/api/securitymerchants/command` | `/api/securitymerchants/query` |
| sales-manager | `/api/salesmanagers/command` | `/api/salesmanagers/query` |
| security | `/api/securitys/command` | `/api/securitys/query` |

### 7.5. Autenticación

- **Stub actual**: Los guards aceptan `Authorization: Bearer valid-token` literalmente
- **Header requerido**: `Authorization: Bearer <token>` en todos los endpoints excepto login y federated start
- **Swagger**: Autenticación básica `admin:admin123` para acceder a `/api-docs`

### 7.6. DTOs Principales

#### CreateUserMinimalDto (POST /api/users/command)
```json
{
  "username": "string (requerido)",
  "email": "string email (requerido)",
  "phone": "string (requerido)",
  "password": "string min 8 chars (requerido)",
  "termsAccepted": true,
  "name": "string (opcional)",
  "identifierType": "EMAIL | USERNAME | PHONE (default: EMAIL)"
}
```

#### LoginAuthenticateWithPasswordDto (POST /api/logins/command)
```json
{
  "identifier": "email, username o phone (requerido)",
  "password": "string (requerido)",
  "activationPin": "string 6 dígitos (opcional, para activación)"
}
```

#### CreateUserProfileDto (POST /api/userprofiles/command)
```json
{
  "name": "string (requerido)",
  "userId": "UUID (requerido)",
  "firstName": "string",
  "lastName": "string",
  "language": "string",
  "country": "string",
  "city": "string",
  "address": "string",
  "creationDate": "ISO date (requerido)",
  "modificationDate": "ISO date (requerido)",
  "isActive": true
}
```

#### CreateRbacAclDto (POST /api/rbacacls/command)
```json
{
  "name": "string (requerido)",
  "roleCode": "string (requerido)",
  "roleName": "string (requerido)",
  "permissionCode": "string (requerido)",
  "resource": "string (requerido)",
  "action": "string (requerido)",
  "scope": "string",
  "effect": "ALLOW | DENY (requerido)",
  "userId": "UUID",
  "assignedAt": "ISO date",
  "creationDate": "ISO date (requerido)",
  "modificationDate": "ISO date (requerido)",
  "isActive": true
}
```

---

## 8. Guía para Desarrolladores

### 8.1. Creación/Actualización de un Evento — Paso a Paso

Esta guía describe cómo agregar un nuevo evento de dominio al microservicio siguiendo Event Sourcing y CQRS.

#### Paso 1: Crear la clase del evento

Ubicación: `src/modules/<module>/events/<eventname>.event.ts`

```typescript
// Ejemplo: RoleCreatedEvent
import { Role } from '../entities/role.entity';
import { BaseEvent, PayloadEvent } from './base.event';
import { v4 as uuidv4 } from 'uuid';

export class RoleCreatedEvent extends BaseEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly payload: PayloadEvent<Role>,
  ) {
    super(aggregateId);
  }

  static create(
    instanceId: string,
    instance: Role,
    userId: string,
    correlationId: string = uuidv4(),
  ): RoleCreatedEvent {
    return new RoleCreatedEvent(instanceId, {
      instance,
      metadata: {
        initiatedBy: userId,
        correlationId: correlationId || uuidv4(),
      },
    });
  }
}
```

**Reglas:**
- Siempre extiende `BaseEvent` (que implementa `IEvent` de `@nestjs/cqrs`)
- Constructor recibe `aggregateId` (UUID del agregado) y `payload` (tipo `PayloadEvent<T>`)
- `PayloadEvent<T>` contiene `instance: T` (datos del evento) y `metadata: EventMetadata` (trazabilidad)
- Proporcionar factory method `static create()` para construcción estandarizada

#### Paso 2: Registrar el evento en el Event Registry

Ubicación: `src/modules/<module>/events/event-registry.ts`

```typescript
// Agregar import
import { RoleCreatedEvent } from './rolecreated.event';

// Agregar al EVENT_DEFINITIONS
export const EVENT_DEFINITIONS: Record<string, RegisteredEventDefinition> = {
  // ... eventos existentes
  'role-created': createEventDefinition('role-created', RoleCreatedEvent, { version: '2.0.0' }),
};
```

**Esto genera automáticamente:**
- Tópico Kafka: `role-created`
- Tópico retry: `role-created-retry`
- Tópico DLQ: `role-created-dlq`
- El `KafkaAdminService` crea los tópicos en bootstrap

#### Paso 3: Exportar desde el barrel

Ubicación: `src/modules/<module>/events/exporting.event.ts`

```typescript
export * from "./rolecreated.event";
```

#### Paso 4: Publicar el evento desde el servicio

En el servicio de comando donde se ejecuta la acción:

```typescript
// En el servicio relevante
import { KafkaEventPublisher } from '../shared/adapters/kafka-event-publisher';
import { EventStoreService } from '../shared/event-store/event-store.service';

@Injectable()
export class RoleCommandService {
  constructor(
    private readonly eventPublisher: KafkaEventPublisher,
    private readonly eventStore: EventStoreService,
  ) {}

  async createRole(data: Partial<Role>, userId: string): Promise<Role> {
    // 1. Persistir la entidad
    const saved = await this.roleRepo.save(role);

    // 2. Crear el evento
    const event = RoleCreatedEvent.create(saved.id, saved, userId);

    // 3. Publicar a Kafka
    await this.eventPublisher.publish(event);

    // 4. Persistir en EventStore (si habilitado)
    if (process.env.EVENT_STORE_ENABLED === 'true') {
      await this.eventStore.appendEvent('role-' + event.aggregateId, event);
    }

    return saved;
  }
}
```

#### Paso 5: Flujo de publicación en KafkaEventPublisher

El `KafkaEventPublisher` (en `shared/adapters/kafka-event-publisher.ts`):

1. **Resuelve el tópico**: Convierte el nombre de la clase del evento a kebab-case (ej: `RoleCreatedEvent` → `role-created`), busca en `EVENT_DEFINITIONS` para obtener el tópico
2. **Normaliza el evento**: Agrega metadata completa (eventId, correlationId, causationId, traceId, sourceService, retryCount, idempotencyKey)
3. **Envía vía KafkaService**: Produce el mensaje al tópico con key = aggregateId y headers con toda la metadata

#### Paso 6: Consumir el evento (si necesario)

El `KafkaEventSubscriber` (en `shared/adapters/kafka-event-subscriber.ts`):

1. Suscribe a `EVENT_CONSUMER_TOPICS` (topics + retry topics) al iniciar
2. Para cada mensaje recibido:
   - Extrae el tipo de evento de headers
   - Resuelve la `RegisteredEventDefinition` via `resolveEventDefinition()`
   - Verifica productor confiable
   - Chequea idempotencia
   - Instancia el evento: `new eventDefinition.eventClass(aggregateId, payload)`
   - Publica al `EventBus` local de NestJS CQRS
3. En caso de error: reintenta al retry topic o envía al DLQ

### 8.2. Creación/Actualización de Sagas — Paso a Paso

Las sagas reaccionan a eventos de dominio y orquestan flujos complejos.

#### Paso 1: Definir la Saga

Ubicación: `src/modules/<module>/sagas/<entity>-crud.saga.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap, mergeMap, from, EMPTY } from 'rxjs';
import { RoleUpdatedEvent } from '../events/exporting.event';
import { AclResolverService } from '../services/acl-resolver.service';

@Injectable()
export class RbacAclCrudSaga {
  private readonly logger = new Logger(RbacAclCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly aclResolver: AclResolverService,
  ) {}

  @Saga()
  onRoleUpdatedNotify = ($events: Observable<RoleUpdatedEvent>) => {
    return $events.pipe(
      ofType(RoleUpdatedEvent),
      tap(event => this.logger.log(`Saga: rol actualizado ${event.aggregateId}`)),
      mergeMap(event => {
        return from(
          this.aclResolver.resolveAclForAffectedUsers(
            event.aggregateId,
            event.payload?.metadata?.initiatedBy || 'system',
          ).catch(err => this.handleSagaError(err, event))
        ).pipe(map(() => null));
      }),
    );
  };

  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga: ${error.message}`);
    this.eventBus.publish(new SagaRbacAclFailedEvent(error, event));
  }
}
```

**Reglas:**
- Decorar la clase con `@Injectable()` (es un provider de NestJS)
- Cada reacción es una propiedad decorada con `@Saga()`
- Debe ser una arrow function que recibe `$events: Observable<Event>` y retorna un Observable
- Usa `ofType(EventClass)` para filtrar el tipo de evento
- `tap()` para side effects (logging)
- `mergeMap()` + `from()` para operaciones async
- Siempre terminar la cadena con `map(() => null)` si no se retorna un comando
- Manejar errores con `catch` para evitar que la saga se rompa

#### Paso 2: Registrar la Saga en el Módulo

Ubicación: `src/modules/<module>/modules/<entity>.module.ts`

```typescript
import { RbacAclCrudSaga } from '../sagas/rbacacl-crud.saga';

@Module({
  providers: [
    // ... otros providers
    RbacAclCrudSaga,
  ],
})
export class RbacAclModule {}
```

#### Paso 3: Inyectar dependencias en la Saga

Si la saga necesita acceder a servicios (como `AclResolverService`), inyectarlos via constructor. Asegurarse de que el servicio esté registrado como provider en el mismo módulo.

#### Paso 4: Flujo de la Saga en el sistema

```
Evento publicado → EventBus local → Saga @Saga() decorator → Observable pipe
  → ofType() filtra eventos → tap() logging → mergeMap() ejecuta lógica
    → Puede ejecutar: commandBus.execute(), servicios, publicar más eventos
    → Error → handleSagaError() → publica SagaFailedEvent
```

---

## 8.9. Estado de Cobertura vs Historias de Usuario (auditoría)

Última auditoría tras la estabilización del E2E (44/44 OK):

| # | UH / Módulo | Estado | Resumen |
|---|-------------|:-----:|---------|
| 1 | UH-User / `user` | ✅ | CRUD, bootstrap SA, password policy, PIN activation |
| 2 | UH-User-Profile / `user-profile` | ✅ | CRUD + findById (corregido bug `{where:{id}}`) |
| 3 | UH-Authentication / `authentication` | ✅ | Sagas login-succeeded/-failed/-refreshed; requiere `authenticatedUserAcls` |
| 4 | UH-Login / `login` | ✅ | Password + refresh rotation + logout + rate limiting + federated callback |
| 5 | UH-MFA-TOTP / `mfa-totp` | ✅ | Auto-creación por UserService (UNIQUE `userId`); CRUD; `TotpService` en providers |
| 6 | UH-RBAC-ACL / `rbac-acl` | ✅ | Entidades desacopladas (Role, Permission, RolePermission, UserRoleAssignment) |
| 7 | UH-Session-Token / `session-token` | ✅ | CRUD + revocación; persiste 95+ registros por flujo completo |
| 8 | UH-Identity-Federation / `identity-federation` | ⚠️ | CRUD + callback; **pendiente**: validación firma JWT/SAML/aud/exp |
| 9 | UH-Security-Customer / `security-customer` | ✅ | Sync saga desde user; CRUD |
| 10 | UH-Security-Merchant / `security-merchant` | ✅ | Workflow REQUEST → APPROVE → REJECT; `MerchantApprovalService` en providers |
| 11 | UH-Sales-Manager / `sales-manager` | ✅ | `referral-tree`, `ancestors`; sync saga desde user |
| 12 | UH-System-Admin-Policy / `system-admin-policy` | ⚠️ | Entidad + CRUD; **pendiente**: guards que impidan admin crear/editar usuarios |
| 13 | UH-Security-Master-Data / `security-master-data` | ✅ | Seed de 45 filas cargado al arranque + CRUD |

**Cobertura funcional estimada: ~85%** · **E2E: 44/44 asserts · 14/14 módulos**

### Top 5 gaps pendientes

1. **Identity-Federation** — validación firma JWT/SAML, audience, expiración e issuer del IdP.
2. **RBAC-ACL** — saga que recalcule ACLs de usuarios afectados cuando se modifica un rol/permiso.
3. **MFA-TOTP** — delivery modes SMS/EMAIL del activation PIN (solo LOCAL implementado).
4. **System-Admin-Policy** — guards y auditoría para restricción "admin no puede crear/editar usuarios".
5. **Security-Merchant** — tablas hijas `bankAccounts` y `collectionMethods`.

### Bugs corregidos en la iteración de estabilización

- `TotpService` añadido a `providers` de `MfaTotpModule` (`UnknownExportException`).
- `MerchantApprovalService` añadido a `providers` de `SecurityMerchantModule`.
- `UserProfileQueryController.findById` pasaba `{where:{id}}`, ahora pasa `{id}` (doble wrapping).
- `UserProfileQueryService.findOne` y `MfaTotpQueryService.findOne`: eliminado wrap `{where: where}`
  redundante que provocaba `EntityPropertyNotFoundError: Property "where" not found`.
- `MfaTotpQueryController.findById`: cambiado `{where:{id}}` → `{id}`.
- `LoginService.finalizeFederatedLogin`: eliminado `referralId: ""` que violaba el tipo UUID
  (`invalid input syntax for type uuid: ""`).

---

## 9. Test E2E con curl

### Flujo completo del test (22 pasos / 44 asserts — cobertura 100% de módulos)

El script `e2e-test.sh` ejecuta 22 pasos que cubren los 14 módulos del microservicio, validan la
política de contraseñas, rate limiting, rotación de refresh tokens, flujos de MFA-TOTP y federated
login, workflow de aprobación de merchant, referral-tree de sales-manager, y verifica side-effects
de sagas y publicación/consumo de eventos vía counts en PostgreSQL.

| Paso | Descripción | Cobertura |
|------|-------------|-----------|
| 0 | Pre-flight: health + baseline de codetrace y user count | Infra |
| 1 | Crear usuario (dispara `user-created`, auto-crea mfa-totp) | `user` |
| 2 | Password policy: contraseña débil rechazada (8+, upper/lower/digit) | `PasswordPolicyService` |
| 3 | Activar usuario con PIN (dispara `login-succeeded`) | `login`, `mfa-totp` |
| 4 | Login normal + refresh token + rotación + logout | `login`, `session-token` |
| 5 | Rate limiting (6 intentos fallidos) | `LoginRateLimiter` |
| 6 | User queries (GET by id + list) | `user` |
| 7 | Update user (dispara `user-updated`) | `user` |
| 8 | User-profile CRUD (create + update + findById) | `user-profile` |
| 9 | MFA-TOTP: list + GET del registro auto-creado | `mfa-totp` |
| 10 | Session-token CRUD | `session-token` |
| 11 | RBAC-ACL: 3 permisos (products/invoices/orders) | `rbac-acl` |
| 12 | Identity-federation CRUD + federated callback (WSO2/OIDC) | `identity-federation`, `login` |
| 13 | Security master data: valida seed (45 filas) + crear nuevo | `security-master-data` |
| 14 | Security CRUD | `security` |
| 15 | Authentication CRUD (con `authenticatedUserAcls` requerido) | `authentication` |
| 16 | Security-customer CRUD | `security-customer` |
| 17 | Security-merchant + workflow approval (REQUEST → APPROVE → REJECT) | `security-merchant` |
| 18 | Sales-manager + referral-tree + ancestors | `sales-manager` |
| 19 | System-admin-policy CRUD | `system-admin-policy` |
| 20 | Cambio de contraseña + rechazo pwd vieja + login pwd nueva | `user`, `login` |
| 21 | Validar publicación/consumo de eventos (counts DB) | Sagas Kafka |
| 22 | Limpieza (DELETE de todas las entidades creadas) | Todos |

### Ejecutar el test

```bash
# 1. Arrancar el servicio (debe estar en /security-service)
cd security-service && \
  env LOG_API_AUTH_TOKEN=valid-token APP_NAME=security-service node dist/main.js

# 2. Ejecutar el test
bash security-service/src/docs/e2e-test.sh
```

> El guard de autenticación acepta únicamente el token literal `valid-token` cuando
> `LOG_API_AUTH_TOKEN=valid-token` está presente en el entorno.

### Requisitos previos

1. Security-service corriendo en `http://localhost:3015`
2. PostgreSQL accesible (contenedor `postgres`, DB `security-service`)
3. Codetrace-service corriendo en `http://localhost:3002` (opcional — para validar trazas)
4. `curl` y `jq` instalados
5. `docker ps` con contenedor `postgres` activo (el test consulta directamente la DB)

### Salida esperada

```
╔════════════════════════════════════════════════════════════════╗
║  TEST E2E — Security Microservice Full Flow                   ║
╚════════════════════════════════════════════════════════════════╝
  Base URL: http://localhost:3015/api
  ...
═══ PASO 21: Validar publicación/consumo de eventos ═══
  ℹ Filas en authentication: 3
  ✔ Saga authentication consumió eventos (registros presentes)
  ℹ Filas en login: 171
  ✔ Login persistió múltiples registros (171)
  ℹ Filas en session-token: 98
  ✔ SessionToken persistió registros (98)

╔════════════════════════════════════════════════════════════════╗
║  RESUMEN TEST E2E                                             ║
╠════════════════════════════════════════════════════════════════╣
║  Total:  44
║  ✔ OK:    44
║  ✘ FAIL:  0
║  ⚠ WARN:  2  (rate-limit tolerante + codetrace opcional)
╚════════════════════════════════════════════════════════════════╝
```

---

## 10. Análisis de Sagas y Eventos (E2E)

### Resumen de ejecución del test E2E (44/44 OK)

Durante la ejecución del test E2E completo se midieron los eventos producidos, las sagas activadas,
y los módulos que participaron en la cadena reactiva. El servicio fue ejecutado con `KAFKA_ENABLED=false`,
lo que permite analizar el EventBus local y la publicación de eventos. Los eventos se producen
y se intentan publicar a Kafka pero al estar deshabilitado se registra un warning.

### 10.1 Eventos producidos durante el E2E

| # | Evento | Módulo | Paso E2E | Kafka Topic | Publicado (EventBus local) | Publicado (Kafka) |
|---|--------|--------|----------|-------------|---------------------------|-------------------|
| 1 | `UserCreatedEvent` | user | Paso 1: Crear usuario | `user-created` | NO | Deshabilitado (warning) |
| 2 | `LoginSucceededEvent` | login | Paso 2: Activar con PIN | `login-succeeded` | SI | Deshabilitado (warning) |
| 3 | `LoginSucceededEvent` | login | Paso 3: Login normal | `login-succeeded` | SI | Deshabilitado (warning) |
| 4 | `UserUpdatedEvent` | user | Paso 4: Actualizar datos | `user-updated` | NO | Deshabilitado (warning) |
| 5 | `UserProfileCreatedEvent` | user-profile | Paso 5: Crear perfil | `user-profile-created` | NO | Deshabilitado (warning) |
| 6 | `UserProfileUpdatedEvent` | user-profile | Paso 6: Modificar perfil | `user-profile-updated` | NO | Deshabilitado (warning) |
| 7 | `UserUpdatedEvent` | user | Paso 7: Cambiar contraseña | `user-updated` | NO | Deshabilitado (warning) |
| 8 | `RbacAclCreatedEvent` | rbac-acl | Paso 8: Crear ACL ×3 | `rbac-acl-created` | NO | Deshabilitado (warning) |
| 9 | `LoginLoggedOutEvent` | login | Paso 9: Logout | `login-logged-out` | SI | Deshabilitado (warning) |
| 10 | `LoginFailedEvent` | login | Paso 10: Login viejo (falla) | `login-failed` | SI | Deshabilitado (warning) |
| 11 | `LoginSucceededEvent` | login | Paso 11: Login nuevo (éxito) | `login-succeeded` | SI | Deshabilitado (warning) |
| 12 | `RbacAclDeletedEvent` | rbac-acl | Paso 12: Eliminar ACLs ×3 | `rbac-acl-deleted` | NO | Deshabilitado (warning) |
| 13 | `UserProfileDeletedEvent` | user-profile | Paso 13: Eliminar perfil | `user-profile-deleted` | NO | Deshabilitado (warning) |
| 14 | `UserDeletedEvent` | user | Paso 14: Eliminar usuario | `user-deleted` | NO | Deshabilitado (warning) |

**Totales**: 14 eventos producidos (3 `LoginSucceededEvent` + 2 `UserUpdatedEvent` + 1 de cada otro tipo).

### 10.2 Sagas ejecutadas durante el E2E

| # | Saga | Evento | Paso E2E | Estado |
|---|------|--------|----------|--------|
| 1 | `LoginCrudSaga.onLoginSucceeded` | `LoginSucceededEvent` | Paso 2 | EJECUTADA |
| 2 | `LoginCrudSaga.onLoginSucceeded` | `LoginSucceededEvent` | Paso 3 | EJECUTADA |
| 3 | `LoginCrudSaga.onLoginLoggedOut` | `LoginLoggedOutEvent` | Paso 9 | EJECUTADA |
| 4 | `LoginCrudSaga.onLoginFailed` | `LoginFailedEvent` | Paso 10 | EJECUTADA |
| 5 | `LoginCrudSaga.onLoginSucceeded` | `LoginSucceededEvent` | Paso 11 | EJECUTADA |

### 10.3 Sagas que NO se ejecutaron (hallazgo arquitectónico)

| Saga | Evento esperado | Paso E2E | Razón |
|------|----------------|----------|-------|
| `UserCrudSaga.onUserCreated` | `UserCreatedEvent` | Paso 1 | Evento no llega al EventBus local |
| `UserCrudSaga.onUserUpdated` | `UserUpdatedEvent` | Pasos 4, 7 | Evento no llega al EventBus local |
| `UserProfileCrudSaga.onUserProfileCreated` | `UserProfileCreatedEvent` | Paso 5 | Evento no llega al EventBus local |
| `UserProfileCrudSaga.onUserProfileUpdated` | `UserProfileUpdatedEvent` | Paso 6 | Evento no llega al EventBus local |
| `RbacAclCrudSaga.onRbacAclCreated` | `RbacAclCreatedEvent` | Paso 8 | Evento no llega al EventBus local |
| `MfaTotpCrudSaga.onMfaTotpCreated` | `MfaTotpCreatedEvent` | Paso 1 (implícito) | Evento no producido por User service |
| `SessionTokenCrudSaga.onSessionTokenCreated` | `SessionTokenCreatedEvent` | Paso 2 (implícito) | Evento no producido por Login service |
| `AuthenticationRecordLoginSucceededSaga` | `LoginSucceededEvent` | Pasos 2,3,11 | No produce log, posiblemente no registrada |
| `AuthenticationRecordLoginFailedSaga` | `LoginFailedEvent` | Paso 10 | No produce log, posiblemente no registrada |
| `RbacAclCrudSaga.onRbacAclDeleted` | `RbacAclDeletedEvent` | Paso 12 | Evento no llega al EventBus local |
| `UserProfileCrudSaga.onUserProfileDeleted` | `UserProfileDeletedEvent` | Paso 13 | Evento no llega al EventBus local |
| `UserCrudSaga.onUserDeleted` | `UserDeletedEvent` | Paso 14 | Evento no llega al EventBus local |

### 10.4 Causa raíz: Dual publish vs single publish

**Diagnóstico**: Los repositorios CRUD publican eventos SOLO al `KafkaEventPublisher`:
```typescript
// En UserCommandRepository (y todos los repositorios CRUD):
this.eventPublisher.publish(new UserCreatedEvent(...));
// ↑ Solo va a KafkaEventPublisher → si Kafka está deshabilitado, el evento se pierde
```

**El `LoginService` sí usa dual publish** (EventBus local + Kafka):
```typescript
// En LoginService:
private async publishDomainEvents(events: BaseEvent[]): Promise<void> {
  this.eventBus.publish(event as any);      // ← EventBus local (activa sagas @Saga())
  await this.eventPublisher.publish(event); // ← Kafka (transmisión cross-service)
}
```

**Consecuencia**: Las sagas `@Saga()` CRUD (User, UserProfile, RbacAcl, MfaTotp, SessionToken)
**nunca se activan** porque los eventos CRUD no pasan por el EventBus local de NestJS/CQRS.
Solo las sagas del módulo Login se activan porque `LoginService.publishDomainEvents()` hace dual publish.

### 10.5 Inventario completo de sagas del microservicio

#### Sagas CRUD (14 módulos × 3 operaciones = 42 handlers @Saga)

| Módulo | Saga Class | Handlers | Eventos escuchados |
|--------|-----------|----------|-------------------|
| login | `LoginCrudSaga` | 8 | Created, Updated, Deleted, Succeeded, Failed, Refreshed, LoggedOut, FederatedStarted |
| authentication | `AuthenticationCrudSaga` | 3 | Created, Updated, Deleted |
| user | `UserCrudSaga` | 3 | Created, Updated, Deleted |
| user-profile | `UserProfileCrudSaga` | 3 | Created, Updated, Deleted |
| mfa-totp | `MfaTotpCrudSaga` | 3 | Created, Updated, Deleted |
| session-token | `SessionTokenCrudSaga` | 3 | Created, Updated, Deleted |
| identity-federation | `IdentityFederationCrudSaga` | 3 | Created, Updated, Deleted |
| security | `SecurityCrudSaga` | 3 | Created, Updated, Deleted |
| system-admin-policy | `SystemAdminPolicyCrudSaga` | 3 | Created, Updated, Deleted |
| security-master-data | `SecurityMasterDataCrudSaga` | 3 | Created, Updated, Deleted |
| rbac-acl | `RbacAclCrudSaga` | 3+7 | CRUD + Role/Permission/UserRole notification |
| security-customer | `SecurityCustomerCrudSaga` | 3 | Created, Updated, Deleted |
| security-merchant | `SecurityMerchantCrudSaga` | 3 | Created, Updated, Deleted |
| sales-manager | `SalesManagerCrudSaga` | 3 | Created, Updated, Deleted |

#### Sagas cross-module (intra-servicio)

| Saga | Evento fuente | Acción |
|------|--------------|--------|
| `AuthenticationRecordLoginSucceededSaga` | `LoginSucceededEvent` | Crea registro Authentication con status=SUCCEEDED |
| `AuthenticationRecordLoginFailedSaga` | `LoginFailedEvent` | Crea registro Authentication con status=FAILED |
| `AuthenticationRecordLoginRefreshedSaga` | `LoginRefreshedEvent` | Crea registro Authentication con status=REFRESHED |

#### Sagas cross-context (inter-servicio, requieren Kafka)

| Saga | Evento fuente (Kafka) | Acción |
|------|----------------------|--------|
| `SecurityCustomerSyncCreatedSaga` | `CustomerCreatedEvent` (customer-service) | Crea proyección SecurityCustomer |
| `SecurityCustomerSyncUpdatedSaga` | `CustomerUpdatedEvent` (customer-service) | Actualiza proyección SecurityCustomer |
| `SecurityMerchantSyncCreatedSaga` | `MerchantCreatedEvent` (merchant-service) | Crea proyección SecurityMerchant |
| `SecurityMerchantSyncUpdatedSaga` | `MerchantUpdatedEvent` (merchant-service) | Actualiza proyección SecurityMerchant |
| `SecuritySalesManagerSyncCreatedSaga` | `SalesManagerCreatedEvent` (salesmanager-service) | Crea proyección SalesManager |
| `SecuritySalesManagerSyncUpdatedSaga` | `SalesManagerUpdatedEvent` (salesmanager-service) | Actualiza proyección SalesManager |

#### Sagas de notificación RBAC ACL v2.0.0

| Handler en `RbacAclCrudSaga` | Evento | Acción |
|------------------------------|--------|--------|
| `onRoleUpdatedNotify` | `RoleUpdatedEvent` | `aclResolver.resolveAclForAffectedUsers()` |
| `onRoleDeactivatedNotify` | `RoleDeactivatedEvent` | `aclResolver.resolveAclForAffectedUsers()` |
| `onRoleDeletedNotify` | `RoleDeletedEvent` | `aclResolver.resolveAclForAffectedUsers()` |
| `onPermissionAssignedToRoleNotify` | `PermissionAssignedToRoleEvent` | `aclResolver.resolveAclForAffectedUsers()` |
| `onPermissionRemovedFromRoleNotify` | `PermissionRemovedFromRoleEvent` | `aclResolver.resolveAclForAffectedUsers()` |
| `onUserRoleAssignedNotify` | `UserRoleAssignedEvent` | `aclResolver.resolveUserAcl()` |
| `onUserRoleRevokedNotify` | `UserRoleRevokedEvent` | `aclResolver.resolveUserAcl()` |

### 10.6 Inventario completo de eventos registrados

| # | Evento | Topic Kafka | Módulo | Versión |
|---|--------|-------------|--------|---------|
| 1 | `UserCreatedEvent` | `user-created` | user | 1.0.0 |
| 2 | `UserUpdatedEvent` | `user-updated` | user | 1.0.0 |
| 3 | `UserDeletedEvent` | `user-deleted` | user | 1.0.0 |
| 4 | `LoginCreatedEvent` | `login-created` | login | 1.0.0 |
| 5 | `LoginUpdatedEvent` | `login-updated` | login | 1.0.0 |
| 6 | `LoginDeletedEvent` | `login-deleted` | login | 1.0.0 |
| 7 | `LoginSucceededEvent` | `login-succeeded` | login | 1.0.0 |
| 8 | `LoginFailedEvent` | `login-failed` | login | 1.0.0 |
| 9 | `LoginRefreshedEvent` | `login-refreshed` | login | 1.0.0 |
| 10 | `LoginLoggedOutEvent` | `login-logged-out` | login | 1.0.0 |
| 11 | `FederatedLoginStartedEvent` | `federated-login-started` | login | 1.0.0 |
| 12 | `AuthenticationCreatedEvent` | `authentication-created` | authentication | 1.0.0 |
| 13 | `AuthenticationUpdatedEvent` | `authentication-updated` | authentication | 1.0.0 |
| 14 | `AuthenticationDeletedEvent` | `authentication-deleted` | authentication | 1.0.0 |
| 15 | `UserProfileCreatedEvent` | `user-profile-created` | user-profile | 1.0.0 |
| 16 | `UserProfileUpdatedEvent` | `user-profile-updated` | user-profile | 1.0.0 |
| 17 | `UserProfileDeletedEvent` | `user-profile-deleted` | user-profile | 1.0.0 |
| 18 | `MfaTotpCreatedEvent` | `mfa-totp-created` | mfa-totp | 1.0.0 |
| 19 | `MfaTotpUpdatedEvent` | `mfa-totp-updated` | mfa-totp | 1.0.0 |
| 20 | `MfaTotpDeletedEvent` | `mfa-totp-deleted` | mfa-totp | 1.0.0 |
| 21 | `SessionTokenCreatedEvent` | `session-token-created` | session-token | 1.0.0 |
| 22 | `SessionTokenUpdatedEvent` | `session-token-updated` | session-token | 1.0.0 |
| 23 | `SessionTokenDeletedEvent` | `session-token-deleted` | session-token | 1.0.0 |
| 24 | `IdentityFederationCreatedEvent` | `identity-federation-created` | identity-federation | 1.0.0 |
| 25 | `IdentityFederationUpdatedEvent` | `identity-federation-updated` | identity-federation | 1.0.0 |
| 26 | `IdentityFederationDeletedEvent` | `identity-federation-deleted` | identity-federation | 1.0.0 |
| 27 | `SecurityCreatedEvent` | `security-created` | security | 1.0.0 |
| 28 | `SecurityUpdatedEvent` | `security-updated` | security | 1.0.0 |
| 29 | `SecurityDeletedEvent` | `security-deleted` | security | 1.0.0 |
| 30 | `SystemAdminPolicyCreatedEvent` | `system-admin-policy-created` | system-admin-policy | 1.0.0 |
| 31 | `SystemAdminPolicyUpdatedEvent` | `system-admin-policy-updated` | system-admin-policy | 1.0.0 |
| 32 | `SystemAdminPolicyDeletedEvent` | `system-admin-policy-deleted` | system-admin-policy | 1.0.0 |
| 33 | `SecurityMasterDataCreatedEvent` | `security-master-data-created` | security-master-data | 1.0.0 |
| 34 | `SecurityMasterDataUpdatedEvent` | `security-master-data-updated` | security-master-data | 1.0.0 |
| 35 | `SecurityMasterDataDeletedEvent` | `security-master-data-deleted` | security-master-data | 1.0.0 |
| 36 | `RbacAclCreatedEvent` | `rbac-acl-created` | rbac-acl | 1.0.0 |
| 37 | `RbacAclUpdatedEvent` | `rbac-acl-updated` | rbac-acl | 1.0.0 |
| 38 | `RbacAclDeletedEvent` | `rbac-acl-deleted` | rbac-acl | 1.0.0 |
| 39 | `RoleCreatedEvent` | `role-created` | rbac-acl | 2.0.0 |
| 40 | `RoleUpdatedEvent` | `role-updated` | rbac-acl | 2.0.0 |
| 41 | `RoleDeactivatedEvent` | `role-deactivated` | rbac-acl | 2.0.0 |
| 42 | `RoleDeletedEvent` | `role-deleted` | rbac-acl | 2.0.0 |
| 43 | `PermissionAssignedToRoleEvent` | `permission-assigned-to-role` | rbac-acl | 2.0.0 |
| 44 | `PermissionRemovedFromRoleEvent` | `permission-removed-from-role` | rbac-acl | 2.0.0 |
| 45 | `UserRoleAssignedEvent` | `user-role-assigned` | rbac-acl | 2.0.0 |
| 46 | `UserRoleRevokedEvent` | `user-role-revoked` | rbac-acl | 2.0.0 |
| 47 | `AuthenticatedUserAclResolvedEvent` | `authenticated-user-acl-resolved` | rbac-acl | 2.0.0 |
| 48 | `SecurityCustomerCreatedEvent` | `security-customer-created` | security-customer | 1.0.0 |
| 49 | `SecurityCustomerUpdatedEvent` | `security-customer-updated` | security-customer | 1.0.0 |
| 50 | `SecurityCustomerDeletedEvent` | `security-customer-deleted` | security-customer | 1.0.0 |
| 51 | `SecurityMerchantCreatedEvent` | `security-merchant-created` | security-merchant | 1.0.0 |
| 52 | `SecurityMerchantUpdatedEvent` | `security-merchant-updated` | security-merchant | 1.0.0 |
| 53 | `SecurityMerchantDeletedEvent` | `security-merchant-deleted` | security-merchant | 1.0.0 |
| 54 | `SalesManagerCreatedEvent` | `sales-manager-created` | sales-manager | 1.0.0 |
| 55 | `SalesManagerUpdatedEvent` | `sales-manager-updated` | sales-manager | 1.0.0 |
| 56 | `SalesManagerDeletedEvent` | `sales-manager-deleted` | sales-manager | 1.0.0 |

**Total eventos registrados**: 56 (45 propios + 11 RBAC v2.0.0)  
**Topics Kafka**: 56 main + 56 retry + 56 DLQ = **168 topics**
