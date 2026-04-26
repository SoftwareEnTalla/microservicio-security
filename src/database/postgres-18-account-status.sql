-- ====================================================================
-- account_status_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "account_status_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('PENDING_VERIFICATION', 'Pending Verification', '', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('ACTIVE', 'Active', '', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('INACTIVE', 'Inactive', '', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('BLOCKED', 'Blocked', '', '{}'::jsonb, 'system', TRUE, 'accountstatus'),
  ('SUSPENDED', 'Suspended', '', '{}'::jsonb, 'system', TRUE, 'accountstatus')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
