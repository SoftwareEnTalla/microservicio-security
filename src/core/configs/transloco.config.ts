import { TranslocoConfig, AvailableLangs } from "@jsverse/transloco";

declare module "@jsverse/transloco" {
  interface TranslocoConfig {
    defaultStrategy?: "prefix" | "exclude";
    scopeStrategy?: "shared" | "isolated";
  }
}

const AVAILABLE_LANGS = ["es", "en", "fr"] as const;
type SupportedLang = (typeof AVAILABLE_LANGS)[number];

const normalizeLang = (value?: string): SupportedLang => {
  const raw = (value || "es").trim().replace(/['"]/g, "");
  const base = raw.split(".")[0].split("@")[0].split(/[_-]/)[0].toLowerCase();
  return (AVAILABLE_LANGS as readonly string[]).includes(base)
    ? (base as SupportedLang)
    : "es";
};

const defaultLang = normalizeLang(process.env.LANG);
const fallbackLang = Array.from(new Set([defaultLang, "es", "en"])) as SupportedLang[];

export const getTranslocoConfig = (): TranslocoConfig => ({
  defaultLang,
  reRenderOnLangChange: true,
  prodMode: process.env.NODE_ENV === "production",
  fallbackLang,
  failedRetries: 2,
  availableLangs: [...AVAILABLE_LANGS] as unknown as AvailableLangs,
  flatten: {
    aot: process.env.NODE_ENV === "production",
  },
  missingHandler: {
    logMissingKey: process.env.NODE_ENV !== "production",
    useFallbackTranslation: true,
    allowEmpty: false,
  },
  interpolation: ["{{", "}}"],
  scopes: {
    keepCasing: true,
  },
});
