DO $$
DECLARE
  canonical_email text := '${SQL:SA_EMAIL}';
  canonical_password_hash text := '${SQL_SHA256:SA_PWD}';
  canonical_metadata json := '{"acls":{"role":"SUPER_ADMIN","permissions":["*"]}}'::json;
  admin_user_id uuid;
BEGIN
  SELECT id
  INTO admin_user_id
  FROM user_base_entity
  WHERE code = 'security-super-admin'
     OR email = canonical_email
     OR "identifierValue" = canonical_email
     OR username = canonical_email
  ORDER BY
    CASE WHEN code = 'security-super-admin' THEN 0 ELSE 1 END,
    "creationDate" ASC NULLS FIRST,
    id ASC
  LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    DELETE FROM user_base_entity
    WHERE id <> admin_user_id
      AND (
        code = 'security-super-admin'
        OR email = canonical_email
        OR "identifierValue" = canonical_email
        OR username = canonical_email
      );

    UPDATE user_base_entity
    SET
      type = 'user',
      "modificationDate" = NOW(),
      "createdBy" = 'database-init',
      "isActive" = true,
      name = 'Super Admin',
      description = 'Usuario inicial generado durante el despliegue del microservicio security',
      code = 'security-super-admin',
      username = canonical_email,
      email = canonical_email,
      phone = NULL,
      "passwordHash" = canonical_password_hash,
      "identifierType" = 'EMAIL',
      "identifierValue" = canonical_email,
      "accountStatus" = 'ACTIVE',
      "userType" = 'ADMIN',
      "termsAccepted" = true,
      "termsAcceptedAt" = COALESCE("termsAcceptedAt", NOW()),
      "passwordChangedAt" = NOW(),
      "mfaEnabled" = false,
      "totpEnabled" = false,
      "federatedOnly" = false,
      metadata = canonical_metadata
    WHERE id = admin_user_id;
  ELSE
    INSERT INTO user_base_entity (
      id,
      type,
      "creationDate",
      "modificationDate",
      "createdBy",
      "isActive",
      name,
      description,
      code,
      username,
      email,
      phone,
      "passwordHash",
      "identifierType",
      "identifierValue",
      "accountStatus",
      "userType",
      "termsAccepted",
      "termsAcceptedAt",
      "passwordChangedAt",
      "mfaEnabled",
      "totpEnabled",
      "federatedOnly",
      metadata
    ) VALUES (
      uuid_generate_v4(),
      'user',
      NOW(),
      NOW(),
      'database-init',
      true,
      'Super Admin',
      'Usuario inicial generado durante el despliegue del microservicio security',
      'security-super-admin',
      canonical_email,
      canonical_email,
      NULL,
      canonical_password_hash,
      'EMAIL',
      canonical_email,
      'ACTIVE',
      'ADMIN',
      true,
      NOW(),
      NOW(),
      false,
      false,
      false,
      canonical_metadata
    );
  END IF;
END $$;
