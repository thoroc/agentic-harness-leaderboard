import { expect, test } from "bun:test";
import { formatConsoleSources } from "./format-console-sources.ts";

test("formatConsoleSources joins multiple sources", () => {
  expect(formatConsoleSources(["Vercel Skills", "ClawCharts"])).toBe("Vercel Skills, ClawCharts");
});

test("formatConsoleSources handles single source", () => {
  expect(formatConsoleSources(["Manual"])).toBe("Manual");
});

test("formatConsoleSources returns empty string for empty array", () => {
  expect(formatConsoleSources([])).toBe("");
});
