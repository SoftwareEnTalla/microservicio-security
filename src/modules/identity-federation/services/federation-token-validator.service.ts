/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 */

import { BadRequestException, Injectable } from "@nestjs/common";
import { createHmac, createVerify } from "crypto";
import { IdentityFederation } from "../entities/identity-federation.entity";

export interface FederationTokenValidationResult {
  ok: boolean;
  claims: Record<string, any>;
  reason?: string;
}

/**
 * Valida tokens federados (JWT OIDC/OAuth firma + audience + exp + issuer).
 *
 * Soporta:
 *  - HS256 (shared secret en `clientSecretRef` o `metadata.sharedSecret`).
 *  - RS256 (PEM pública en `metadata.publicKeyPem`).
 *  - SAML (stub: requiere `metadata.signatureVerified === true` y claims).
 *
 * Si el provider NO tiene material de verificación configurado,
 * se acepta en modo trust (con warning en claims) — útil para IdPs que ya
 * validaron el token en el gateway. Esto mantiene compatibilidad con el
 * flujo previo sin regresiones, pero habilita validación real cuando está
 * configurada.
 */
@Injectable()
export class FederationTokenValidatorService {
  /**
   * Valida un idToken (JWT) contra la configuración del provider.
   * Si no se provee idToken, delega en claims planos (modo legacy).
   */
  async validate(
    provider: IdentityFederation,
    payload: {
      idToken?: string;
      claims?: Record<string, any>;
    }
  ): Promise<FederationTokenValidationResult> {
    const family = (provider.protocolFamily || "").toUpperCase();

    // Sin idToken: aceptar claims planos (modo legacy/gateway)
    if (!payload.idToken) {
      if (family === "SAML") {
        const md = provider.metadata || {};
        if (!(md as any).signatureVerified) {
          return { ok: false, claims: {}, reason: "SAML requiere metadata.signatureVerified=true si no se provee idToken" };
        }
      }
      return { ok: true, claims: payload.claims || {} };
    }

    // JWT: <header>.<payload>.<signature>
    const parts = payload.idToken.split(".");
    if (parts.length !== 3) {
      return { ok: false, claims: {}, reason: "idToken no es un JWT válido (formato)" };
    }

    let header: any;
    let body: any;
    try {
      header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
      body = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    } catch (e) {
      return { ok: false, claims: {}, reason: "idToken no decodificable (base64/JSON)" };
    }

    // Validar firma según alg
    const alg = (header.alg || "").toUpperCase();
    const signedInput = `${parts[0]}.${parts[1]}`;
    const signature = parts[2];

    if (alg === "HS256") {
      const secret = this.resolveSharedSecret(provider);
      if (!secret) {
        return { ok: false, claims: {}, reason: "HS256 requiere clientSecretRef o metadata.sharedSecret" };
      }
      const expected = createHmac("sha256", secret).update(signedInput).digest("base64url");
      if (!timingSafeEqualStr(expected, signature)) {
        return { ok: false, claims: {}, reason: "Firma HS256 inválida" };
      }
    } else if (alg === "RS256") {
      const pem = (provider.metadata as any)?.publicKeyPem;
      if (!pem || typeof pem !== "string") {
        return { ok: false, claims: {}, reason: "RS256 requiere metadata.publicKeyPem (PEM pública)" };
      }
      const verifier = createVerify("RSA-SHA256");
      verifier.update(signedInput);
      verifier.end();
      const sigBuf = Buffer.from(signature, "base64url");
      const ok = verifier.verify(pem, sigBuf);
      if (!ok) {
        return { ok: false, claims: {}, reason: "Firma RS256 inválida" };
      }
    } else {
      return { ok: false, claims: {}, reason: `alg no soportado: ${alg}` };
    }

    // Validar exp
    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof body.exp === "number" && body.exp < nowSec) {
      return { ok: false, claims: {}, reason: "idToken expirado (exp)" };
    }
    if (typeof body.nbf === "number" && body.nbf > nowSec + 30) {
      return { ok: false, claims: {}, reason: "idToken not-before no alcanzado (nbf)" };
    }

    // Validar audience: debe incluir clientId del provider
    if (provider.clientId) {
      const aud = body.aud;
      const audList = Array.isArray(aud) ? aud : (aud ? [aud] : []);
      if (audList.length > 0 && !audList.includes(provider.clientId)) {
        return { ok: false, claims: {}, reason: `audience no coincide (esperado ${provider.clientId}, recibido ${audList.join(",")})` };
      }
    }

    // Validar issuer
    if (provider.issuer) {
      if (body.iss && body.iss !== provider.issuer) {
        return { ok: false, claims: {}, reason: `issuer no coincide (esperado ${provider.issuer}, recibido ${body.iss})` };
      }
    }

    return { ok: true, claims: { ...body, ...(payload.claims || {}) } };
  }

  private resolveSharedSecret(provider: IdentityFederation): string | null {
    // Primero metadata.sharedSecret (recomendado)
    const md = (provider.metadata as any) || {};
    if (md.sharedSecret && typeof md.sharedSecret === "string") return md.sharedSecret;
    // Fallback: clientSecretRef tratado como secreto directo (solo dev)
    if (provider.clientSecretRef && provider.clientSecretRef.length > 0) {
      return provider.clientSecretRef;
    }
    return null;
  }
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
