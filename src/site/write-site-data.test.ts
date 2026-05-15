import { test, expect } from "bun:test";
import { writeSiteData } from "./write-site-data";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { SitePayload } from "../types";

const payload: SitePayload = {
  generatedAt: "2024-03-15T12:00:00.000Z",
  generatedDate: "2024-03-15",
  generatedDateTime: "2024/03/15 12:00",
  timezone: "UTC",
  totals: { agents: 1, repos: 1, stars: 100, forks: 10, openAgents: 1, closedAgents: 0, unknownAgents: 0 },
  agents: [{
    id: "test-agent", name: "Test Agent", kind: "open", repo: "test/repo",
    vendor: null, url: "https://github.com/test/repo",
    stars: 100, forks: 10, openIssues: 5, pushedAt: "2024-03-01T00:00:00Z", updatedAt: "2024-03-10T00:00:00Z",
    sources: ["Vercel Skills"], sourceLabels: ["Vercel Skills"],
  }],
};

test("writeSiteData writes three files", async () => {
  const dir = mkdtempSync(join(tmpdir(), "write-site-data-test-"));
  const latestPath = join(dir, "latest.json");
  const historyPath = join(dir, "history.json");
  const snapshotDir = join(dir, "snapshots");

  await writeSiteData(payload, latestPath, historyPath, snapshotDir);

  expect(existsSync(latestPath)).toBe(true);
  expect(existsSync(historyPath)).toBe(true);
  expect(existsSync(join(snapshotDir, "2024-03-15.json"))).toBe(true);

  const history = JSON.parse(readFileSync(historyPath, "utf-8"));
  expect(history.snapshots).toHaveLength(1);
  expect(history.snapshots[0].date).toBe("2024-03-15");

  rmSync(dir, { recursive: true });
});

test("writeSiteData merges with existing history", async () => {
  const dir = mkdtempSync(join(tmpdir(), "write-site-data-test-"));
  const latestPath = join(dir, "latest.json");
  const historyPath = join(dir, "history.json");
  const snapshotDir = join(dir, "snapshots");

  const existingHistory = {
    updatedAt: "2024-03-14T12:00:00.000Z",
    snapshots: [{ date: "2024-03-14", generatedAt: "2024-03-14T12:00:00.000Z", agents: [] }],
  };
  // Pre-write history
  await Bun.write(historyPath, JSON.stringify(existingHistory));

  await writeSiteData(payload, latestPath, historyPath, snapshotDir);

  const history = JSON.parse(readFileSync(historyPath, "utf-8"));
  expect(history.snapshots).toHaveLength(2);
  expect(history.snapshots[0].date).toBe("2024-03-14");
  expect(history.snapshots[1].date).toBe("2024-03-15");
  expect(history.updatedAt).toBe("2024-03-15T12:00:00.000Z");

  rmSync(dir, { recursive: true });
});
