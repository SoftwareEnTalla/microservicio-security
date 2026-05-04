-- ====================================================================
-- flow_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "flow_type_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('PASSWORD', 'Password', 'Password', 'Password', '{}'::jsonb, 'system', TRUE, 'flowtype'),
  ('FEDERATED', 'Federated', 'Federated', 'Federated', '{}'::jsonb, 'system', TRUE, 'flowtype'),
  ('REFRESH', 'Refresh', 'Refresh', 'Refresh', '{}'::jsonb, 'system', TRUE, 'flowtype'),
  ('LOGOUT', 'Logout', 'Logout', 'Logout', '{}'::jsonb, 'system', TRUE, 'flowtype')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
