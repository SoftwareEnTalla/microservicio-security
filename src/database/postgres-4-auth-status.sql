-- ====================================================================
-- auth_status_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "auth_status_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('PENDING', 'Pending', 'Pending', 'Pending', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('SUCCEEDED', 'Succeeded', 'Succeeded', 'Succeeded', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('FAILED', 'Failed', 'Failed', 'Failed', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('CHALLENGE_REQUIRED', 'Challenge Required', 'Challenge Required', 'Challenge Required', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('REVALIDATED', 'Revalidated', 'Revalidated', 'Revalidated', '{}'::jsonb, 'system', TRUE, 'authstatus'),
  ('REFRESHED', 'Refreshed', 'Refreshed', 'Refreshed', '{}'::jsonb, 'system', TRUE, 'authstatus')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
