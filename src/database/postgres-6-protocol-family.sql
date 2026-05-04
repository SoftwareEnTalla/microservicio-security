-- ====================================================================
-- protocol_family_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "protocol_family_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('OAUTH', 'Oauth', 'Oauth', 'Oauth', '{}'::jsonb, 'system', TRUE, 'protocolfamily'),
  ('OIDC', 'Oidc', 'Oidc', 'Oidc', '{}'::jsonb, 'system', TRUE, 'protocolfamily'),
  ('SAML', 'Saml', 'Saml', 'Saml', '{}'::jsonb, 'system', TRUE, 'protocolfamily')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
