-- ====================================================================
-- login_identifier_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "login_identifier_type_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('USERNAME', 'Username', 'Username', 'Username', '{}'::jsonb, 'system', TRUE, 'loginidentifiertype'),
  ('EMAIL', 'Email', 'Email', 'Email', '{}'::jsonb, 'system', TRUE, 'loginidentifiertype'),
  ('PHONE', 'Phone', 'Phone', 'Phone', '{}'::jsonb, 'system', TRUE, 'loginidentifiertype'),
  ('IDENTIFIER_VALUE', 'Identifier Value', 'Identifier Value', 'Identifier Value', '{}'::jsonb, 'system', TRUE, 'loginidentifiertype'),
  ('EXTERNAL_SUBJECT', 'External Subject', 'External Subject', 'External Subject', '{}'::jsonb, 'system', TRUE, 'loginidentifiertype')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
