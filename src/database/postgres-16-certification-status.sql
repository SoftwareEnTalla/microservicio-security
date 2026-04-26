-- ====================================================================
-- certification_status_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "certification_status_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('ISSUED', 'Issued', '', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('VALIDATED', 'Validated', '', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('REVOKED', 'Revoked', '', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('EXPIRED', 'Expired', '', '{}'::jsonb, 'system', TRUE, 'certificationstatus'),
  ('LOGGED_OUT', 'Logged Out', '', '{}'::jsonb, 'system', TRUE, 'certificationstatus')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
