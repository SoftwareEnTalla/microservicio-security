-- ====================================================================
-- provider_type_base_entity
-- NOMENCLADOR GESTIONABLE
-- Generado a partir de la promocion de enums inline a entidades XML
-- (regla seccion 4.9.6 de docs/help.md). CRUD CQRS completo.
-- Idempotente: INSERT ... ON CONFLICT (code) DO UPDATE.
-- ====================================================================
INSERT INTO "provider_type_base_entity" ("code", "displayName", "description", "metadata", "createdBy", "active", "type")
VALUES
  ('GOOGLE', 'Google', '', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('GITHUB', 'Github', '', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('FIREBASE', 'Firebase', '', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('META', 'Meta', '', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('TWITTER', 'Twitter', '', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('WSO2', 'Wso2', '', '{}'::jsonb, 'system', TRUE, 'providertype'),
  ('GENERIC', 'Generic', '', '{}'::jsonb, 'system', TRUE, 'providertype')
ON CONFLICT ("code") DO UPDATE SET
  "displayName"      = EXCLUDED."displayName",
  "active"           = TRUE,
  "modificationDate" = NOW();
