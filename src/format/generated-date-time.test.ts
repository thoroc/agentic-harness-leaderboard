import { beforeEach, expect, test } from "bun:test";
import { generatedDateTime } from "./generated-date-time.ts";

const originalTz = process.env.TZ;

beforeEach(() => {
  process.env.TZ = originalTz;
});

test("generatedDateTime formats a known date", () => {
  process.env.TZ = "Asia/Shanghai";
  const date = new Date("2024-03-15T08:30:00Z");
  expect(generatedDateTime(date)).toBe("2024/03/15 16:30");
});

test("generatedDateTime uses fallback timezone when TZ is unset", () => {
  delete process.env.TZ;
  const date = new Date("2024-03-15T08:30:00Z");
  const result = generatedDateTime(date);
  expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
});

test("generatedDateTime uses default date when none provided", () => {
  process.env.TZ = "Asia/Shanghai";
  const result = generatedDateTime();
  expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
});
