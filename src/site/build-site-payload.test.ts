import { test, expect, beforeEach } from "bun:test";
import { buildSitePayload } from "./build-site-payload";
import type { OpenResult, ClosedEntry, UnknownEntry } from "../types/index";

beforeEach(() => {
  process.env.TZ = "UTC";
});

const now = new Date("2024-03-15T12:00:00Z");

test("buildSitePayload builds payload with all agent types", () => {
  const open: OpenResult[] = [{
    agent: "Test Agent",
    repo: "test/repo",
    stats: { stars: 100, forks: 10, openIssues: 5, pushedAt: "2024-03-01T00:00:00Z", updatedAt: "2024-03-10T00:00:00Z", description: "A test repo", htmlUrl: "https://github.com/test/repo" },
    sources: ["Vercel Skills"],
  }];
  const closed: ClosedEntry[] = [{ agent: "Closed Corp", vendor: "Corp Inc", sources: ["Manual"] }];
  const unknown: UnknownEntry[] = [{ agent: "Mystery", sources: ["ClawCharts"] }];

  const result = buildSitePayload(open, closed, unknown, now);

  expect(result.generatedAt).toBe("2024-03-15T12:00:00.000Z");
  expect(result.generatedDate).toBe("2024-03-15");
  expect(result.generatedDateTime).toBeString();
  expect(result.timezone).toBe("UTC");
  expect(result.totals.agents).toBe(3);
  expect(result.totals.repos).toBe(1);
  expect(result.totals.stars).toBe(100);
  expect(result.totals.forks).toBe(10);
  expect(result.totals.openAgents).toBe(1);
  expect(result.totals.closedAgents).toBe(1);
  expect(result.totals.unknownAgents).toBe(1);
  expect(result.agents).toHaveLength(3);
  expect(result.agents[0]?.kind).toBe("open");
  expect(result.agents[1]?.kind).toBe("closed");
  expect(result.agents[2]?.kind).toBe("unknown");
});

test("buildSitePayload handles empty arrays", () => {
  const result = buildSitePayload([], [], [], now);
  expect(result.totals.agents).toBe(0);
  expect(result.totals.repos).toBe(0);
  expect(result.totals.stars).toBe(0);
  expect(result.totals.forks).toBe(0);
  expect(result.agents).toHaveLength(0);
});

test("buildSitePayload handles null stats", () => {
  const open: OpenResult[] = [{
    agent: "Broken",
    repo: "broken/repo",
    stats: { stars: null, forks: null, openIssues: null, pushedAt: null, updatedAt: null, description: null, htmlUrl: null },
    sources: ["Vercel Skills"],
  }];
  const result = buildSitePayload(open, [], [], now);
  expect(result.totals.stars).toBe(0);
  expect(result.totals.forks).toBe(0);
  expect(result.totals.repos).toBe(1);
  expect(result.totals.openAgents).toBe(1);
});
