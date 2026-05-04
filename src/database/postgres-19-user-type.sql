-- ====================================================================
-- user_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "user_type_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('USER', 'User', 'User', 'User', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('CUSTOMER', 'Customer', 'Customer', 'Customer', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('MERCHANT', 'Merchant', 'Merchant', 'Merchant', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('ADMIN', 'Admin', 'Admin', 'Admin', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('SALES_MANAGER', 'Sales Manager', 'Sales Manager', 'Sales Manager', '{}'::jsonb, 'system', TRUE, 'usertype')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
