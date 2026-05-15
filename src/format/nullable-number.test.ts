import { expect, test } from "bun:test";
import { nullableNumber } from "./nullable-number";

test("nullableNumber formats zero", () => {
  expect(nullableNumber(0)).toBe("0");
});

test("nullableNumber formats small number", () => {
  expect(nullableNumber(42)).toBe("42");
});

test("nullableNumber formats large number with commas", () => {
  expect(nullableNumber(1000000)).toBe("1,000,000");
});

test("nullableNumber returns N/A for null", () => {
  expect(nullableNumber(null)).toBe("N/A");
});

test("nullableNumber returns N/A for undefined", () => {
  expect(nullableNumber(undefined)).toBe("N/A");
});

test("nullableNumber returns NaN for NaN input", () => {
  expect(nullableNumber(NaN)).toBe("NaN");
});

test("nullableNumber formats negative values", () => {
  expect(nullableNumber(-1000)).toBe("-1,000");
});
