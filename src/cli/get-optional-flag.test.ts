import { beforeEach, expect, test } from "bun:test";
import { getOptionalFlag } from "./get-optional-flag.ts";

const originalArgv = process.argv;

beforeEach(() => {
  process.argv = originalArgv;
});

test("getOptionalFlag returns value after flag", () => {
  process.argv = ["bun", "test.ts", "--output", "foo.md"];
  expect(getOptionalFlag("--output")).toBe("foo.md");
});

test("getOptionalFlag returns null when flag not found", () => {
  process.argv = ["bun", "test.ts"];
  expect(getOptionalFlag("--output")).toBeNull();
});

test("getOptionalFlag returns null when flag is last argument", () => {
  process.argv = ["bun", "test.ts", "--output"];
  expect(getOptionalFlag("--output")).toBeNull();
});

test("getOptionalFlag returns empty string when flag value is empty", () => {
  process.argv = ["bun", "test.ts", "--output", ""];
  expect(getOptionalFlag("--output")).toBe("");
});

test("getOptionalFlag returns first occurrence when flag appears multiple times", () => {
  process.argv = ["bun", "test.ts", "--output", "first.md", "--output", "second.md"];
  expect(getOptionalFlag("--output")).toBe("first.md");
});
