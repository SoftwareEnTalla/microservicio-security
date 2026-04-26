-- ====================================================================
-- auth_method_2_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "auth_method_2_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('LOCAL_PASSWORD', 'Local Password', '', '{}'::jsonb, 'system', TRUE, 'authmethod2'),
  ('OAUTH', 'Oauth', '', '{}'::jsonb, 'system', TRUE, 'authmethod2'),
  ('OIDC', 'Oidc', '', '{}'::jsonb, 'system', TRUE, 'authmethod2'),
  ('SAML', 'Saml', '', '{}'::jsonb, 'system', TRUE, 'authmethod2')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
