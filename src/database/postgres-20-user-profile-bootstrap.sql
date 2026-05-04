-- ====================================================================
-- user_profile_base_entity
-- BOOTSTRAP OPERATIVO PARA PERFILES EXISTENTES
-- Crea un perfil base por cada usuario que aun no lo tenga.
-- Idempotente: INSERT ... ON CONFLICT (userId) DO UPDATE.
-- ====================================================================
INSERT INTO "user_profile_base_entity" (
  "name",
  "description",
  "userId",
  "metadata",
  "createdBy",
  "isActive",
  "type"
)
SELECT
  COALESCE(NULLIF(u."name", ''), NULLIF(u."username", ''), NULLIF(u."email", ''), u."code") AS "name",
  CONCAT(
    'Perfil inicial de ',
    COALESCE(NULLIF(u."name", ''), NULLIF(u."username", ''), NULLIF(u."email", ''), u."code")
  ) AS "description",
  u."id" AS "userId",
  jsonb_build_object(
    'seedSource',
    'postgres-20-user-profile-bootstrap.sql',
    'email',
    u."email",
    'username',
    NULLIF(u."username", '')
  ) AS "metadata",
  COALESCE(NULLIF(u."createdBy", ''), 'system') AS "createdBy",
  TRUE AS "isActive",
  'userprofile' AS "type"
FROM "user_base_entity" u
WHERE u."type" = 'user'
ON CONFLICT ("userId") DO UPDATE SET
  "name"             = EXCLUDED."name",
  "description"      = EXCLUDED."description",
  "metadata"         = EXCLUDED."metadata",
  "isActive"         = TRUE,
  "modificationDate" = NOW();