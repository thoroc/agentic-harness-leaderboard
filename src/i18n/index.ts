import i18next from "i18next";
import de from "./locales/de.json" with { type: "json" };
import en from "./locales/en.json" with { type: "json" };
import es from "./locales/es.json" with { type: "json" };
import fr from "./locales/fr.json" with { type: "json" };
import it from "./locales/it.json" with { type: "json" };
import ja from "./locales/ja.json" with { type: "json" };
import ko from "./locales/ko.json" with { type: "json" };
import pl from "./locales/pl.json" with { type: "json" };
import pt from "./locales/pt.json" with { type: "json" };
import ru from "./locales/ru.json" with { type: "json" };
import zh from "./locales/zh.json" with { type: "json" };

export const initI18n = async (locale = "en"): Promise<void> => {
  await i18next.init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      es: { translation: es },
      pt: { translation: pt },
      pl: { translation: pl },
      ru: { translation: ru },
      ko: { translation: ko },
      ja: { translation: ja },
    },
    lng: locale,
    fallbackLng: "en",
  });
};

export { i18next };
