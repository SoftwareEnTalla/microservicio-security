-- ====================================================================
-- delivery_mode_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "delivery_mode_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('LOCAL', 'Local', '', '{}'::jsonb, 'system', TRUE, 'deliverymode'),
  ('SMS', 'Sms', '', '{}'::jsonb, 'system', TRUE, 'deliverymode'),
  ('EMAIL', 'Email', '', '{}'::jsonb, 'system', TRUE, 'deliverymode')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
