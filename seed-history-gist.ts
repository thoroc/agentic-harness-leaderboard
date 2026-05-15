#!/usr/bin/env bun
/**
 * Reconstructs historical star snapshots from the gist revision history at:
 *   https://gist.github.com/11010tianyi/89304b6e481d17373bd0d32eb5575bf8
 *
 * Each commit to the gist contains an agent-stars.md with a markdown table of
 * live GitHub star counts at the time it was generated. This script fetches all
 * revisions, parses the tables, maps repos back to agent IDs, and merges the
 * resulting snapshots into history.json without overwriting existing dates.
 *
 * Usage:
 *   bun seed-history-gist.ts [--history-output <path>]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { AGENTS } from "./src/agents";
import type { HistoryPayload, HistorySnapshot } from "./src/types";

// ── Config ────────────────────────────────────────────────────────────────────

const GIST_ID = "89304b6e481d17373bd0d32eb5575bf8";
const GIST_USER = "11010tianyi";
const GIST_FILE = "agent-stars.md";

function flag(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name);
  return idx !== -1 && process.argv[idx + 1] ? (process.argv[idx + 1] as string) : fallback;
}

const HISTORY_PATH = flag("--history-output", "site/public/data/history.json");

// ── Helpers ───────────────────────────────────────────────────────────────────

const projectId = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Build a repo→agent map from agents.json for reliable matching. */
const repoToAgent = new Map(
  Object.entries(AGENTS)
    .filter(([, e]) => e.kind === "open")
    .map(([name, e]) => [(e as { kind: "open"; repo: string }).repo.toLowerCase(), name]),
);

// ── GitHub API ────────────────────────────────────────────────────────────────

interface GistCommit {
  version: string;
  committed_at: string;
}

async function fetchCommits(): Promise<GistCommit[]> {
  const url = `https://api.github.com/gists/${GIST_ID}/commits?per_page=100`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "agentic-harness-leaderboard/seed-history-gist",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<GistCommit[]>;
}

async function fetchRawMarkdown(sha: string): Promise<string> {
  const url = `https://gist.githubusercontent.com/${GIST_USER}/${GIST_ID}/raw/${sha}/${GIST_FILE}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "agentic-harness-leaderboard/seed-history-gist" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Raw fetch ${res.status} for ${sha}`);
  return res.text();
}

// ── Markdown parser ───────────────────────────────────────────────────────────

interface ParsedRow {
  name: string;
  repo: string; // "owner/repo"
  stars: number | null;
  forks: number | null;
}

/**
 * Parses agent-stars.md table rows.
 * Handles two column layouts:
 *   Old: | # | Agent | Stars | GitHub Repo |
 *   New: | # | Agent | Stars | GitHub Repo | Source |  (may also have Forks)
 */
function parseMarkdown(md: string): ParsedRow[] {
  const rows: ParsedRow[] = [];

  for (const line of md.split("\n")) {
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    // Must have at least 4 real columns (rank, agent, stars, repo)
    if (cols.length < 4) continue;
    // Skip header and separator lines
    if (!cols[0] || !/^\d+$/.test(cols[0])) continue;

    const agentCol = cols[1] ?? "";
    const starsCol = cols[2] ?? "";
    const repoCol = cols[3] ?? "";
    const forksCol = cols.length >= 5 ? cols[4] : null;

    // Extract repo slug from markdown link: [owner/repo](https://github.com/owner/repo)
    const repoMatch = repoCol.match(/\[([^\]]+)\]\(https:\/\/github\.com\/([^)]+)\)/);
    const repo = repoMatch?.[2]?.toLowerCase();
    if (!repo) continue;

    const stars = parseInt(starsCol.replace(/,/g, ""), 10);
    const forks = forksCol ? parseInt(forksCol.replace(/,/g, ""), 10) : null;

    rows.push({
      name: agentCol,
      repo,
      stars: Number.isNaN(stars) ? null : stars,
      forks: forks !== null && !Number.isNaN(forks) ? forks : null,
    });
  }

  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\nFetching gist commit history for ${GIST_ID}...`);
  const commits = await fetchCommits();
  console.log(`Found ${commits.length} commits\n`);

  // One snapshot per calendar date — use the last commit on each day
  const byDate = new Map<string, GistCommit>();
  for (const c of commits) {
    const date = c.committed_at.slice(0, 10);
    byDate.set(date, c); // later commits overwrite earlier ones for the same day
  }

  const newSnapshots: HistorySnapshot[] = [];

  for (const [date, commit] of [...byDate.entries()].sort()) {
    process.stdout.write(`  ${date} (${commit.version.slice(0, 8)}) ... `);
    try {
      const md = await fetchRawMarkdown(commit.version);
      const rows = parseMarkdown(md);

      if (rows.length === 0) {
        console.log("no rows parsed, skipping");
        continue;
      }

      const agents = rows
        .map((row) => {
          const agentName = repoToAgent.get(row.repo);
          if (!agentName) return null; // repo not in our agents list
          return {
            id: projectId(agentName),
            name: agentName,
            repo: row.repo,
            kind: "open" as const,
            stars: row.stars,
            forks: row.forks,
          };
        })
        .filter((a): a is NonNullable<typeof a> => a !== null);

      newSnapshots.push({
        date,
        generatedAt: commit.committed_at,
        agents,
      });

      console.log(`${agents.length} agents`);
    } catch (err) {
      console.log(`error — ${(err as Error).message}`);
    }

    await Bun.sleep(100);
  }

  // Load and merge with existing history (never overwrite existing dates)
  let existing: HistoryPayload = { updatedAt: new Date().toISOString(), snapshots: [] };
  if (existsSync(HISTORY_PATH)) {
    existing = JSON.parse(readFileSync(HISTORY_PATH, "utf-8")) as HistoryPayload;
    console.log(`\nLoaded ${existing.snapshots.length} existing snapshot(s) from ${HISTORY_PATH}`);
  }

  const existingByDate = new Map(existing.snapshots.map((s) => [s.date, s]));
  let added = 0;
  for (const snap of newSnapshots) {
    if (!existingByDate.has(snap.date)) {
      existingByDate.set(snap.date, snap);
      added++;
    }
  }

  const merged: HistoryPayload = {
    updatedAt: new Date().toISOString(),
    snapshots: [...existingByDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
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
