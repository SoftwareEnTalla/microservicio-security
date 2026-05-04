-- ====================================================================
-- delivery_mode_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "delivery_mode_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('LOCAL', 'Local', 'Local', 'Local', '{}'::jsonb, 'system', TRUE, 'deliverymode'),
  ('SMS', 'Sms', 'Sms', 'Sms', '{}'::jsonb, 'system', TRUE, 'deliverymode'),
  ('EMAIL', 'Email', 'Email', 'Email', '{}'::jsonb, 'system', TRUE, 'deliverymode')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
