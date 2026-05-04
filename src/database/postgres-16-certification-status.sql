-- ====================================================================
-- certification_status_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "certification_status_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('ISSUED', 'Issued', 'Issued', 'Issued', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('VALIDATED', 'Validated', 'Validated', 'Validated', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('REVOKED', 'Revoked', 'Revoked', 'Revoked', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('EXPIRED', 'Expired', 'Expired', 'Expired', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('LOGGED_OUT', 'Logged Out', 'Logged Out', 'Logged Out', '{}'::jsonb, 'system', TRUE, 'certificationstatus')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
