import { expect, test } from "bun:test";
import { CLAWCHARTS_URL, DEFAULT_JSON_OUTPUT, DEFAULT_OUTPUT, DEFAULT_ZH_OUTPUT, HISTORY_LIMIT, SOURCE_INFO, SOURCE_URL } from "./index";

test("SOURCE_URL is defined", () => {
  expect(SOURCE_URL).toBeString();
});

test("CLAWCHARTS_URL is defined", () => {
  expect(CLAWCHARTS_URL).toBeString();
});

test("SOURCE_INFO has entries for all sources", () => {
  expect(SOURCE_INFO["Vercel Skills"]).toBeDefined();
  expect(SOURCE_INFO.ClawCharts).toBeDefined();
  expect(SOURCE_INFO.Manual).toBeDefined();
});

test("Manual source has no URL", () => {
  expect(SOURCE_INFO.Manual.url).toBeUndefined();
});

test("DEFAULT_OUTPUT is a markdown file", () => {
  expect(DEFAULT_OUTPUT).toEndWith(".md");
});

test("DEFAULT_ZH_OUTPUT is a markdown file", () => {
  expect(DEFAULT_ZH_OUTPUT).toEndWith(".md");
});

test("DEFAULT_JSON_OUTPUT is a JSON file", () => {
  expect(DEFAULT_JSON_OUTPUT).toEndWith(".json");
});

test("HISTORY_LIMIT is a positive number", () => {
  expect(HISTORY_LIMIT).toBeGreaterThan(0);
});
