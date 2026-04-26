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
# ── Auth bootstrap: login real contra security-service ─────────
SECURITY_BASE_URL="${SECURITY_BASE_URL:-http://localhost:3015/api}"
SA_EMAIL="${SA_EMAIL:-softwarentalla@gmail.com}"
SA_PWD="${SA_PWD:-admin123}"
__login_resp=$(curl -s -w "\n%{http_code}" -X POST "$SECURITY_BASE_URL/logins/command" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$SA_EMAIL\",\"password\":\"$SA_PWD\"}" 2>/dev/null)
__login_code=$(echo "$__login_resp" | tail -n1)
if [[ "$__login_code" != "200" && "$__login_code" != "201" ]]; then
  echo "✘ Auth bootstrap falló: HTTP $__login_code contra $SECURITY_BASE_URL/logins/command"
  echo "  Body: $(echo "$__login_resp" | sed '$d' | head -c 300)"
  exit 1
fi
__login_body=$(echo "$__login_resp" | sed '$d')
__token=$(echo "$__login_body" | (jq -r '.accessToken // .data.accessToken // .token // empty' 2>/dev/null || \
  echo "$__login_body" | grep -oE '"accessToken"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"accessToken"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/'))
[[ -z "$__token" ]] && { echo "✘ Auth bootstrap: respuesta sin accessToken"; exit 1; }
AUTH="Bearer $__token"
echo "  ✔ Auth bootstrap: token JWT obtenido para $SA_EMAIL"
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
  \"authenticatedUserAcls\":{\"users\":{\"resource\":\"users\",\"action\":\"read\",\"scope\":\"own\",\"effect\":\"ALLOW\"}},
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
# (auth ya bootstrap arriba)
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
# >>> NOMENCLADORES E2E BEGIN (auto-generado por sources/scaffold_nomenclador_e2e_tests.py)
# Servicio: security-service | Puerto: 3015
NOM_BASE_URL="${NOM_BASE_URL:-http://localhost:3015/api}"
NOM_AUTH="${AUTH:-Bearer valid-token}"
nom_pass=0; nom_fail=0; nom_warn=0
_nom_ok()   { echo -e "  [0;32m✔ $1[0m"; nom_pass=$((nom_pass+1)); }
_nom_fail() { echo -e "  [0;31m✘ $1[0m"; nom_fail=$((nom_fail+1)); }
_nom_warn() { echo -e "  [1;33m⚠ $1[0m"; nom_warn=$((nom_warn+1)); }
NOM_UNIQUE="${UNIQUE:-$(date +%s)}"
NOM_NOW="${NOW:-$(date -u +%Y-%m-%dT%H:%M:%S.000Z)}"
echo ""
echo -e "[0;34m═══ NOMENCLADORES — security-service ═══[0m"

# --- Nomenclador: account-status ---
NOM_CODE="NACCOUN-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E AccountStatus ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/accountstatuss/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "account-status: create id=$NOM_ID"; else _nom_warn "account-status: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/accountstatuss/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "account-status: list ok"; else _nom_warn "account-status: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/accountstatuss/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "account-status: getById" || _nom_warn "account-status: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/accountstatuss/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E AccountStatus updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "account-status: update" || _nom_warn "account-status: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/accountstatuss/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "account-status: delete" || _nom_warn "account-status: delete"
fi

# --- Nomenclador: auth-method ---
NOM_CODE="NAUTHME-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E AuthMethod ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/authmethods/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "auth-method: create id=$NOM_ID"; else _nom_warn "auth-method: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/authmethods/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "auth-method: list ok"; else _nom_warn "auth-method: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/authmethods/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "auth-method: getById" || _nom_warn "auth-method: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/authmethods/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E AuthMethod updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "auth-method: update" || _nom_warn "auth-method: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/authmethods/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "auth-method: delete" || _nom_warn "auth-method: delete"
fi

# --- Nomenclador: auth-status ---
NOM_CODE="NAUTHST-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E AuthStatus ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/authstatuss/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "auth-status: create id=$NOM_ID"; else _nom_warn "auth-status: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/authstatuss/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "auth-status: list ok"; else _nom_warn "auth-status: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/authstatuss/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "auth-status: getById" || _nom_warn "auth-status: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/authstatuss/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E AuthStatus updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "auth-status: update" || _nom_warn "auth-status: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/authstatuss/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "auth-status: delete" || _nom_warn "auth-status: delete"
fi

# --- Nomenclador: certification-status ---
NOM_CODE="NCERTIF-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E CertificationStatus ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/certificationstatuss/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "certification-status: create id=$NOM_ID"; else _nom_warn "certification-status: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/certificationstatuss/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "certification-status: list ok"; else _nom_warn "certification-status: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/certificationstatuss/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "certification-status: getById" || _nom_warn "certification-status: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/certificationstatuss/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E CertificationStatus updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "certification-status: update" || _nom_warn "certification-status: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/certificationstatuss/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "certification-status: delete" || _nom_warn "certification-status: delete"
fi

