import { localeMessages, type SupportedLocale } from "../locales";

export type { SupportedLocale };

function getByPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, source);
}

export function normalizeLocale(locale?: string | null): SupportedLocale {
  if (!locale) {
    return "en-US";
  }

  if (locale.startsWith("zh")) {
    return "zh-CN";
  }

  if (locale in localeMessages) {
    return locale as SupportedLocale;
  }

  return "en-US";
}

export function createTranslator(locale: SupportedLocale = "zh-CN") {
  return (key: string, fallback?: string) => {
    const value = getByPath(localeMessages[locale], key);
    return typeof value === "string" ? value : fallback || key;
  };
}
