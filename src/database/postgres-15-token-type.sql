-- ====================================================================
-- token_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "token_type_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('ACCESS', 'Access', 'Access', 'Access', '{}'::jsonb, 'system', TRUE, 'tokentype'),
  ('REFRESH', 'Refresh', 'Refresh', 'Refresh', '{}'::jsonb, 'system', TRUE, 'tokentype'),
  ('INTROSPECTION', 'Introspection', 'Introspection', 'Introspection', '{}'::jsonb, 'system', TRUE, 'tokentype'),
  ('CERTIFICATE', 'Certificate', 'Certificate', 'Certificate', '{}'::jsonb, 'system', TRUE, 'tokentype')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
