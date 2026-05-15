import { beforeEach, expect, test } from "bun:test";
import { getFlagValue } from "./get-flag-value";

const originalArgv = process.argv;

beforeEach(() => {
  process.argv = originalArgv;
});

test("getFlagValue returns value after flag", () => {
  process.argv = ["bun", "test", "--output", "foo.md"];
  expect(getFlagValue("--output", "default.md")).toBe("foo.md");
});

test("getFlagValue returns fallback when flag is last argument", () => {
  process.argv = ["bun", "test", "--output"];
  expect(getFlagValue("--output", "default.md")).toBe("default.md");
});

test("getFlagValue returns null when flag not found", () => {
  process.argv = ["bun", "test"];
  expect(getFlagValue("--output", "default.md")).toBeNull();
});

test("getFlagValue returns empty string when flag value is empty", () => {
  process.argv = ["bun", "test", "--output", ""];
  expect(getFlagValue("--output", "default.md")).toBe("");
});
