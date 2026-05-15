#!/usr/bin/env bun
/**
 * Backfills ~3 months of weekly star-count snapshots into history.json
 * using OSS Insight's public API for historical GitHub star counts.
 *
 * Usage:
 *   bun seed-history.ts [--history-output <path>] [--weeks <n>]
 *
 * Existing snapshots are never overwritten.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { AGENTS } from "./src/agents";
import type { HistoryPayload, HistorySnapshot } from "./src/types";

// ── CLI flags ─────────────────────────────────────────────────────────────────

function flag(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name);
  return idx !== -1 && process.argv[idx + 1] ? (process.argv[idx + 1] as string) : fallback;
}

const HISTORY_PATH = flag("--history-output", "site/public/data/history.json");
const WEEKS = parseInt(flag("--weeks", "13"), 10); // 13 weeks ≈ 3 months

// ── Helpers ───────────────────────────────────────────────────────────────────

const projectId = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Returns WEEKS weekly dates (YYYY-MM-DD), oldest first, stopping before today. */
function weeklyDates(weeks: number): string[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dates: string[] = [];
  for (let i = weeks; i >= 1; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i * 7);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// ── OSS Insight ───────────────────────────────────────────────────────────────

interface OssRow {
  date: string; // "YYYY-MM-DD" (first of month)
  stargazers: string; // cumulative total as string
}

interface MonthlyPoint {
  date: string; // "YYYY-MM-DD"
  stars: number; // cumulative
}

async function fetchMonthlyStars(owner: string, repo: string): Promise<MonthlyPoint[]> {
  const url = `https://api.ossinsight.io/v1/repos/${owner}/${repo}/stargazers/history`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "agentic-harness-leaderboard/seed-history" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.warn(`  [${res.status}] OSS Insight: ${owner}/${repo}`);
      return [];
    }
    const json = (await res.json()) as { data?: { rows?: OssRow[] } };
    return (json.data?.rows ?? []).map((r) => ({
      date: r.date,
      stars: parseInt(r.stargazers, 10),
    }));
  } catch (err) {
    console.warn(`  [error] OSS Insight: ${owner}/${repo} — ${(err as Error).message}`);
    return [];
  }
}

/**
 * Estimates star count on `targetDate` by linear interpolation between the
 * two nearest monthly data points. Returns null if no data is available.
 */
function interpolateStars(history: MonthlyPoint[], targetDate: string): number | null {
  if (history.length === 0) return null;

  // Sort ascending
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));

  // Find bracketing entries
  const before = [...sorted].reverse().find((h) => h.date <= targetDate);
  const after = sorted.find((h) => h.date > targetDate);

  if (!before) return after?.stars ?? null;
  if (!after) return before.stars;

  // Linear interpolation in time
  const t0 = new Date(before.date).getTime();
  const t1 = new Date(after.date).getTime();
  const t = new Date(targetDate).getTime();
  const ratio = (t - t0) / (t1 - t0);
  return Math.round(before.stars + ratio * (after.stars - before.stars));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const dates = weeklyDates(WEEKS);
  console.log(`\nSeeding ${dates.length} weekly snapshots: ${dates[0]} → ${dates.at(-1)}\n`);

  // Only open-source agents appear in history snapshots (mirrors build-snapshot.ts)
  const openAgents = Object.entries(AGENTS)
    .filter(([, entry]) => entry.kind === "open")
    .map(([name, entry]) => ({
      id: projectId(name),
      name,
      repo: (entry as { kind: "open"; repo: string }).repo,
      kind: "open" as const,
    }));

  console.log(`Fetching star history from OSS Insight for ${openAgents.length} repos...`);

  // Fetch all repos (sequential to avoid hammering the API)
  const starHistories = new Map<string, MonthlyPoint[]>();
  for (const agent of openAgents) {
    process.stdout.write(`  ${agent.repo} ... `);
    const [owner = "", repo = ""] = agent.repo.split("/");
    const history = await fetchMonthlyStars(owner, repo);
    starHistories.set(agent.repo, history);
    console.log(`${history.length} months`);
    await Bun.sleep(150);
  }

  // Build new snapshots
  const newSnapshots: HistorySnapshot[] = dates.map((date) => ({
    date,
    generatedAt: new Date(`${date}T00:00:00.000Z`).toISOString(),
    agents: openAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      repo: agent.repo,
      kind: agent.kind,
      stars: interpolateStars(starHistories.get(agent.repo) ?? [], date),
      forks: null, // OSS Insight doesn't expose fork history
    })),
  }));

  // Load and merge with existing history (never overwrite existing dates)
  let existing: HistoryPayload = { updatedAt: new Date().toISOString(), snapshots: [] };
  if (existsSync(HISTORY_PATH)) {
    existing = JSON.parse(readFileSync(HISTORY_PATH, "utf-8")) as HistoryPayload;
    console.log(`\nLoaded ${existing.snapshots.length} existing snapshot(s) from ${HISTORY_PATH}`);
  }

  const byDate = new Map(existing.snapshots.map((s) => [s.date, s]));
  let added = 0;
  for (const snap of newSnapshots) {
    if (!byDate.has(snap.date)) {
      byDate.set(snap.date, snap);
      added++;
    }
  }

  const merged: HistoryPayload = {
    updatedAt: new Date().toISOString(),
    snapshots: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
  };

  mkdirSync(dirname(HISTORY_PATH), { recursive: true });
  writeFileSync(HISTORY_PATH, JSON.stringify(merged, null, 2));

  console.log(`\nAdded ${added} new snapshot(s) — total: ${merged.snapshots.length}`);
  console.log(`Written to ${HISTORY_PATH}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
