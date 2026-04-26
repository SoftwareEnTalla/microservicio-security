-- ====================================================================
-- challenge_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "challenge_type_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('TOTP', 'Totp', '', '{}'::jsonb, 'system', TRUE, 'challengetype'),
  ('RECOVERY_CODE', 'Recovery Code', '', '{}'::jsonb, 'system', TRUE, 'challengetype'),
  ('OUT_OF_BAND', 'Out Of Band', '', '{}'::jsonb, 'system', TRUE, 'challengetype')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
