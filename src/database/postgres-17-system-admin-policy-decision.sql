-- ====================================================================
-- system_admin_policy_decision_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "system_admin_policy_decision_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('ALLOWED', 'Allowed', 'Allowed', 'Allowed', '{}'::jsonb, 'system', TRUE, 'systemadminpolicydecision'),
  ('DENIED', 'Denied', 'Denied', 'Denied', '{}'::jsonb, 'system', TRUE, 'systemadminpolicydecision'),
  ('AUDITED', 'Audited', 'Audited', 'Audited', '{}'::jsonb, 'system', TRUE, 'systemadminpolicydecision')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