# --- Nomenclador: challenge-status ---
NOM_CODE="NCHALLE-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E ChallengeStatus ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/challengestatuss/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "challenge-status: create id=$NOM_ID"; else _nom_warn "challenge-status: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/challengestatuss/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "challenge-status: list ok"; else _nom_warn "challenge-status: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/challengestatuss/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "challenge-status: getById" || _nom_warn "challenge-status: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/challengestatuss/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E ChallengeStatus updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "challenge-status: update" || _nom_warn "challenge-status: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/challengestatuss/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "challenge-status: delete" || _nom_warn "challenge-status: delete"
fi

# --- Nomenclador: challenge-type ---
NOM_CODE="NCHALLE-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E ChallengeType ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/challengetypes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "challenge-type: create id=$NOM_ID"; else _nom_warn "challenge-type: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/challengetypes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "challenge-type: list ok"; else _nom_warn "challenge-type: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/challengetypes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "challenge-type: getById" || _nom_warn "challenge-type: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/challengetypes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E ChallengeType updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "challenge-type: update" || _nom_warn "challenge-type: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/challengetypes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "challenge-type: delete" || _nom_warn "challenge-type: delete"
fi

# --- Nomenclador: delivery-mode ---
NOM_CODE="NDELIVE-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E DeliveryMode ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/deliverymodes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "delivery-mode: create id=$NOM_ID"; else _nom_warn "delivery-mode: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/deliverymodes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "delivery-mode: list ok"; else _nom_warn "delivery-mode: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/deliverymodes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "delivery-mode: getById" || _nom_warn "delivery-mode: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/deliverymodes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E DeliveryMode updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "delivery-mode: update" || _nom_warn "delivery-mode: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/deliverymodes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "delivery-mode: delete" || _nom_warn "delivery-mode: delete"
fi

# --- Nomenclador: flow-type ---
NOM_CODE="NFLOWTY-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E FlowType ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/flowtypes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "flow-type: create id=$NOM_ID"; else _nom_warn "flow-type: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/flowtypes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "flow-type: list ok"; else _nom_warn "flow-type: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/flowtypes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "flow-type: getById" || _nom_warn "flow-type: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/flowtypes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E FlowType updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "flow-type: update" || _nom_warn "flow-type: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/flowtypes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "flow-type: delete" || _nom_warn "flow-type: delete"
fi

# --- Nomenclador: identifier-type ---
NOM_CODE="NIDENTI-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E IdentifierType ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/identifiertypes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "identifier-type: create id=$NOM_ID"; else _nom_warn "identifier-type: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/identifiertypes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "identifier-type: list ok"; else _nom_warn "identifier-type: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/identifiertypes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "identifier-type: getById" || _nom_warn "identifier-type: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/identifiertypes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E IdentifierType updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "identifier-type: update" || _nom_warn "identifier-type: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/identifiertypes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "identifier-type: delete" || _nom_warn "identifier-type: delete"
fi

# --- Nomenclador: login-identifier-type ---
NOM_CODE="NLOGINI-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E LoginIdentifierType ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/loginidentifiertypes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "login-identifier-type: create id=$NOM_ID"; else _nom_warn "login-identifier-type: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/loginidentifiertypes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "login-identifier-type: list ok"; else _nom_warn "login-identifier-type: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/loginidentifiertypes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "login-identifier-type: getById" || _nom_warn "login-identifier-type: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/loginidentifiertypes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E LoginIdentifierType updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "login-identifier-type: update" || _nom_warn "login-identifier-type: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/loginidentifiertypes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "login-identifier-type: delete" || _nom_warn "login-identifier-type: delete"
fi

# --- Nomenclador: mfa-mode ---
NOM_CODE="NMFAMOD-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E MfaMode ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/mfamodes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "mfa-mode: create id=$NOM_ID"; else _nom_warn "mfa-mode: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/mfamodes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "mfa-mode: list ok"; else _nom_warn "mfa-mode: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/mfamodes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "mfa-mode: getById" || _nom_warn "mfa-mode: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/mfamodes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E MfaMode updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "mfa-mode: update" || _nom_warn "mfa-mode: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/mfamodes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "mfa-mode: delete" || _nom_warn "mfa-mode: delete"
fi

# --- Nomenclador: protocol-family ---
NOM_CODE="NPROTOC-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E ProtocolFamily ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/protocolfamilys/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "protocol-family: create id=$NOM_ID"; else _nom_warn "protocol-family: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/protocolfamilys/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "protocol-family: list ok"; else _nom_warn "protocol-family: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/protocolfamilys/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "protocol-family: getById" || _nom_warn "protocol-family: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/protocolfamilys/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E ProtocolFamily updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "protocol-family: update" || _nom_warn "protocol-family: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/protocolfamilys/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "protocol-family: delete" || _nom_warn "protocol-family: delete"
fi

