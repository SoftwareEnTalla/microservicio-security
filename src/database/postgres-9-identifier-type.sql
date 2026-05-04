-- ====================================================================
-- identifier_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "identifier_type_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('EMAIL', 'Email', 'Email', 'Email', '{}'::jsonb, 'system', TRUE, 'identifiertype'),
  ('USERNAME', 'Username', 'Username', 'Username', '{}'::jsonb, 'system', TRUE, 'identifiertype'),
  ('PHONE', 'Phone', 'Phone', 'Phone', '{}'::jsonb, 'system', TRUE, 'identifiertype')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"         = TRUE,
  "modificationDate" = NOW();