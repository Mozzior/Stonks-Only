import { createI18n } from "vue-i18n";
import { localeMessages, type SupportedLocale } from "../locales";
import { normalizeLocale } from "../translator";

export const datetimeFormats = {
  "en-US": {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
    },
  },
  "zh-CN": {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    },
  },
} as const;

export const numberFormats = {
  "en-US": {
    currency: {
      style: "currency",
      currency: "USD",
    },
    percent: {
      style: "percent",
      minimumFractionDigits: 2,
    },
  },
  "zh-CN": {
    currency: {
      style: "currency",
      currency: "CNY",
    },
    percent: {
      style: "percent",
      minimumFractionDigits: 2,
    },
  },
} as const;

function getBrowserLocale() {
  const stored =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("language")
      : null;
  const browser = typeof navigator !== "undefined" ? navigator.language : null;
  return normalizeLocale(stored || browser);
}

export function createSharedI18n(locale?: SupportedLocale) {
  return createI18n({
    legacy: false,
    locale: normalizeLocale(locale || getBrowserLocale()),
    fallbackLocale: "en-US",
    messages: localeMessages,
    globalInjection: true,
    datetimeFormats,
    numberFormats,
  });
}

const i18n = createSharedI18n();

export default i18n;
