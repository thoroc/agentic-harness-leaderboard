import { beforeEach, expect, test } from "bun:test";
import { generatedDate } from "./generated-date.ts";

const originalTz = process.env.TZ;

beforeEach(() => {
  process.env.TZ = originalTz;
});

test("generatedDate formats a known date", () => {
  process.env.TZ = "Asia/Shanghai";
  const date = new Date("2024-03-15T08:30:00Z");
  expect(generatedDate(date)).toBe("2024-03-15");
});

test("generatedDate uses fallback timezone when TZ is unset", () => {
  delete process.env.TZ;
  const date = new Date("2024-03-15T08:30:00Z");
  const result = generatedDate(date);
  expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test("generatedDate uses default date when none provided", () => {
  process.env.TZ = "Asia/Shanghai";
  const result = generatedDate();
  expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
