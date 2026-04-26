-- ====================================================================
-- user_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "user_type_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('USER', 'User', '', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('CUSTOMER', 'Customer', '', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('MERCHANT', 'Merchant', '', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('ADMIN', 'Admin', '', '{}'::jsonb, 'system', TRUE, 'usertype'),
  ('SALES_MANAGER', 'Sales Manager', '', '{}'::jsonb, 'system', TRUE, 'usertype')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
