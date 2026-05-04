-- ====================================================================
-- mfa_mode_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "mfa_mode_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('OPTIONAL', 'Optional', 'Optional', 'Optional', '{}'::jsonb, 'system', TRUE, 'mfamode'),
  ('REQUIRED', 'Required', 'Required', 'Required', '{}'::jsonb, 'system', TRUE, 'mfamode'),
  ('STEP_UP', 'Step Up', 'Step Up', 'Step Up', '{}'::jsonb, 'system', TRUE, 'mfamode')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
