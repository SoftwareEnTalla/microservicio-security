-- ====================================================================
-- auth_status_2_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "auth_status_2_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('PENDING', 'Pending', '', '{}'::jsonb, 'system', TRUE, 'authstatus2'),
  ('SUCCEEDED', 'Succeeded', '', '{}'::jsonb, 'system', TRUE, 'authstatus2'),
  ('FAILED', 'Failed', '', '{}'::jsonb, 'system', TRUE, 'authstatus2'),
  ('REFRESHED', 'Refreshed', '', '{}'::jsonb, 'system', TRUE, 'authstatus2'),
  ('LOGGED_OUT', 'Logged Out', '', '{}'::jsonb, 'system', TRUE, 'authstatus2'),
  ('REDIRECT_REQUIRED', 'Redirect Required', '', '{}'::jsonb, 'system', TRUE, 'authstatus2'),
  ('CHALLENGE_REQUIRED', 'Challenge Required', '', '{}'::jsonb, 'system', TRUE, 'authstatus2')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
