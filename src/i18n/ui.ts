import en from "./locales/en-US.json";
import es from "./locales/es-ES.json";

export const defaultLocale = "en";
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeCodes: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
};

export const languageNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export type UiKey = keyof typeof en;

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, es };

export const isLocale = (value: unknown): value is Locale =>
  locales.includes(value as Locale);

export const toLocale = (value: unknown): Locale =>
  isLocale(value) ? value : defaultLocale;

export function useTranslations(locale: Locale) {
  return (key: UiKey): string =>
    dictionaries[locale][key] ?? dictionaries[defaultLocale][key];
}

export const formatMonthYear = (locale: Locale, date?: Date, present = "") =>
  date
    ? date.toLocaleDateString(localeCodes[locale], {
        month: "short",
        year: "numeric",
      })
    : present;

export const formatFullDate = (locale: Locale, date: Date) =>
  date.toLocaleDateString(localeCodes[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const byLocale =
  (locale: Locale) =>
  (entry: { id: string }): boolean =>
    entry.id.startsWith(`${locale}/`);

export const entrySlug = (id: string): string => id.slice(id.indexOf("/") + 1);

export const localizedPath = (locale: Locale, path: string): string =>
  locale === defaultLocale
    ? path
    : path === "/"
      ? `/${locale}`
      : `/${locale}${path}`;

export const barePath = (path: string): string => {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1);
  }
  return path;
};
