-- ====================================================================
-- auth_status_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "auth_status_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('PENDING', 'Pending', '', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('SUCCEEDED', 'Succeeded', '', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('FAILED', 'Failed', '', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('CHALLENGE_REQUIRED', 'Challenge Required', '', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('REVALIDATED', 'Revalidated', '', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('REFRESHED', 'Refreshed', '', '{}'::jsonb, 'system', TRUE, 'authstatus')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
