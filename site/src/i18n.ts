export function t(translations: Record<string, string>, key: string, vars?: Record<string, string | number>): string {
  let value = translations[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(`{{${k}}}`, String(v));
    }
  }
  return value;
}

export const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  zh: "中文",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  pl: "Polski",
  ru: "Русский",
  ko: "한국어",
  ja: "日本語",
};
