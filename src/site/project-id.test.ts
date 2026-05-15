import { test, expect } from "bun:test";
import { projectId } from "./project-id.ts";

test("projectId lowercases name", () => {
  expect(projectId("My Agent")).toBe("my-agent");
});

test("projectId replaces non-alphanumeric chars with hyphens", () => {
  expect(projectId("a!b@c#d")).toBe("a-b-c-d");
});

test("projectId strips leading/trailing hyphens", () => {
  expect(projectId("---hello---")).toBe("hello");
});

test("projectId handles empty string", () => {
  expect(projectId("")).toBe("");
});

test("projectId handles name with spaces", () => {
  expect(projectId("Claude Code")).toBe("claude-code");
});

test("projectId handles name with trailing special chars (stripped)", () => {
  expect(projectId("My Agent!")).toBe("my-agent");
});
