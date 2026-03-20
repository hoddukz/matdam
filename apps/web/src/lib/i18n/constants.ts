// Tag: core
// Path: apps/web/src/lib/i18n/constants.ts

export const SUPPORTED_LOCALES = ["ko", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
