/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 */

import { BadRequestException, Injectable } from "@nestjs/common";

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSymbol: boolean;
  maxLength: number;
  blockCommon: boolean;
}

const COMMON_PASSWORDS = new Set([
  "12345678",
  "password",
  "password1",
  "qwerty123",
  "admin123",
  "letmein1",
  "welcome1",
  "changeme",
]);

@Injectable()
export class PasswordPolicyService {
  resolvePolicy(): PasswordPolicy {
    return {
      minLength: this.numberFromEnv("PASSWORD_MIN_LENGTH", 8),
      maxLength: this.numberFromEnv("PASSWORD_MAX_LENGTH", 128),
      requireUppercase: this.boolFromEnv("PASSWORD_REQUIRE_UPPERCASE", true),
      requireLowercase: this.boolFromEnv("PASSWORD_REQUIRE_LOWERCASE", true),
      requireDigit: this.boolFromEnv("PASSWORD_REQUIRE_DIGIT", true),
      requireSymbol: this.boolFromEnv("PASSWORD_REQUIRE_SYMBOL", false),
      blockCommon: this.boolFromEnv("PASSWORD_BLOCK_COMMON", true),
    };
  }

  validate(password: string): void {
    const pwd = (password || "").trim();
    if (!pwd) {
      throw new BadRequestException("La contraseña es obligatoria.");
    }

    const policy = this.resolvePolicy();
    const errors: string[] = [];

    if (pwd.length < policy.minLength) {
      errors.push(`mínimo ${policy.minLength} caracteres`);
    }
    if (pwd.length > policy.maxLength) {
      errors.push(`máximo ${policy.maxLength} caracteres`);
    }
    if (policy.requireUppercase && !/[A-Z]/.test(pwd)) {
      errors.push("al menos una letra mayúscula");
    }
    if (policy.requireLowercase && !/[a-z]/.test(pwd)) {
      errors.push("al menos una letra minúscula");
    }
    if (policy.requireDigit && !/\d/.test(pwd)) {
      errors.push("al menos un dígito");
    }
    if (policy.requireSymbol && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push("al menos un carácter especial");
    }
    if (policy.blockCommon && COMMON_PASSWORDS.has(pwd.toLowerCase())) {
      errors.push("no debe ser una contraseña común");
    }

    if (errors.length > 0) {
      throw new BadRequestException(
        `La contraseña no cumple la política de seguridad: ${errors.join(", ")}.`,
      );
    }
  }

  private numberFromEnv(key: string, defaultValue: number): number {
    const v = Number(process.env[key]);
    return Number.isFinite(v) && v > 0 ? v : defaultValue;
  }

  private boolFromEnv(key: string, defaultValue: boolean): boolean {
    const raw = process.env[key];
    if (raw === undefined) return defaultValue;
    return String(raw).toLowerCase() === "true";
  }
}
