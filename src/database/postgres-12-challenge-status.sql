-- ====================================================================
-- challenge_status_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "challenge_status_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('NOT_REQUIRED', 'Not Required', '', '{}'::jsonb, 'system', TRUE, 'challengestatus'),
  ('PENDING', 'Pending', '', '{}'::jsonb, 'system', TRUE, 'challengestatus'),
  ('VERIFIED', 'Verified', '', '{}'::jsonb, 'system', TRUE, 'challengestatus'),
  ('FAILED', 'Failed', '', '{}'::jsonb, 'system', TRUE, 'challengestatus'),
  ('EXPIRED', 'Expired', '', '{}'::jsonb, 'system', TRUE, 'challengestatus')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
