-- ====================================================================
-- flow_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "flow_type_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('PASSWORD', 'Password', '', '{}'::jsonb, 'system', TRUE, 'flowtype'),
  ('FEDERATED', 'Federated', '', '{}'::jsonb, 'system', TRUE, 'flowtype'),
  ('REFRESH', 'Refresh', '', '{}'::jsonb, 'system', TRUE, 'flowtype'),
  ('LOGOUT', 'Logout', '', '{}'::jsonb, 'system', TRUE, 'flowtype')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
