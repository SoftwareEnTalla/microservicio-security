-- ====================================================================
-- provider_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "provider_type_base_entity" ("code", "name", "displayName", "description", "metadata", "createdBy", "isActive", "type")
VALUES
  ('GOOGLE', 'Google', 'Google', 'Google', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('GITHUB', 'Github', 'Github', 'Github', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('FIREBASE', 'Firebase', 'Firebase', 'Firebase', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('META', 'Meta', 'Meta', 'Meta', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('TWITTER', 'Twitter', 'Twitter', 'Twitter', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('WSO2', 'Wso2', 'Wso2', 'Wso2', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('GENERIC', 'Generic', 'Generic', 'Generic', '{}'::jsonb, 'system', TRUE, 'providertype')
ON CONFLICT ("code") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "displayName"      = EXCLUDED."displayName",
  "description"      = EXCLUDED."description",
  "isActive"           = TRUE,
  "modificationDate" = NOW();
