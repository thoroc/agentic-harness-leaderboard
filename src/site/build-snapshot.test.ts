import { test, expect } from "bun:test";
import { buildSnapshot } from "./build-snapshot";
import type { SitePayload } from "../types";

const openAgent = {
  id: "test-agent", name: "Test Agent", kind: "open" as const, repo: "test/repo",
  vendor: null, url: "https://github.com/test/repo",
  stars: 100, forks: 10, openIssues: 5, pushedAt: "2024-03-01T00:00:00Z", updatedAt: "2024-03-10T00:00:00Z",
  sources: ["Vercel Skills"], sourceLabels: ["Vercel Skills"],
};

const closedAgent = {
  id: "closed-corp", name: "Closed Corp", kind: "closed" as const, repo: null,
  vendor: "Corp Inc", url: null,
  stars: null, forks: null, openIssues: null, pushedAt: null, updatedAt: null,
  sources: ["Manual"], sourceLabels: ["Manual"],
};

const unknownAgent = {
  id: "mystery", name: "Mystery", kind: "unknown" as const, repo: null,
  vendor: null, url: null,
  stars: null, forks: null, openIssues: null, pushedAt: null, updatedAt: null,
  sources: ["ClawCharts"], sourceLabels: ["ClawCharts"],
};

const payload: SitePayload = {
  generatedAt: "2024-03-15T12:00:00.000Z",
  generatedDate: "2024-03-15",
  generatedDateTime: "2024/03/15 12:00",
  timezone: "UTC",
  totals: { agents: 3, repos: 1, stars: 100, forks: 10, openAgents: 1, closedAgents: 1, unknownAgents: 1 },
  agents: [openAgent, closedAgent, unknownAgent],
};

test("buildSnapshot only includes open agents", () => {
  const snapshot = buildSnapshot(payload);
  expect(snapshot.date).toBe("2024-03-15");
  expect(snapshot.generatedAt).toBe("2024-03-15T12:00:00.000Z");
  expect(snapshot.agents).toHaveLength(1);
  expect(snapshot.agents[0]?.id).toBe("test-agent");
  expect(snapshot.agents[0]?.name).toBe("Test Agent");
  expect(snapshot.agents[0]?.repo).toBe("test/repo");
  expect(snapshot.agents[0]?.stars).toBe(100);
  expect(snapshot.agents[0]?.forks).toBe(10);
});

test("buildSnapshot returns empty agents when no open agents exist", () => {
  const noOpen: SitePayload = { ...payload, agents: [closedAgent, unknownAgent], totals: { ...payload.totals, openAgents: 0 } };
  const snapshot = buildSnapshot(noOpen);
  expect(snapshot.agents).toHaveLength(0);
});
