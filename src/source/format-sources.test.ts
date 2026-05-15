import { beforeAll, expect, test } from "bun:test";
import { initI18n } from "../i18n";
import { formatSources } from "./format-sources";

beforeAll(async () => {
  await initI18n("en");
});

test("formatSources returns English labels", () => {
  expect(formatSources(["Vercel Skills"], "en")).toBe("[Vercel Skills](https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents)");
});

test("formatSources returns Chinese labels", () => {
  expect(formatSources(["Vercel Skills"], "zh")).toBe("[Vercel Skills](https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents)");
});

test("formatSources handles Manual source without URL", () => {
  expect(formatSources(["Manual"], "en")).toBe("Manual");
});

test("formatSources handles Manual Chinese without URL", () => {
  expect(formatSources(["Manual"], "zh")).toBe("手工维护");
});

test("formatSources handles multiple sources", () => {
  const result = formatSources(["Vercel Skills", "Manual"], "en");
  expect(result).toBe("[Vercel Skills](https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents), Manual");
});

test("formatSources returns empty string for empty array", () => {
  expect(formatSources([], "en")).toBe("");
});
