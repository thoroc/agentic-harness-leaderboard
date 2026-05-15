import { expect, test } from "bun:test";
import type { AgentEntry } from "./index.ts";
import { sourcesFor } from "./sources-for.ts";

test("sourcesFor returns sources when present", () => {
  const entry = { kind: "open" as const, repo: "test/repo", sources: ["ClawCharts" as const] };
  expect(sourcesFor(entry)).toEqual(["ClawCharts"]);
});

test("sourcesFor returns default when sources is undefined", () => {
  const entry: AgentEntry = { kind: "open", repo: "test/repo" };
  expect(sourcesFor(entry)).toEqual(["Vercel Skills"]);
});

test("sourcesFor returns default when sources is null", () => {
  const entry = { kind: "open" as const, repo: "test/repo", sources: null as unknown as undefined };
  expect(sourcesFor(entry)).toEqual(["Vercel Skills"]);
});

test("sourcesFor returns empty array when sources is empty", () => {
  const entry = { kind: "open" as const, repo: "test/repo", sources: [] };
  expect(sourcesFor(entry)).toEqual([]);
});

test("sourcesFor handles closed agents", () => {
  const entry: AgentEntry = { kind: "closed", vendor: "TestVendor" };
  expect(sourcesFor(entry)).toEqual(["Vercel Skills"]);
});

test("sourcesFor handles unknown agents", () => {
  const entry: AgentEntry = { kind: "unknown" };
  expect(sourcesFor(entry)).toEqual(["Vercel Skills"]);
});
