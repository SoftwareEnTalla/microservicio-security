DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM user_base_entity
    WHERE email = '${SQL:SA_EMAIL}'
       OR "identifierValue" = '${SQL:SA_EMAIL}'
       OR username = '${SQL:SA_EMAIL}'
      OR code = 'security-super-admin'
  ) THEN
    UPDATE user_base_entity
    SET
      type = 'user',
      "modificationDate" = NOW(),
      "createdBy" = 'database-init',
      "isActive" = true,
      name = 'Super Admin',
      description = 'Usuario inicial generado durante el despliegue del microservicio security',
      code = 'security-super-admin',
      username = '${SQL:SA_EMAIL}',
      email = '${SQL:SA_EMAIL}',
      phone = '',
      "passwordHash" = '${SQL_SHA256:SA_PWD}',
      "identifierType" = 'EMAIL',
      "identifierValue" = '${SQL:SA_EMAIL}',
      "accountStatus" = 'ACTIVE',
      "userType" = 'ADMIN',
      "termsAccepted" = true,
      "termsAcceptedAt" = NOW(),
      "passwordChangedAt" = NOW(),
      "mfaEnabled" = false,
      "totpEnabled" = false,
      "federatedOnly" = false,
      metadata = '{"acls":{"role":"SUPER_ADMIN","permissions":["*"]}}'::json
    WHERE email = '${SQL:SA_EMAIL}'
       OR "identifierValue" = '${SQL:SA_EMAIL}'
       OR username = '${SQL:SA_EMAIL}'
       OR code = 'security-super-admin';
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
      '${SQL:SA_EMAIL}',
      '${SQL:SA_EMAIL}',
      '',
      '${SQL_SHA256:SA_PWD}',
      'EMAIL',
      '${SQL:SA_EMAIL}',
      'ACTIVE',
      'ADMIN',
      true,
      NOW(),
      NOW(),
      false,
      false,
      false,
      '{"acls":{"role":"SUPER_ADMIN","permissions":["*"]}}'::json
    );
  END IF;
END $$;
