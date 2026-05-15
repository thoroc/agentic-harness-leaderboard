import { expect, test } from "bun:test";
import { shortDate } from "./short-date.ts";

test("shortDate formats ISO string", () => {
  expect(shortDate("2024-03-15T12:00:00Z")).toBe("2024-03-15");
});

test("shortDate returns N/A for null", () => {
  expect(shortDate(null)).toBe("N/A");
});

test("shortDate returns N/A for undefined", () => {
  expect(shortDate(undefined)).toBe("N/A");
});

test("shortDate returns N/A for empty string (falsy)", () => {
  expect(shortDate("")).toBe("N/A");
});

test("shortDate returns short strings as-is", () => {
  expect(shortDate("2024")).toBe("2024");
});

test("shortDate handles date without time", () => {
  expect(shortDate("2024-03-15")).toBe("2024-03-15");
});