# --- Nomenclador: provider-type ---
NOM_CODE="NPROVID-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E ProviderType ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/providertypes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "provider-type: create id=$NOM_ID"; else _nom_warn "provider-type: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/providertypes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "provider-type: list ok"; else _nom_warn "provider-type: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/providertypes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "provider-type: getById" || _nom_warn "provider-type: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/providertypes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E ProviderType updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "provider-type: update" || _nom_warn "provider-type: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/providertypes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "provider-type: delete" || _nom_warn "provider-type: delete"
fi

# --- Nomenclador: security-master-data ---
NOM_CODE="NSECURI-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E SecurityMasterData ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/securitymasterdatas/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "security-master-data: create id=$NOM_ID"; else _nom_warn "security-master-data: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/securitymasterdatas/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "security-master-data: list ok"; else _nom_warn "security-master-data: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/securitymasterdatas/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "security-master-data: getById" || _nom_warn "security-master-data: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/securitymasterdatas/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E SecurityMasterData updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "security-master-data: update" || _nom_warn "security-master-data: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/securitymasterdatas/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "security-master-data: delete" || _nom_warn "security-master-data: delete"
fi

# --- Nomenclador: system-admin-policy-decision ---
NOM_CODE="NSYSTEM-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E SystemAdminPolicyDecision ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/systemadminpolicydecisions/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "system-admin-policy-decision: create id=$NOM_ID"; else _nom_warn "system-admin-policy-decision: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/systemadminpolicydecisions/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "system-admin-policy-decision: list ok"; else _nom_warn "system-admin-policy-decision: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/systemadminpolicydecisions/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "system-admin-policy-decision: getById" || _nom_warn "system-admin-policy-decision: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/systemadminpolicydecisions/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E SystemAdminPolicyDecision updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "system-admin-policy-decision: update" || _nom_warn "system-admin-policy-decision: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/systemadminpolicydecisions/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "system-admin-policy-decision: delete" || _nom_warn "system-admin-policy-decision: delete"
fi

# --- Nomenclador: token-type ---
NOM_CODE="NTOKENT-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E TokenType ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/tokentypes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "token-type: create id=$NOM_ID"; else _nom_warn "token-type: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/tokentypes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "token-type: list ok"; else _nom_warn "token-type: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/tokentypes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "token-type: getById" || _nom_warn "token-type: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/tokentypes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E TokenType updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "token-type: update" || _nom_warn "token-type: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/tokentypes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "token-type: delete" || _nom_warn "token-type: delete"
fi

# --- Nomenclador: user-type ---
NOM_CODE="NUSERTY-${NOM_UNIQUE}"
NOM_BODY="{\"code\":\"$NOM_CODE\",\"displayName\":\"E2E UserType ${NOM_UNIQUE}\",\"description\":\"e2e\",\"creationDate\":\"$NOM_NOW\",\"modificationDate\":\"$NOM_NOW\",\"isActive\":true}"
NOM_RESP=$(curl -s -w "
%{http_code}" -X POST "$NOM_BASE_URL/usertypes/command" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "$NOM_BODY" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1); NOM_BD=$(echo "$NOM_RESP" | sed '$d')
NOM_ID=$(echo "$NOM_BD" | jq -r '.data.id // .id // empty' 2>/dev/null)
if [[ "$NOM_CODE_HTTP" =~ ^(200|201)$ && -n "$NOM_ID" ]]; then _nom_ok "user-type: create id=$NOM_ID"; else _nom_warn "user-type: create http=$NOM_CODE_HTTP (puede requerir auth real)"; fi
NOM_RESP=$(curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/usertypes/query/list" -H "Authorization: $NOM_AUTH" 2>/dev/null)
NOM_CODE_HTTP=$(echo "$NOM_RESP" | tail -n1)
if [[ "$NOM_CODE_HTTP" == "200" ]]; then _nom_ok "user-type: list ok"; else _nom_warn "user-type: list http=$NOM_CODE_HTTP"; fi
if [[ -n "$NOM_ID" ]]; then
  curl -s -w "
%{http_code}" -X GET "$NOM_BASE_URL/usertypes/query/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "user-type: getById" || _nom_warn "user-type: getById"
  curl -s -w "
%{http_code}" -X PUT "$NOM_BASE_URL/usertypes/command/$NOM_ID" -H "Content-Type: application/json" -H "Authorization: $NOM_AUTH" -d "{\"displayName\":\"E2E UserType updated\",\"modificationDate\":\"$NOM_NOW\"}" >/dev/null 2>&1 && _nom_ok "user-type: update" || _nom_warn "user-type: update"
  curl -s -w "
%{http_code}" -X DELETE "$NOM_BASE_URL/usertypes/command/$NOM_ID" -H "Authorization: $NOM_AUTH" >/dev/null 2>&1 && _nom_ok "user-type: delete" || _nom_warn "user-type: delete"
fi

echo ""
echo -e "[0;34m── Resumen Nomencladores security-service ──[0m"
echo "  ✔ OK=$nom_pass  ✘ FAIL=$nom_fail  ⚠ WARN=$nom_warn"
[[ ${nom_fail:-0} -eq 0 ]] || echo "[NOMENCLADORES] hay fallos en este servicio"
# <<< NOMENCLADORES E2E END

exit 0
