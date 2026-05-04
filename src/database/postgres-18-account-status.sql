-- ====================================================================
-- account_status_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "account_status_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('PENDING_VERIFICATION', 'Pending Verification', 'Pending Verification', 'Pending Verification', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('ACTIVE', 'Active', 'Active', 'Active', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('INACTIVE', 'Inactive', 'Inactive', 'Inactive', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('BLOCKED', 'Blocked', 'Blocked', 'Blocked', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('SUSPENDED', 'Suspended', 'Suspended', 'Suspended', '{}'::jsonb, 'system', TRUE, 'accountstatus')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
