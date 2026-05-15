import i18next from "i18next";
import en from "./locales/en.json" with { type: "json" };
import zh from "./locales/zh.json" with { type: "json" };

export const initI18n = async (locale = "en"): Promise<void> => {
  await i18next.init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: locale,
    fallbackLng: "en",
  });
};

export { i18next };
