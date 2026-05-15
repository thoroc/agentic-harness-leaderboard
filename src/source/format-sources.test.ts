import { expect, test } from "bun:test";
import { formatSources } from "./format-sources.ts";

test("formatSources returns English labels", () => {
  expect(formatSources(["Vercel Skills"], "en")).toBe("[Vercel Skills](https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents)");
});

test("formatSources returns Chinese labels", () => {
  expect(formatSources(["Vercel Skills"], "zh")).toBe("[Vercel Skills](https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents)");
});

test("formatSources handles Manual source without URL", () => {
  expect(formatSources(["Manual"], "en")).toBe("Manual");
});

test("formatSources handles multiple sources", () => {
  const result = formatSources(["Vercel Skills", "Manual"], "en");
  expect(result).toBe("[Vercel Skills](https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents), Manual");
});

test("formatSources returns empty string for empty array", () => {
  expect(formatSources([], "en")).toBe("");
});
