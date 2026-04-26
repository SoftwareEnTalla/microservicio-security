-- ====================================================================
-- protocol_family_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "protocol_family_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('OAUTH', 'Oauth', '', '{}'::jsonb, 'system', TRUE, 'protocolfamily'),
  ('OIDC', 'Oidc', '', '{}'::jsonb, 'system', TRUE, 'protocolfamily'),
  ('SAML', 'Saml', '', '{}'::jsonb, 'system', TRUE, 'protocolfamily')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
