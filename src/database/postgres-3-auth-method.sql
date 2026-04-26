-- ====================================================================
-- auth_method_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "auth_method_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('LOCAL_PASSWORD', 'Local Password', '', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('OAUTH', 'Oauth', '', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('OIDC', 'Oidc', '', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('SAML', 'Saml', '', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('TOTP', 'Totp', '', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('RECOVERY_CODE', 'Recovery Code', '', '{}'::jsonb, 'system', TRUE, 'authmethod')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
