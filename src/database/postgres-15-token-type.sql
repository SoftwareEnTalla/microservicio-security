-- ====================================================================
-- token_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "token_type_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('ACCESS', 'Access', '', '{}'::jsonb, 'system', TRUE, 'tokentype'),
  ('REFRESH', 'Refresh', '', '{}'::jsonb, 'system', TRUE, 'tokentype'),
  ('INTROSPECTION', 'Introspection', '', '{}'::jsonb, 'system', TRUE, 'tokentype'),
  ('CERTIFICATE', 'Certificate', '', '{}'::jsonb, 'system', TRUE, 'tokentype')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
