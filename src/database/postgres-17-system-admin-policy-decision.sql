-- ====================================================================
-- system_admin_policy_decision_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "system_admin_policy_decision_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('ALLOWED', 'Allowed', '', '{}'::jsonb, 'system', TRUE, 'systemadminpolicydecision'),
  ('DENIED', 'Denied', '', '{}'::jsonb, 'system', TRUE, 'systemadminpolicydecision'),
  ('AUDITED', 'Audited', '', '{}'::jsonb, 'system', TRUE, 'systemadminpolicydecision')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
