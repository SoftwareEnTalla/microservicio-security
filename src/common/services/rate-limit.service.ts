/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 *
 * Rate limiting in-memory para endpoints sensibles (login).
 * No requiere dependencias externas (@nestjs/throttler, redis).
 * Para producción con múltiples réplicas, sustituir por Redis/@nestjs/throttler.
 */

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

interface Bucket {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  /**
   * Consume un intento para la clave (ej: identifier+IP).
   * Lanza 429 TooManyRequests si excede el máximo configurado.
   */
  consume(key: string, options?: Partial<{ max: number; windowMs: number; blockMs: number }>): void {
    const max = options?.max ?? this.numberFromEnv("LOGIN_RATE_LIMIT_MAX", 10);
    const windowMs = options?.windowMs ?? this.numberFromEnv("LOGIN_RATE_LIMIT_WINDOW_MS", 60_000);
    const blockMs = options?.blockMs ?? this.numberFromEnv("LOGIN_RATE_LIMIT_BLOCK_MS", 300_000);
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (bucket?.blockedUntil && bucket.blockedUntil > now) {
      const retryMs = bucket.blockedUntil - now;
      throw new HttpException(
        {
          ok: false,
          message: "Demasiados intentos. Intente nuevamente más tarde.",
          retryAfterSeconds: Math.ceil(retryMs / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!bucket || now - bucket.firstAttemptAt > windowMs) {
      this.buckets.set(key, { attempts: 1, firstAttemptAt: now });
      return;
    }

    bucket.attempts += 1;

    if (bucket.attempts > max) {
      bucket.blockedUntil = now + blockMs;
      throw new HttpException(
        {
          ok: false,
          message: "Demasiados intentos. Cuenta bloqueada temporalmente.",
          retryAfterSeconds: Math.ceil(blockMs / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Libera el bucket al completar un intento exitoso. */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  private numberFromEnv(key: string, defaultValue: number): number {
    const v = Number(process.env[key]);
    return Number.isFinite(v) && v > 0 ? v : defaultValue;
  }
}
