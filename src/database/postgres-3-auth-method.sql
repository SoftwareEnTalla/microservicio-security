-- ====================================================================
-- auth_method_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "auth_method_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('LOCAL_PASSWORD', 'Local Password', 'Local Password', 'Local Password', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('OAUTH', 'Oauth', 'Oauth', 'Oauth', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('OIDC', 'Oidc', 'Oidc', 'Oidc', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('SAML', 'Saml', 'Saml', 'Saml', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('TOTP', 'Totp', 'Totp', 'Totp', '{}'::jsonb, 'system', TRUE, 'authmethod'),
  ('RECOVERY_CODE', 'Recovery Code', 'Recovery Code', 'Recovery Code', '{}'::jsonb, 'system', TRUE, 'authmethod')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
