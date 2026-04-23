/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 *
 * TOTP (RFC 6238) implementado con crypto de Node (sin speakeasy).
 * Soporta generación de secret base32, URI otpauth://, verificación con ventana.
 */

import { Injectable } from "@nestjs/common";
import { createHmac, randomBytes } from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

@Injectable()
export class TotpService {
  /**
   * Genera un secreto base32 (por defecto 20 bytes = 160 bits = 32 chars base32).
   */
  generateSecret(byteLength = 20): string {
    const bytes = randomBytes(byteLength);
    return this.toBase32(bytes);
  }

  /**
   * Construye el otpauth URI que las apps autenticadoras escanean.
   */
  buildOtpauthUri(secret: string, accountName: string, issuer?: string): string {
    const params = new URLSearchParams({ secret });
    const issuerName = (issuer || process.env.TOTP_ISSUER || "SoftwarEnTalla").trim();
    params.set("issuer", issuerName);
    params.set("algorithm", "SHA1");
    params.set("digits", "6");
    params.set("period", "30");
    const label = encodeURIComponent(`${issuerName}:${accountName}`);
    return `otpauth://totp/${label}?${params.toString()}`;
  }

  /**
   * Genera el código TOTP de 6 dígitos para un timestamp y secret dados.
   */
  generateCode(secret: string, timestamp: number = Date.now()): string {
    const counter = Math.floor(timestamp / 1000 / 30);
    const key = this.fromBase32(secret);
    const counterBuf = Buffer.alloc(8);
    counterBuf.writeBigUInt64BE(BigInt(counter));
    const hmac = createHmac("sha1", key).update(counterBuf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    return String(code % 1_000_000).padStart(6, "0");
  }

  /**
   * Verifica el código TOTP admitiendo una ventana ±window pasos (default ±1 = 30s).
   */
  verifyCode(secret: string, code: string, window = 1, timestamp: number = Date.now()): boolean {
    const sanitized = (code || "").replace(/\s+/g, "");
    if (!/^\d{6}$/.test(sanitized)) {
      return false;
    }
    for (let offset = -window; offset <= window; offset++) {
      const expected = this.generateCode(secret, timestamp + offset * 30 * 1000);
      if (expected === sanitized) {
        return true;
      }
    }
    return false;
  }

  /**
   * Genera códigos de recuperación aleatorios.
   */
  generateRecoveryCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const raw = randomBytes(5).toString("hex").toUpperCase();
      codes.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);
    }
    return codes;
  }

  private toBase32(buffer: Buffer): string {
    let bits = 0;
    let value = 0;
    let output = "";
    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        output += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
    }
    return output;
  }

  private fromBase32(secret: string): Buffer {
    const cleaned = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;
    for (const ch of cleaned) {
      const idx = BASE32_ALPHABET.indexOf(ch);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    return Buffer.from(bytes);
  }
}
