import enUS from "./en-US";
import zhCN from "./zh-CN";

export const localeMessages = {
  "en-US": enUS,
  "zh-CN": zhCN,
} as const;

export type SupportedLocale = keyof typeof localeMessages;

export { enUS, zhCN };
