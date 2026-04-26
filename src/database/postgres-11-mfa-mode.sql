-- ====================================================================
-- mfa_mode_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "mfa_mode_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('OPTIONAL', 'Optional', '', '{}'::jsonb, 'system', TRUE, 'mfamode'),
  ('REQUIRED', 'Required', '', '{}'::jsonb, 'system', TRUE, 'mfamode'),
  ('STEP_UP', 'Step Up', '', '{}'::jsonb, 'system', TRUE, 'mfamode')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
