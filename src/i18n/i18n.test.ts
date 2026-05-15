import { expect, test } from "bun:test";
import { i18next, initI18n } from "./index.ts";

test("initI18n sets the language", async () => {
  await initI18n("en");
  expect(i18next.language).toBe("en");
});

test("initI18n can switch to zh", async () => {
  await initI18n("zh");
  expect(i18next.language).toBe("zh");
});

test("returns English translation for source keys", async () => {
  await initI18n("en");
  expect(i18next.t("source.vercelSkills")).toBe("Vercel Skills");
  expect(i18next.t("source.clawCharts")).toBe("ClawCharts");
  expect(i18next.t("source.manual")).toBe("Manual");
});

test("returns Chinese translation for source keys", async () => {
  await initI18n("zh");
  expect(i18next.t("source.vercelSkills")).toBe("Vercel Skills");
  expect(i18next.t("source.manual")).toBe("手工维护");
});

test("falls back to English for missing keys", async () => {
  await initI18n("en");
  expect(i18next.t("nonexistent.key")).toBe("nonexistent.key");
});

test("returns markdown translations", async () => {
  await initI18n("zh");
  expect(i18next.t("markdown.title")).toBe("Agent GitHub 星标排行");
  expect(i18next.t("markdown.sectionOpen")).toBe("开源 Agent");
});
