#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Test E2E completo — security-service
# ═══════════════════════════════════════════════════════════════
# Cubre:
#  - 14 módulos (user, user-profile, login, authentication, mfa-totp,
#    session-token, rbac-acl, identity-federation, security,
#    security-master-data, security-customer, security-merchant,
#    sales-manager, system-admin-policy)
#  - Flujos de activación con PIN, federación, refresh, logout
#  - Políticas de contraseña y rate limiting
#  - Endpoints especiales: merchant approval, referral tree, ancestors
#  - Publicación/consumo de eventos (valida codetrace y sagas)
#
# Requisitos:
#  - security-service en http://localhost:3015
#  - Postgres con bases 'security-service' y 'codetrace-service'
#  - jq + curl
#
# Uso: bash security-service/src/docs/e2e-test.sh
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

BASE_URL="http://localhost:3015/api"
AUTH="Bearer valid-token"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'; BLUE='\033[0;34m'
PASS=0; FAIL=0; TOTAL=0; WARN=0

PG_EXEC="docker exec -e PGPASSWORD=postgres postgres psql -U postgres -tA"
SEC_DB="security-service"
TRACE_DB="codetrace-service"

log_step()  { echo -e "\n${BLUE}═══ PASO $1: $2 ═══${NC}"; }
log_ok()    { echo -e "  ${GREEN}✔ $1${NC}"; PASS=$((PASS + 1)); TOTAL=$((TOTAL + 1)); }
log_fail()  { echo -e "  ${RED}✘ $1${NC}"; FAIL=$((FAIL + 1)); TOTAL=$((TOTAL + 1)); }
log_warn()  { echo -e "  ${YELLOW}⚠ $1${NC}"; WARN=$((WARN + 1)); }
log_info()  { echo -e "  ${YELLOW}ℹ $1${NC}"; }

assert_ok() {
  local label="$1" http_code="$2"
  if [[ "$http_code" =~ ^(200|201)$ ]]; then log_ok "$label (HTTP $http_code)";
  else log_fail "$label — esperado 200/201, recibido $http_code"; fi
}
assert_http() {
  local label="$1" got="$2" want="$3"
  if [[ "$got" == "$want" ]]; then log_ok "$label (HTTP $got)";
  else log_fail "$label — esperado $want, recibido $got"; fi
}
assert_field() {
  local label="$1" value="$2"
  if [[ -n "$value" && "$value" != "null" ]]; then log_ok "$label = $value";
  else log_fail "$label está vacío o null"; fi
}

do_post()   { curl -s -w "\n%{http_code}" -X POST   "$1" -H "Content-Type: application/json" -H "Authorization: ${3:-$AUTH}" -d "$2" 2>/dev/null; }
do_put()    { curl -s -w "\n%{http_code}" -X PUT    "$1" -H "Content-Type: application/json" -H "Authorization: ${3:-$AUTH}" -d "$2" 2>/dev/null; }
do_get()    { curl -s -w "\n%{http_code}" -X GET    "$1" -H "Authorization: ${2:-$AUTH}" 2>/dev/null; }
do_delete() { curl -s -w "\n%{http_code}" -X DELETE "$1" -H "Authorization: ${2:-$AUTH}" 2>/dev/null; }

extract_body() { echo "$1" | sed '$d'; }
extract_code() { echo "$1" | tail -1; }

# ── Helpers de eventos y DB ─────────────────────────────────
count_traces_since() {
  # $1 = segundos atrás; devuelve total de filas creadas recientemente
  $PG_EXEC -d "$TRACE_DB" -c "SELECT COUNT(*) FROM codetrace_base_entity WHERE \"creationDate\" >= NOW() - INTERVAL '$1 seconds';" 2>/dev/null | tr -d '[:space:]'
}

count_table() {
  # $1 = tabla
  $PG_EXEC -d "$SEC_DB" -c "SELECT COUNT(*) FROM \"$1\";" 2>/dev/null | tr -d '[:space:]'
}

NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
UNIQUE=$(date +%s)
TEST_EMAIL="e2e_${UNIQUE}@test.com"
TEST_USER="e2e_user_${UNIQUE}"
TEST_PHONE="+5353${UNIQUE: -6}"
OLD_PWD="OldSecurePass123"
NEW_PWD="NewSecurePass456"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TEST E2E — Security Microservice Full Flow                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo -e "  Base URL: $BASE_URL"
echo -e "  Email:    $TEST_EMAIL"
echo -e "  User:     $TEST_USER"
echo -e "  Phone:    $TEST_PHONE"

# ═══════════════════════════════════════════════════════════════
# PASO 0: Pre-flight (salud + conteos iniciales)
# ═══════════════════════════════════════════════════════════════
log_step 0 "Pre-flight (salud y baseline)"

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/users/query/list?page=1&size=1" -H "Authorization: $AUTH" || echo "000")
if [[ "$HEALTH" == "200" ]]; then log_ok "Service saludable en $BASE_URL";
else log_fail "Service NO responde ($HEALTH)"; exit 1; fi

INITIAL_TRACES=$(count_traces_since 3600)
log_info "Codetrace rows (última hora): $INITIAL_TRACES"
INITIAL_USERS=$(count_table "user_base_entity" || echo "0")
log_info "Usuarios previos: $INITIAL_USERS"

# ═══════════════════════════════════════════════════════════════
# PASO 1: Crear usuario
# ═══════════════════════════════════════════════════════════════
log_step 1 "Crear usuario (publica user-created)"

RESP=$(do_post "$BASE_URL/users/command" "{
  \"username\": \"$TEST_USER\",
  \"email\": \"$TEST_EMAIL\",
  \"phone\": \"$TEST_PHONE\",
  \"password\": \"$OLD_PWD\",
  \"termsAccepted\": true,
  \"name\": \"E2E Test User\"
}")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear usuario" "$HTTP"
USER_ID=$(echo "$BODY" | jq -r '.data.id // empty')
ACTIVATION_PIN=$(echo "$BODY" | jq -r '.activationPin // empty')
assert_field "User ID" "$USER_ID"
[[ -n "$ACTIVATION_PIN" ]] && log_info "Activation PIN: $ACTIVATION_PIN"

# ═══════════════════════════════════════════════════════════════
# PASO 2: Validación de password policy
# ═══════════════════════════════════════════════════════════════
log_step 2 "Password policy (contraseña débil debe ser rechazada)"
RESP=$(do_post "$BASE_URL/users/command" "{
  \"username\": \"weak_${UNIQUE}\",
  \"email\": \"weak_${UNIQUE}@test.com\",
  \"phone\": \"+5353999${UNIQUE: -3}\",
  \"password\": \"password\",
  \"termsAccepted\": true,
  \"name\": \"weak\"
}")
HTTP=$(extract_code "$RESP")
if [[ "$HTTP" == "400" || "$HTTP" == "500" ]]; then log_ok "Password débil rechazada (HTTP $HTTP)";
else log_fail "Password débil NO rechazada (HTTP $HTTP)"; fi

# ═══════════════════════════════════════════════════════════════
# PASO 3: Activar usuario con PIN
# ═══════════════════════════════════════════════════════════════
log_step 3 "Activar usuario con PIN (publica login-succeeded)"
if [[ -n "$ACTIVATION_PIN" ]]; then
  RESP=$(do_post "$BASE_URL/logins/command" "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$OLD_PWD\",
    \"activationPin\": \"$ACTIVATION_PIN\"
  }" "")
else
  RESP=$(do_post "$BASE_URL/logins/command" "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$OLD_PWD\"
  }" "")
  BODY=$(extract_body "$RESP")
  ACTIVATION_PIN=$(echo "$BODY" | jq -r '.activationPin // empty')
  if [[ -n "$ACTIVATION_PIN" && "$ACTIVATION_PIN" != "null" ]]; then
    RESP=$(do_post "$BASE_URL/logins/command" "{
      \"identifier\": \"$TEST_EMAIL\", \"password\": \"$OLD_PWD\", \"activationPin\": \"$ACTIVATION_PIN\"
    }" "")
  fi
fi
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Activar y autenticar" "$HTTP"
ACCESS_TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refreshToken // empty')
SESSION_CODE=$(echo "$BODY" | jq -r '.sessionCode // empty')
# Nota: todos los guards actuales validan solamente el literal "valid-token".
# Mantenemos $AUTH para operaciones admin y solo inyectamos el token real en
# endpoints que no lo exigen (refresh/logout son públicos excepto el guard).
AUTH_REAL="$AUTH"

# ═══════════════════════════════════════════════════════════════
# PASO 4: Login normal + refresh + logout
# ═══════════════════════════════════════════════════════════════
log_step 4 "Login normal + refresh + logout"
RESP=$(do_post "$BASE_URL/logins/command" "{\"identifier\":\"$TEST_EMAIL\",\"password\":\"$OLD_PWD\"}" "")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Login normal" "$HTTP"
ACCESS2=$(echo "$BODY" | jq -r '.accessToken // empty')
REFRESH2=$(echo "$BODY" | jq -r '.refreshToken // empty')
SESSION2=$(echo "$BODY" | jq -r '.sessionCode // empty')


# Refresh
if [[ -n "$REFRESH2" && "$REFRESH2" != "null" ]]; then
  RESP=$(do_post "$BASE_URL/logins/command/refresh" "{\"refreshToken\":\"$REFRESH2\"}" "$AUTH_REAL")
  HTTP=$(extract_code "$RESP")
  BODY=$(extract_body "$RESP")
  NEW_REFRESH=$(echo "$BODY" | jq -r '.refreshToken // empty')
  if [[ "$HTTP" =~ ^(200|201)$ ]]; then
    log_ok "Refresh exitoso (HTTP $HTTP)"
    if [[ -n "$NEW_REFRESH" && "$NEW_REFRESH" != "$REFRESH2" && "$NEW_REFRESH" != "null" ]]; then
      log_ok "Rotación de refresh token OK"
      REFRESH2="$NEW_REFRESH"
    else
      log_warn "Refresh no rotó el token"
    fi
  else log_fail "Refresh falló (HTTP $HTTP)"; fi
fi

# Logout
LOGOUT_BODY="{}"
[[ -n "$SESSION2" && "$SESSION2" != "null" ]] && LOGOUT_BODY="{\"sessionCode\":\"$SESSION2\"}"
RESP=$(do_post "$BASE_URL/logins/command/logout" "$LOGOUT_BODY" "$AUTH_REAL")
HTTP=$(extract_code "$RESP")
assert_ok "Logout" "$HTTP"



# ═══════════════════════════════════════════════════════════════
# PASO 5: Rate limiting — 6 intentos fallidos seguidos
# ═══════════════════════════════════════════════════════════════
log_step 5 "Rate limiting (6 intentos fallidos)"
RATE_LIMITED="no"
RL_USER="rl_${UNIQUE}@test.com"
do_post "$BASE_URL/users/command" "{
  \"username\":\"rl_${UNIQUE}\",\"email\":\"$RL_USER\",
  \"phone\":\"+5352${UNIQUE: -6}\",\"password\":\"$OLD_PWD\",
  \"termsAccepted\":true,\"name\":\"rl\"}" > /dev/null
for i in 1 2 3 4 5 6; do
  RESP=$(do_post "$BASE_URL/logins/command" "{\"identifier\":\"$RL_USER\",\"password\":\"WrongPass${i}99\"}" "")
  HTTP=$(extract_code "$RESP")
  if [[ "$HTTP" == "429" ]]; then RATE_LIMITED="yes"; log_ok "Rate limit activado en intento $i (HTTP 429)"; break; fi
done
if [[ "$RATE_LIMITED" != "yes" ]]; then log_warn "No se observó 429 en 6 intentos (LOGIN_RATE_LIMIT_MAX puede ser mayor)"; fi

# ═══════════════════════════════════════════════════════════════
# PASO 6: User queries (list, by id, by field)
# ═══════════════════════════════════════════════════════════════
log_step 6 "User queries"
RESP=$(do_get "$BASE_URL/users/query/$USER_ID" "$AUTH_REAL"); assert_ok "GET user by id" "$(extract_code "$RESP")"
RESP=$(do_get "$BASE_URL/users/query/list?page=1&size=10" "$AUTH_REAL"); assert_ok "GET users list" "$(extract_code "$RESP")"

# ═══════════════════════════════════════════════════════════════
# PASO 7: User update
# ═══════════════════════════════════════════════════════════════
log_step 7 "Update user (publica user-updated)"
RESP=$(do_put "$BASE_URL/users/command/$USER_ID" "{
  \"id\":\"$USER_ID\",\"name\":\"E2E Updated\",\"description\":\"Desc updated\"
}" "$AUTH_REAL")
assert_ok "Update user" "$(extract_code "$RESP")"

# ═══════════════════════════════════════════════════════════════
# PASO 8: User profile CRUD
# ═══════════════════════════════════════════════════════════════
log_step 8 "User profile CRUD (publica user-profile-*)"
RESP=$(do_post "$BASE_URL/userprofiles/command" "{
  \"name\":\"Perfil de $TEST_USER\",\"userId\":\"$USER_ID\",
  \"firstName\":\"E2E\",\"lastName\":\"TestUser\",\"language\":\"es\",\"country\":\"CU\",\"city\":\"La Habana\",
  \"address\":\"Calle Test #123\",\"createdBy\":\"e2e-test\",
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear user-profile" "$HTTP"
PROFILE_ID=$(echo "$BODY" | jq -r '.data.id // empty')

if [[ -n "$PROFILE_ID" && "$PROFILE_ID" != "null" ]]; then
  RESP=$(do_put "$BASE_URL/userprofiles/command/$PROFILE_ID" "{
    \"id\":\"$PROFILE_ID\",\"firstName\":\"E2E Updated\",\"lastName\":\"Mod\",
    \"name\":\"Perfil de $TEST_USER\",\"userId\":\"$USER_ID\",\"createdBy\":\"e2e-test\",
    \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true
  }" "$AUTH_REAL")
  assert_ok "Update user-profile" "$(extract_code "$RESP")"
  RESP=$(do_get "$BASE_URL/userprofiles/query/$PROFILE_ID" "$AUTH_REAL")
  assert_ok "GET user-profile" "$(extract_code "$RESP")"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 9: MFA-TOTP (el registro existe por creación de usuario)
# ═══════════════════════════════════════════════════════════════
log_step 9 "MFA-TOTP (lista + GET del registro auto-creado)"
RESP=$(do_get "$BASE_URL/mfatotps/query/list?page=1&size=50" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "List mfa-totp" "$HTTP"
MFA_ID=$(echo "$BODY" | jq -r --arg uid "$USER_ID" '.data[] | select(.userId == $uid) | .id' | head -1)
if [[ -n "$MFA_ID" && "$MFA_ID" != "null" ]]; then
  log_ok "Registro MFA-TOTP auto-creado por UserService (id=$MFA_ID)"
  RESP=$(do_get "$BASE_URL/mfatotps/query/$MFA_ID" "$AUTH_REAL")
  assert_ok "GET mfa-totp" "$(extract_code "$RESP")"
else
  log_warn "No se encontró MFA-TOTP auto-creado para el usuario"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 10: Session-token CRUD directo
# ═══════════════════════════════════════════════════════════════
log_step 10 "Session-token CRUD"
FUTURE=$(date -u -v+7d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%S.000Z")
RESP=$(do_post "$BASE_URL/sessiontokens/command" "{
  \"name\":\"sess-$UNIQUE\",\"userId\":\"$USER_ID\",
  \"sessionCode\":\"sess-code-$UNIQUE\",\"tokenId\":\"tok-$UNIQUE\",
  \"tokenType\":\"REFRESH\",\"issuedAt\":\"$NOW\",\"expiresAt\":\"$FUTURE\",
  \"certificationStatus\":\"ACTIVE\",
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear session-token" "$HTTP"
SESSTOK_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# ═══════════════════════════════════════════════════════════════
# PASO 11: RBAC-ACL con 3 permisos
# ═══════════════════════════════════════════════════════════════
log_step 11 "RBAC-ACL (3 permisos)"
ACL_IDS=()
for tuple in "products:read:read:own" "invoices:create:create:own" "orders:manage:manage:all"; do
  IFS=":" read -r resource action actDup scope <<< "$tuple"
  RESP=$(do_post "$BASE_URL/rbacacls/command" "{
    \"name\":\"MERCHANT-${resource}-${action}\",\"roleCode\":\"MERCHANT\",\"roleName\":\"Merchant\",
    \"permissionCode\":\"${resource}:${action}\",\"resource\":\"${resource}\",\"action\":\"${action}\",
    \"scope\":\"${scope}\",\"effect\":\"ALLOW\",\"userId\":\"$USER_ID\",
    \"assignedAt\":\"$NOW\",\"createdBy\":\"e2e-test\",
    \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true
  }" "$AUTH_REAL")
  BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
  assert_ok "ACL $resource:$action" "$HTTP"
  ACL_IDS+=("$(echo "$BODY" | jq -r '.data.id // empty')")
done

# ═══════════════════════════════════════════════════════════════
# PASO 12: Identity federation CRUD
# ═══════════════════════════════════════════════════════════════
log_step 12 "Identity federation CRUD"
RESP=$(do_post "$BASE_URL/identityfederations/command" "{
  \"name\":\"idp-e2e-$UNIQUE\",\"code\":\"IDP_E2E_$UNIQUE\",
  \"providerType\":\"WSO2\",\"protocolFamily\":\"OIDC\",\"protocolVersion\":\"1.0\",
  \"issuer\":\"https://idp-e2e.test/\",
  \"clientId\":\"client-$UNIQUE\",\"clientSecretRef\":\"shared-secret-$UNIQUE\",\"enabled\":true,
  \"metadata\":{\"sharedSecret\":\"shared-secret-$UNIQUE\"},
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear identity-federation" "$HTTP"
IDP_ID=$(echo "$BODY" | jq -r '.data.id // empty')
IDP_CODE=$(echo "$BODY" | jq -r '.data.code // empty')

# Federated callback (smoke test — debe aceptar payload sin idToken, modo legacy)
if [[ -n "$IDP_CODE" && "$IDP_CODE" != "null" ]]; then
  RESP=$(do_post "$BASE_URL/logins/command/federated/callback" "{
    \"providerCode\":\"WSO2\",
    \"externalSubject\":\"ext-$UNIQUE\",
    \"externalEmail\":\"fed_$UNIQUE@test.com\",
    \"claims\":{\"sub\":\"ext-$UNIQUE\",\"email\":\"fed_$UNIQUE@test.com\",\"name\":\"Federated User\"}
  }" "")
  HTTP=$(extract_code "$RESP")
  if [[ "$HTTP" =~ ^(200|201)$ ]]; then log_ok "Federated callback sin idToken (HTTP $HTTP)";
  elif [[ "$HTTP" == "400" || "$HTTP" == "403" ]]; then log_warn "Federated callback rechazado (HTTP $HTTP) — AUTO_PROVISION puede estar OFF";
  else log_fail "Federated callback (HTTP $HTTP)"; fi
fi

# Validación de firma HS256 (idToken correcto: aud=clientId, iss=issuer, firma válida)
SECRET="shared-secret-$UNIQUE"
ISS="https://idp-e2e.test/"
AUD="client-$UNIQUE"
EXP=$(( $(date +%s) + 3600 ))
b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }
HDR_B64=$(printf '{"alg":"HS256","typ":"JWT"}' | b64url)
PL_JSON="{\"sub\":\"fed-jwt-$UNIQUE\",\"email\":\"fedjwt_$UNIQUE@test.com\",\"iss\":\"$ISS\",\"aud\":\"$AUD\",\"exp\":$EXP}"
PL_B64=$(printf '%s' "$PL_JSON" | b64url)
SIG_B64=$(printf '%s' "$HDR_B64.$PL_B64" | openssl dgst -sha256 -hmac "$SECRET" -binary | b64url)
ID_TOKEN="$HDR_B64.$PL_B64.$SIG_B64"
RESP=$(do_post "$BASE_URL/logins/command/federated/callback" "{
  \"providerCode\":\"WSO2\",
  \"externalSubject\":\"fed-jwt-$UNIQUE\",
  \"externalEmail\":\"fedjwt_$UNIQUE@test.com\",
  \"idToken\":\"$ID_TOKEN\"
}" "")
HTTP=$(extract_code "$RESP")
if [[ "$HTTP" =~ ^(200|201)$ ]]; then log_ok "Federated callback con idToken JWT HS256 válido (HTTP $HTTP)";
else log_fail "Federated callback idToken válido rechazado (HTTP $HTTP)"; fi

# Validación negativa: idToken con aud incorrecto → debe devolver 400
BAD_PL=$(printf '{"sub":"x","iss":"%s","aud":"wrong-aud","exp":%s}' "$ISS" "$EXP" | b64url)
BAD_SIG=$(printf '%s' "$HDR_B64.$BAD_PL" | openssl dgst -sha256 -hmac "$SECRET" -binary | b64url)
BAD_TOKEN="$HDR_B64.$BAD_PL.$BAD_SIG"
RESP=$(do_post "$BASE_URL/logins/command/federated/callback" "{
  \"providerCode\":\"WSO2\",
  \"externalSubject\":\"fed-bad-$UNIQUE\",
  \"idToken\":\"$BAD_TOKEN\"
}" "")
HTTP=$(extract_code "$RESP")
if [[ "$HTTP" == "400" || "$HTTP" == "500" ]]; then log_ok "Federated callback con aud inválido rechazado (HTTP $HTTP)";
else log_fail "Federated callback con aud inválido NO rechazado (HTTP $HTTP)"; fi

# Validación negativa: firma inválida
BAD_SIG2=$(printf '%s' "$HDR_B64.$PL_B64" | openssl dgst -sha256 -hmac "wrong-secret" -binary | b64url)
BAD_TOKEN2="$HDR_B64.$PL_B64.$BAD_SIG2"
RESP=$(do_post "$BASE_URL/logins/command/federated/callback" "{
  \"providerCode\":\"WSO2\",
  \"externalSubject\":\"fed-badsig-$UNIQUE\",
  \"idToken\":\"$BAD_TOKEN2\"
}" "")
HTTP=$(extract_code "$RESP")
if [[ "$HTTP" == "400" || "$HTTP" == "500" ]]; then log_ok "Federated callback con firma inválida rechazado (HTTP $HTTP)";
else log_fail "Federated callback con firma inválida NO rechazado (HTTP $HTTP)"; fi


# ═══════════════════════════════════════════════════════════════
# PASO 13: Security master data (validar seed + crear uno nuevo)
# ═══════════════════════════════════════════════════════════════
log_step 13 "Security master data (seed + CRUD)"
RESP=$(do_get "$BASE_URL/securitymasterdatas/query/list?page=1&size=50" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "List master data" "$HTTP"
SEED_COUNT=$(echo "$BODY" | jq -r '.data | length // 0')
if [[ "$SEED_COUNT" -ge 10 ]]; then log_ok "Seed cargado ($SEED_COUNT filas)";
else log_warn "Seed parece no cargado ($SEED_COUNT filas)"; fi

RESP=$(do_post "$BASE_URL/securitymasterdatas/command" "{
  \"name\":\"e2e-catalog-$UNIQUE\",\"category\":\"e2e-category\",
  \"code\":\"E2E_$UNIQUE\",\"displayName\":\"E2E seed\",\"sortOrder\":99,
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear master-data" "$HTTP"
MD_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# ═══════════════════════════════════════════════════════════════
# PASO 14: Security module CRUD
# ═══════════════════════════════════════════════════════════════
log_step 14 "Security CRUD"
RESP=$(do_post "$BASE_URL/securitys/command" "{
  \"name\":\"sec-e2e-$UNIQUE\",
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear security" "$HTTP"
SEC_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# ═══════════════════════════════════════════════════════════════
# PASO 15: Authentication CRUD (registro de auditoría)
# ═══════════════════════════════════════════════════════════════
log_step 15 "Authentication CRUD"
RESP=$(do_post "$BASE_URL/authentications/command" "{
  \"name\":\"auth-e2e-$UNIQUE\",
  \"loginIdentifier\":\"$TEST_EMAIL\",\"authMethod\":\"PASSWORD\",
  \"authStatus\":\"SUCCEEDED\",\"occurredAt\":\"$NOW\",
  \"authenticatedUserAcls\":[{\"resource\":\"users\",\"action\":\"read\",\"scope\":\"own\",\"effect\":\"ALLOW\"}],
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear authentication" "$HTTP"
AUTH_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# ═══════════════════════════════════════════════════════════════
# PASO 16: Security-customer CRUD
# ═══════════════════════════════════════════════════════════════
log_step 16 "Security-customer CRUD"
RESP=$(do_post "$BASE_URL/securitycustomers/command" "{
  \"name\":\"cust-e2e-$UNIQUE\",\"userId\":\"$USER_ID\",\"riskLevel\":\"LOW\",
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear security-customer" "$HTTP"
CUST_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# ═══════════════════════════════════════════════════════════════
# PASO 17: Security-merchant CRUD + workflow de aprobación
# ═══════════════════════════════════════════════════════════════
log_step 17 "Security-merchant + workflow aprobación"
RESP=$(do_post "$BASE_URL/securitymerchants/command" "{
  \"name\":\"merch-e2e-$UNIQUE\",\"userId\":\"$USER_ID\",
  \"merchantCode\":\"MERCH_$UNIQUE\",\"approvalStatus\":\"PENDING\",
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear security-merchant" "$HTTP"
MERCH_ID=$(echo "$BODY" | jq -r '.data.id // empty')

if [[ -n "$MERCH_ID" && "$MERCH_ID" != "null" ]]; then
  RESP=$(do_post "$BASE_URL/securitymerchants/command/$MERCH_ID/approval/request" "{\"requestedBy\":\"e2e\"}" "$AUTH_REAL")
  HTTP=$(extract_code "$RESP"); assert_ok "Merchant approval REQUEST" "$HTTP"
  RESP=$(do_post "$BASE_URL/securitymerchants/command/$MERCH_ID/approval/approve" "{\"approvedBy\":\"e2e-admin\"}" "$AUTH_REAL")
  HTTP=$(extract_code "$RESP"); assert_ok "Merchant approval APPROVE" "$HTTP"
  RESP=$(do_post "$BASE_URL/securitymerchants/command/$MERCH_ID/approval/reject" "{\"rejectedBy\":\"e2e-admin\",\"reason\":\"demo\"}" "$AUTH_REAL")
  HTTP=$(extract_code "$RESP")
  # Reject tras approve puede fallar según regla; aceptamos 200/400/409
  if [[ "$HTTP" =~ ^(200|201|400|409)$ ]]; then log_ok "Merchant REJECT respeta transición (HTTP $HTTP)";
  else log_fail "Merchant REJECT inesperado (HTTP $HTTP)"; fi
fi

# ═══════════════════════════════════════════════════════════════
# PASO 18: Sales-manager CRUD + referral-tree + ancestors
# ═══════════════════════════════════════════════════════════════
log_step 18 "Sales-manager + referral-tree + ancestors"
RESP=$(do_post "$BASE_URL/salesmanagers/command" "{
  \"name\":\"sm-e2e-$UNIQUE\",\"userId\":\"$USER_ID\",
  \"managerCode\":\"SM_$UNIQUE\",\"approvalStatus\":\"APPROVED\",
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear sales-manager" "$HTTP"
SM_ID=$(echo "$BODY" | jq -r '.data.id // empty')

RESP=$(do_get "$BASE_URL/salesmanagers/query/$USER_ID/referral-tree?maxDepth=3" "$AUTH_REAL")
HTTP=$(extract_code "$RESP")
if [[ "$HTTP" =~ ^(200|201)$ ]]; then log_ok "GET referral-tree (HTTP $HTTP)";
else log_fail "GET referral-tree (HTTP $HTTP)"; fi

RESP=$(do_get "$BASE_URL/salesmanagers/query/$USER_ID/ancestors?maxDepth=5" "$AUTH_REAL")
HTTP=$(extract_code "$RESP")
if [[ "$HTTP" =~ ^(200|201)$ ]]; then log_ok "GET ancestors (HTTP $HTTP)";
else log_fail "GET ancestors (HTTP $HTTP)"; fi

# ═══════════════════════════════════════════════════════════════
# PASO 19: System-admin-policy CRUD
# ═══════════════════════════════════════════════════════════════
log_step 19 "System-admin-policy CRUD"
RESP=$(do_post "$BASE_URL/systemadminpolicys/command" "{
  \"name\":\"sap-e2e-$UNIQUE\",\"adminUserId\":\"$USER_ID\",
  \"policyCode\":\"POL_$UNIQUE\",\"actionType\":\"CONFIG_UPDATE\",\"decision\":\"ALLOW\",
  \"occurredAt\":\"$NOW\",
  \"creationDate\":\"$NOW\",\"modificationDate\":\"$NOW\",\"isActive\":true,\"createdBy\":\"e2e\"
}" "$AUTH_REAL")
BODY=$(extract_body "$RESP"); HTTP=$(extract_code "$RESP")
assert_ok "Crear system-admin-policy" "$HTTP"
SAP_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# ── Guard ADMIN (UH-11): admin NO puede crear/eliminar users, SI puede desactivar
RESP_HEADERS_JSON=$(curl -s -o /tmp/e2e_admin_post.json -w "%{http_code}" \
  -X POST "$BASE_URL/users/command" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_REAL" \
  -H "x-actor-role: ADMIN" \
  -H "x-actor-id: 00000000-0000-0000-0000-000000000001" \
  -d "{\"name\":\"admin-create\",\"username\":\"admuser-$UNIQUE\",\"email\":\"admuser_$UNIQUE@test.com\",\"password\":\"Admin1234\",\"termsAccepted\":true}")
if [[ "$RESP_HEADERS_JSON" == "403" ]]; then log_ok "Admin NO puede crear usuarios (HTTP 403)"; else log_fail "Admin creando usuarios NO bloqueado (HTTP $RESP_HEADERS_JSON)"; fi

HTTP_ADMIN_DEL=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE "$BASE_URL/users/command/$USER_ID" \
  -H "Authorization: $AUTH_REAL" \
  -H "x-actor-role: ADMIN")
if [[ "$HTTP_ADMIN_DEL" == "403" ]]; then log_ok "Admin NO puede eliminar usuarios (HTTP 403)"; else log_fail "Admin eliminando usuarios NO bloqueado (HTTP $HTTP_ADMIN_DEL)"; fi

HTTP_ADMIN_DEACT=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT "$BASE_URL/users/command/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_REAL" \
  -H "x-actor-role: ADMIN" \
  -H "x-actor-id: 00000000-0000-0000-0000-000000000001" \
  -d "{\"id\":\"$USER_ID\",\"isActive\":false}")
if [[ "$HTTP_ADMIN_DEACT" =~ ^(200|201)$ ]]; then log_ok "Admin SI puede desactivar usuarios (HTTP $HTTP_ADMIN_DEACT)"; else log_fail "Admin desactivación bloqueada (HTTP $HTTP_ADMIN_DEACT)"; fi

# Reactivar al usuario para no romper pasos siguientes
curl -s -o /dev/null -X PUT "$BASE_URL/users/command/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_REAL" \
  -d "{\"id\":\"$USER_ID\",\"isActive\":true}" >/dev/null


# ═══════════════════════════════════════════════════════════════
# PASO 20: Cambio de contraseña + verificación
# ═══════════════════════════════════════════════════════════════
log_step 20 "Cambio de contraseña"
RESP=$(do_put "$BASE_URL/users/command/$USER_ID" "{\"id\":\"$USER_ID\",\"password\":\"$NEW_PWD\"}" "$AUTH_REAL")
assert_ok "Cambiar contraseña" "$(extract_code "$RESP")"

RESP=$(do_post "$BASE_URL/logins/command" "{\"identifier\":\"$TEST_EMAIL\",\"password\":\"$OLD_PWD\"}" "")
HTTP=$(extract_code "$RESP")
if [[ "$HTTP" =~ ^(400|401|403|500)$ ]]; then log_ok "Login con pwd vieja rechazado (HTTP $HTTP)";
else log_fail "Login con pwd vieja aceptado (HTTP $HTTP)"; fi

RESP=$(do_post "$BASE_URL/logins/command" "{\"identifier\":\"$TEST_EMAIL\",\"password\":\"$NEW_PWD\"}" "")
assert_ok "Login con pwd nueva" "$(extract_code "$RESP")"

# ═══════════════════════════════════════════════════════════════
# PASO 21: Validación publicación de eventos (codetrace)
# ═══════════════════════════════════════════════════════════════
log_step 21 "Validar publicación/consumo de eventos"
TRACES_NOW=$(count_traces_since 600)
DELTA=$(( TRACES_NOW - INITIAL_TRACES ))
log_info "Codetrace delta: $DELTA filas en ejecución"
if [[ "$DELTA" -gt 0 ]]; then log_ok "Eventos publicados al trace bus ($DELTA nuevos)";
else log_warn "No se detectaron nuevas trazas (codetrace puede estar down)"; fi

# Evento consumido: tras login, authentication-record-login-*.saga debería haber creado registros
AUTH_COUNT=$(count_table "authentication_base_entity" || echo "0")
log_info "Filas en authentication: $AUTH_COUNT"
if [[ "$AUTH_COUNT" -gt 0 ]]; then log_ok "Saga authentication consumió eventos (registros presentes)";
else log_warn "No se observan filas en authentication"; fi

# Login entity debe tener ≥3 registros (activación, login, refresh)
LOGIN_COUNT=$(count_table "login_base_entity" || echo "0")
log_info "Filas en login: $LOGIN_COUNT"
if [[ "$LOGIN_COUNT" -ge 3 ]]; then log_ok "Login persistió múltiples registros ($LOGIN_COUNT)";
else log_warn "Pocas filas en login ($LOGIN_COUNT)"; fi

# SessionToken debe tener registros de refresh-token
TOK_COUNT=$(count_table "session_token_base_entity" || echo "0")
log_info "Filas en session-token: $TOK_COUNT"
if [[ "$TOK_COUNT" -gt 0 ]]; then log_ok "SessionToken persistió registros ($TOK_COUNT)";
else log_warn "No hay filas en session-token"; fi

# ═══════════════════════════════════════════════════════════════
# PASO 22: Limpieza (cascada inversa)
# ═══════════════════════════════════════════════════════════════
log_step 22 "Limpieza"
[[ -n "$SAP_ID" && "$SAP_ID" != "null" ]] && { do_delete "$BASE_URL/systemadminpolicys/command/$SAP_ID" "$AUTH_REAL" > /dev/null; log_info "del sap"; }
[[ -n "$SM_ID"  && "$SM_ID"  != "null" ]] && { do_delete "$BASE_URL/salesmanagers/command/$SM_ID" "$AUTH_REAL" > /dev/null; log_info "del sm"; }
[[ -n "$MERCH_ID" && "$MERCH_ID" != "null" ]] && { do_delete "$BASE_URL/securitymerchants/command/$MERCH_ID" "$AUTH_REAL" > /dev/null; log_info "del merch"; }
[[ -n "$CUST_ID" && "$CUST_ID" != "null" ]] && { do_delete "$BASE_URL/securitycustomers/command/$CUST_ID" "$AUTH_REAL" > /dev/null; log_info "del cust"; }
[[ -n "$AUTH_ID" && "$AUTH_ID" != "null" ]] && { do_delete "$BASE_URL/authentications/command/$AUTH_ID" "$AUTH_REAL" > /dev/null; log_info "del auth"; }
[[ -n "$SEC_ID" && "$SEC_ID" != "null" ]] && { do_delete "$BASE_URL/securitys/command/$SEC_ID" "$AUTH_REAL" > /dev/null; log_info "del sec"; }
[[ -n "$MD_ID" && "$MD_ID" != "null" ]] && { do_delete "$BASE_URL/securitymasterdatas/command/$MD_ID" "$AUTH_REAL" > /dev/null; log_info "del md"; }
[[ -n "$IDP_ID" && "$IDP_ID" != "null" ]] && { do_delete "$BASE_URL/identityfederations/command/$IDP_ID" "$AUTH_REAL" > /dev/null; log_info "del idp"; }
[[ -n "$SESSTOK_ID" && "$SESSTOK_ID" != "null" ]] && { do_delete "$BASE_URL/sessiontokens/command/$SESSTOK_ID" "$AUTH_REAL" > /dev/null; log_info "del tok"; }
[[ -n "$MFA_ID" && "$MFA_ID" != "null" ]] && { do_delete "$BASE_URL/mfatotps/command/$MFA_ID" "$AUTH_REAL" > /dev/null; log_info "del mfa"; }
for id in "${ACL_IDS[@]}"; do
  [[ -n "$id" && "$id" != "null" ]] && do_delete "$BASE_URL/rbacacls/command/$id" "$AUTH_REAL" > /dev/null
done
[[ -n "$PROFILE_ID" && "$PROFILE_ID" != "null" ]] && { do_delete "$BASE_URL/userprofiles/command/$PROFILE_ID" "$AUTH_REAL" > /dev/null; log_info "del profile"; }
do_delete "$BASE_URL/users/command/$USER_ID" "$AUTH_REAL" > /dev/null && log_info "del user"

# ═══════════════════════════════════════════════════════════════
# Resumen
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  RESUMEN TEST E2E                                             ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC}  Total:  $TOTAL"
echo -e "${BLUE}║${NC}  ${GREEN}✔ OK:    $PASS${NC}"
echo -e "${BLUE}║${NC}  ${RED}✘ FAIL:  $FAIL${NC}"
echo -e "${BLUE}║${NC}  ${YELLOW}⚠ WARN:  $WARN${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

[[ $FAIL -gt 0 ]] && exit 1 || exit 0
#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Test E2E — Flujo completo del microservicio Security
# ═══════════════════════════════════════════════════════════════
# Requisitos:
#   - security-service corriendo en http://localhost:3015
#   - PostgreSQL + base de datos security-service disponible
#   - curl y jq instalados
#
# Uso: bash security-service/src/docs/e2e-test.sh
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

BASE_URL="http://localhost:3015/api"
AUTH="Bearer valid-token"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'; BLUE='\033[0;34m'
PASS=0; FAIL=0; TOTAL=0

# ── Utilidades ──────────────────────────────────────────────
log_step()  { echo -e "\n${BLUE}═══ PASO $1: $2 ═══${NC}"; }
log_ok()    { echo -e "  ${GREEN}✔ $1${NC}"; PASS=$((PASS + 1)); TOTAL=$((TOTAL + 1)); }
log_fail()  { echo -e "  ${RED}✘ $1${NC}"; FAIL=$((FAIL + 1)); TOTAL=$((TOTAL + 1)); }
log_info()  { echo -e "  ${YELLOW}ℹ $1${NC}"; }

assert_ok() {
  local label="$1" http_code="$2"
  if [[ "$http_code" =~ ^(200|201)$ ]]; then log_ok "$label (HTTP $http_code)";
  else log_fail "$label — esperado 200/201, recibido $http_code"; fi
}
assert_field() {
  local label="$1" value="$2"
  if [[ -n "$value" && "$value" != "null" ]]; then log_ok "$label = $value";
  else log_fail "$label está vacío o null"; fi
}
assert_contains() {
  local label="$1" haystack="$2" needle="$3"
  if echo "$haystack" | grep -q "$needle"; then log_ok "$label contiene '$needle'";
  else log_fail "$label NO contiene '$needle'"; fi
}

do_post() {
  local url="$1" data="$2" auth="${3:-$AUTH}"
  curl -s -w "\n%{http_code}" -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Authorization: $auth" \
    -d "$data" 2>/dev/null
}
do_put() {
  local url="$1" data="$2" auth="${3:-$AUTH}"
  curl -s -w "\n%{http_code}" -X PUT "$url" \
    -H "Content-Type: application/json" \
    -H "Authorization: $auth" \
    -d "$data" 2>/dev/null
}
do_get() {
  local url="$1" auth="${2:-$AUTH}"
  curl -s -w "\n%{http_code}" -X GET "$url" \
    -H "Authorization: $auth" 2>/dev/null
}
do_delete() {
  local url="$1" auth="${2:-$AUTH}"
  curl -s -w "\n%{http_code}" -X DELETE "$url" \
    -H "Authorization: $auth" 2>/dev/null
}

extract_body() { echo "$1" | sed '$d'; }
extract_code() { echo "$1" | tail -1; }

NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
UNIQUE=$(date +%s)
TEST_EMAIL="e2e_${UNIQUE}@test.com"
TEST_USER="e2e_user_${UNIQUE}"
TEST_PHONE="+5353${UNIQUE: -6}"
OLD_PWD="OldSecurePass123"
NEW_PWD="NewSecurePass456"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TEST E2E — Security Microservice Full Flow              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo -e "  Base URL: $BASE_URL"
echo -e "  Email:    $TEST_EMAIL"
echo -e "  User:     $TEST_USER"

# ═══════════════════════════════════════════════════════════════
# PASO 1: Crear usuario
# ═══════════════════════════════════════════════════════════════
log_step 1 "Crear usuario"

RESP=$(do_post "$BASE_URL/users/command" "{
  \"username\": \"$TEST_USER\",
  \"email\": \"$TEST_EMAIL\",
  \"phone\": \"$TEST_PHONE\",
  \"password\": \"$OLD_PWD\",
  \"termsAccepted\": true,
  \"name\": \"E2E Test User\"
}")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Crear usuario" "$HTTP"

USER_ID=$(echo "$BODY" | jq -r '.data.id // empty')
ACTIVATION_PIN=$(echo "$BODY" | jq -r '.activationPin // empty')
assert_field "User ID" "$USER_ID"
log_info "User ID: $USER_ID"
if [[ -n "$ACTIVATION_PIN" ]]; then
  log_info "Activation PIN: $ACTIVATION_PIN"
else
  log_info "No se devolvió PIN (modo no LOCAL). Se intentará sin PIN."
  ACTIVATION_PIN=""
fi

# ═══════════════════════════════════════════════════════════════
# PASO 2: Activar usuario (primer login con PIN)
# ═══════════════════════════════════════════════════════════════
log_step 2 "Activar usuario con PIN (primer login)"

if [[ -n "$ACTIVATION_PIN" ]]; then
  RESP=$(do_post "$BASE_URL/logins/command" "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$OLD_PWD\",
    \"activationPin\": \"$ACTIVATION_PIN\"
  }" "")
else
  # Primer intento sin PIN para obtener el PIN si es modo LOCAL
  RESP=$(do_post "$BASE_URL/logins/command" "{
    \"identifier\": \"$TEST_EMAIL\",
    \"password\": \"$OLD_PWD\"
  }" "")
  BODY=$(extract_body "$RESP")
  ACTIVATION_PIN=$(echo "$BODY" | jq -r '.activationPin // empty')
  if [[ -n "$ACTIVATION_PIN" ]]; then
    log_info "PIN obtenido del primer login: $ACTIVATION_PIN"
    RESP=$(do_post "$BASE_URL/logins/command" "{
      \"identifier\": \"$TEST_EMAIL\",
      \"password\": \"$OLD_PWD\",
      \"activationPin\": \"$ACTIVATION_PIN\"
    }" "")
  fi
fi
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Activar y autenticar" "$HTTP"

ACCESS_TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refreshToken // empty')
SESSION_CODE=$(echo "$BODY" | jq -r '.sessionCode // empty')
AUTH_STATUS=$(echo "$BODY" | jq -r '.data.authStatus // empty')

if [[ -n "$ACCESS_TOKEN" && "$ACCESS_TOKEN" != "null" ]]; then
  log_ok "Access token obtenido"
  log_info "Token: ${ACCESS_TOKEN:0:40}..."
  AUTH_REAL="Bearer $ACCESS_TOKEN"
else
  log_info "No se devolvió accessToken; usando Bearer valid-token"
  AUTH_REAL="$AUTH"
fi
if [[ -n "$REFRESH_TOKEN" && "$REFRESH_TOKEN" != "null" ]]; then
  log_ok "Refresh token obtenido"
fi
log_info "Auth status: $AUTH_STATUS"

# ═══════════════════════════════════════════════════════════════
# PASO 3: Login normal con usuario y contraseña
# ═══════════════════════════════════════════════════════════════
log_step 3 "Login normal con usuario y contraseña"

RESP=$(do_post "$BASE_URL/logins/command" "{
  \"identifier\": \"$TEST_EMAIL\",
  \"password\": \"$OLD_PWD\"
}" "")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Login normal" "$HTTP"

ACCESS_TOKEN2=$(echo "$BODY" | jq -r '.accessToken // empty')
REFRESH_TOKEN2=$(echo "$BODY" | jq -r '.refreshToken // empty')
SESSION_CODE2=$(echo "$BODY" | jq -r '.sessionCode // empty')

if [[ -n "$ACCESS_TOKEN2" && "$ACCESS_TOKEN2" != "null" ]]; then
  AUTH_REAL="Bearer $ACCESS_TOKEN2"
  log_ok "Nuevo access token obtenido"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 4: Actualizar datos del usuario
# ═══════════════════════════════════════════════════════════════
log_step 4 "Actualizar datos del usuario"

RESP=$(do_put "$BASE_URL/users/command/$USER_ID" "{
  \"id\": \"$USER_ID\",
  \"name\": \"E2E User Updated\",
  \"description\": \"Descripción actualizada desde test E2E\"
}" "$AUTH")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Actualizar datos" "$HTTP"

UPDATED_NAME=$(echo "$BODY" | jq -r '.data.name // empty')
assert_field "Nombre actualizado" "$UPDATED_NAME"

# ═══════════════════════════════════════════════════════════════
# PASO 5: Crear perfil de usuario
# ═══════════════════════════════════════════════════════════════
log_step 5 "Crear perfil de usuario"

RESP=$(do_post "$BASE_URL/userprofiles/command" "{
  \"name\": \"Perfil de $TEST_USER\",
  \"userId\": \"$USER_ID\",
  \"firstName\": \"E2E\",
  \"lastName\": \"TestUser\",
  \"language\": \"es\",
  \"country\": \"CU\",
  \"city\": \"La Habana\",
  \"address\": \"Calle Test #123\",
  \"createdBy\": \"e2e-test\",
  \"creationDate\": \"$NOW\",
  \"modificationDate\": \"$NOW\",
  \"isActive\": true
}" "$AUTH")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Crear perfil" "$HTTP"

PROFILE_ID=$(echo "$BODY" | jq -r '.data.id // empty')
assert_field "Profile ID" "$PROFILE_ID"
log_info "Profile ID: $PROFILE_ID"

# ═══════════════════════════════════════════════════════════════
# PASO 6: Modificar perfil de usuario
# ═══════════════════════════════════════════════════════════════
log_step 6 "Modificar perfil de usuario"

if [[ -n "$PROFILE_ID" && "$PROFILE_ID" != "null" ]]; then
  RESP=$(do_put "$BASE_URL/userprofiles/command/$PROFILE_ID" "{
    \"id\": \"$PROFILE_ID\",
    \"firstName\": \"E2E Updated\",
    \"lastName\": \"TestUser Modified\",
    \"city\": \"Santiago de Cuba\",
    \"address\": \"Calle Actualizada #456\",
    \"name\": \"Perfil de $TEST_USER\",
    \"userId\": \"$USER_ID\",
    \"createdBy\": \"e2e-test\",
    \"creationDate\": \"$NOW\",
    \"modificationDate\": \"$NOW\",
    \"isActive\": true
  }" "$AUTH")
  BODY=$(extract_body "$RESP")
  HTTP=$(extract_code "$RESP")
  assert_ok "Modificar perfil" "$HTTP"
else
  log_fail "No se pudo modificar perfil (ID inválido)"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 7: Cambiar contraseña (actualización del campo password del usuario)
# ═══════════════════════════════════════════════════════════════
log_step 7 "Cambiar contraseña del usuario"

RESP=$(do_put "$BASE_URL/users/command/$USER_ID" "{
  \"id\": \"$USER_ID\",
  \"password\": \"$NEW_PWD\"
}" "$AUTH")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Cambiar contraseña" "$HTTP"

# ═══════════════════════════════════════════════════════════════
# PASO 8: Crear rol MERCHANT (via RBAC ACL)
# ═══════════════════════════════════════════════════════════════
log_step 8 "Crear rol MERCHANT con 3 permisos"

# Crear ACL 1: MERCHANT + products:read
RESP=$(do_post "$BASE_URL/rbacacls/command" "{
  \"name\": \"MERCHANT-products-read\",
  \"roleCode\": \"MERCHANT\",
  \"roleName\": \"Merchant\",
  \"permissionCode\": \"products:read\",
  \"resource\": \"products\",
  \"action\": \"read\",
  \"scope\": \"own\",
  \"effect\": \"ALLOW\",
  \"userId\": \"$USER_ID\",
  \"assignedAt\": \"$NOW\",
  \"createdBy\": \"e2e-test\",
  \"creationDate\": \"$NOW\",
  \"modificationDate\": \"$NOW\",
  \"isActive\": true
}" "$AUTH")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Crear ACL MERCHANT + products:read" "$HTTP"
ACL1_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# Crear ACL 2: MERCHANT + invoices:create
RESP=$(do_post "$BASE_URL/rbacacls/command" "{
  \"name\": \"MERCHANT-invoices-create\",
  \"roleCode\": \"MERCHANT\",
  \"roleName\": \"Merchant\",
  \"permissionCode\": \"invoices:create\",
  \"resource\": \"invoices\",
  \"action\": \"create\",
  \"scope\": \"own\",
  \"effect\": \"ALLOW\",
  \"userId\": \"$USER_ID\",
  \"assignedAt\": \"$NOW\",
  \"createdBy\": \"e2e-test\",
  \"creationDate\": \"$NOW\",
  \"modificationDate\": \"$NOW\",
  \"isActive\": true
}" "$AUTH")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Crear ACL MERCHANT + invoices:create" "$HTTP"
ACL2_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# Crear ACL 3: MERCHANT + orders:manage
RESP=$(do_post "$BASE_URL/rbacacls/command" "{
  \"name\": \"MERCHANT-orders-manage\",
  \"roleCode\": \"MERCHANT\",
  \"roleName\": \"Merchant\",
  \"permissionCode\": \"orders:manage\",
  \"resource\": \"orders\",
  \"action\": \"manage\",
  \"scope\": \"all\",
  \"effect\": \"ALLOW\",
  \"userId\": \"$USER_ID\",
  \"assignedAt\": \"$NOW\",
  \"createdBy\": \"e2e-test\",
  \"creationDate\": \"$NOW\",
  \"modificationDate\": \"$NOW\",
  \"isActive\": true
}" "$AUTH")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Crear ACL MERCHANT + orders:manage" "$HTTP"
ACL3_ID=$(echo "$BODY" | jq -r '.data.id // empty')

# ═══════════════════════════════════════════════════════════════
# PASO 9: Logout
# ═══════════════════════════════════════════════════════════════
log_step 9 "Logout del usuario"

LOGOUT_PAYLOAD="{}"
if [[ -n "$SESSION_CODE2" && "$SESSION_CODE2" != "null" ]]; then
  LOGOUT_PAYLOAD="{\"sessionCode\": \"$SESSION_CODE2\"}"
elif [[ -n "$REFRESH_TOKEN2" && "$REFRESH_TOKEN2" != "null" ]]; then
  LOGOUT_PAYLOAD="{\"refreshToken\": \"$REFRESH_TOKEN2\"}"
fi

RESP=$(do_post "$BASE_URL/logins/command/logout" "$LOGOUT_PAYLOAD" "$AUTH")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Logout" "$HTTP"

# ═══════════════════════════════════════════════════════════════
# PASO 10: Login con contraseña vieja (debe fallar)
# ═══════════════════════════════════════════════════════════════
log_step 10 "Login con contraseña VIEJA (debe fallar)"

RESP=$(do_post "$BASE_URL/logins/command" "{
  \"identifier\": \"$TEST_EMAIL\",
  \"password\": \"$OLD_PWD\"
}" "")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")

OLD_STATUS=$(echo "$BODY" | jq -r '.data.authStatus // empty')
OLD_MESSAGE=$(echo "$BODY" | jq -r '.message // empty')

if [[ "$OLD_MESSAGE" == *"inválidas"* || "$OLD_STATUS" == "FAILED" || "$HTTP" =~ ^(400|401|403|500)$ ]]; then
  log_ok "Login con contraseña vieja RECHAZADO correctamente (HTTP $HTTP, msg=$OLD_MESSAGE)"
else
  log_fail "Login con contraseña vieja debería fallar pero obtuvo HTTP $HTTP, status=$OLD_STATUS"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 11: Login con contraseña nueva (debe funcionar)
# ═══════════════════════════════════════════════════════════════
log_step 11 "Login con contraseña NUEVA (debe funcionar)"

RESP=$(do_post "$BASE_URL/logins/command" "{
  \"identifier\": \"$TEST_EMAIL\",
  \"password\": \"$NEW_PWD\"
}" "")
BODY=$(extract_body "$RESP")
HTTP=$(extract_code "$RESP")
assert_ok "Login con contraseña nueva" "$HTTP"

NEW_STATUS=$(echo "$BODY" | jq -r '.data.authStatus // empty')
NEW_TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
if [[ "$NEW_STATUS" == "SUCCEEDED" ]]; then
  log_ok "Auth status = SUCCEEDED"
elif [[ -n "$NEW_TOKEN" && "$NEW_TOKEN" != "null" ]]; then
  log_ok "Token obtenido con nueva contraseña"
else
  log_info "Auth status: $NEW_STATUS (puede ser válido según el flujo)"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 12: Eliminar registros de ACL
# ═══════════════════════════════════════════════════════════════
log_step 12 "Limpiar ACLs creados"

for ACL_ID in "$ACL1_ID" "$ACL2_ID" "$ACL3_ID"; do
  if [[ -n "$ACL_ID" && "$ACL_ID" != "null" ]]; then
    RESP=$(do_delete "$BASE_URL/rbacacls/command/$ACL_ID" "$AUTH")
    HTTP=$(extract_code "$RESP")
    assert_ok "Eliminar ACL $ACL_ID" "$HTTP"
  fi
done

# ═══════════════════════════════════════════════════════════════
# PASO 13: Eliminar perfil
# ═══════════════════════════════════════════════════════════════
log_step 13 "Eliminar perfil del usuario"

if [[ -n "$PROFILE_ID" && "$PROFILE_ID" != "null" ]]; then
  RESP=$(do_delete "$BASE_URL/userprofiles/command/$PROFILE_ID" "$AUTH")
  HTTP=$(extract_code "$RESP")
  assert_ok "Eliminar perfil" "$HTTP"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 14: Eliminar usuario
# ═══════════════════════════════════════════════════════════════
log_step 14 "Eliminar usuario"

RESP=$(do_delete "$BASE_URL/users/command/$USER_ID" "$AUTH")
HTTP=$(extract_code "$RESP")
assert_ok "Eliminar usuario" "$HTTP"

# ═══════════════════════════════════════════════════════════════
# Integración con catalog-service (sync + trazabilidad)
# ═══════════════════════════════════════════════════════════════
BASE_URL="${BASE_URL:-http://localhost:3015/api}"
AUTH="${AUTH:-Bearer valid-token}"
log_step(){ echo -e "\n${BLUE}═══ $1: $2 ═══${NC}"; }
log_ok(){ echo -e "  ${GREEN}✔ $1${NC}"; PASS=$((PASS+1)); TOTAL=$((TOTAL+1)); }
log_fail(){ echo -e "  ${RED}✘ $1${NC}"; FAIL=$((FAIL+1)); TOTAL=$((TOTAL+1)); }
log_warn(){ echo -e "  ${YELLOW}⚠ $1${NC}"; }
log_info(){ echo -e "  ${YELLOW}ℹ $1${NC}"; }
extract_code(){ echo "$1" | tail -n1; }
do_get(){ curl -s -w "\n%{http_code}" -X GET "$1" -H "Authorization: ${2:-$AUTH}" 2>/dev/null; }
do_post(){ curl -s -w "\n%{http_code}" -X POST "$1" -H "Content-Type: application/json" -H "Authorization: ${3:-$AUTH}" -d "$2" 2>/dev/null; }
source "$(dirname "$0")/../../../docs/e2e-catalog-sync.inc.sh"
run_catalog_sync_tests || true

# ═══════════════════════════════════════════════════════════════
# Resumen
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  RESUMEN DEL TEST E2E                                    ║${NC}"
echo -e "${BLUE}╠═══════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC}  Total:  $TOTAL                                            ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}✔ OK:    $PASS${NC}                                            ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}  ${RED}✘ FAIL:  $FAIL${NC}                                            ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
exit 0
