#!/usr/bin/env bun
/**
 * Fetch GitHub star counts for agents from curated source lists.
 * Source tags currently include vercel-labs/skills and ClawCharts.
 * Sorted descending by stars.
 *
 * Usage:
 *   bun ./agent-stars.ts
 *   bun ./agent-stars.ts --output agent-stars.md
 *   bun ./agent-stars.ts --output agent-stars.md --zh-output agent-stars.zh-CN.md
 *   bun ./agent-stars.ts --json-output site/data/latest.json --history-output site/data/history.json --snapshot-dir site/data/snapshots
 *   GITHUB_TOKEN=ghp_xxx bun ./agent-stars.ts --output agent-stars.md --zh-output agent-stars.zh-CN.md
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

type AgentSource = "Vercel Skills" | "ClawCharts" | "Manual";

type AgentEntryBase = {
  sources?: AgentSource[];
};

type AgentEntry =
  & AgentEntryBase
  & (
    | { kind: "open"; repo: string }
    | { kind: "closed"; vendor: string }
    | { kind: "unknown" }
  );

// Agent display name -> source classification
const AGENTS: Record<string, AgentEntry> = {
  Amp: { kind: "closed", vendor: "Sourcegraph" },
  Antigravity: { kind: "closed", vendor: "Google DeepMind" },
  Augment: { kind: "closed", vendor: "Augment" },
  "Claude Code": { kind: "open", repo: "anthropics/claude-code" },
  Cline: { kind: "open", repo: "cline/cline" },
  CodeBuddy: { kind: "closed", vendor: "Tencent" },
  Codex: { kind: "open", repo: "openai/codex" },
  "Command Code": { kind: "closed", vendor: "CommandCodeAI" },
  Continue: { kind: "open", repo: "continuedev/continue" },
  "Cortex Code": { kind: "closed", vendor: "Snowflake" },
  Crush: { kind: "open", repo: "charmbracelet/crush" },
  Cursor: { kind: "closed", vendor: "Anysphere" },
  "Deep Agents": { kind: "open", repo: "langchain-ai/deepagents" },
  Droid: { kind: "closed", vendor: "Factory AI" },
  "Gemini CLI": { kind: "open", repo: "google-gemini/gemini-cli" },
  "GitHub Copilot": { kind: "closed", vendor: "Microsoft" },
  Goose: { kind: "open", repo: "block/goose" },
  "Hermes Agent": {
    kind: "open",
    repo: "NousResearch/hermes-agent",
    sources: ["ClawCharts"],
  },
  iFlow: { kind: "open", repo: "iflow-ai/iflow-cli" },
  IronClaw: { kind: "open", repo: "nearai/ironclaw", sources: ["ClawCharts"] },
  Junie: { kind: "closed", vendor: "JetBrains" },
  KiloCode: { kind: "open", repo: "Kilo-Org/kilocode" },
  "Kimi Code CLI": { kind: "closed", vendor: "Moonshot AI" },
  Kiro: { kind: "closed", vendor: "Amazon" },
  Kode: { kind: "open", repo: "shareAI-lab/Kode-Agent" },
  MCPJam: { kind: "open", repo: "MCPJam/inspector" },
  Mux: { kind: "unknown" },
  Nanobot: { kind: "open", repo: "HKUDS/nanobot", sources: ["ClawCharts"] },
  NanoClaw: {
    kind: "open",
    repo: "qwibitai/nanoclaw",
    sources: ["ClawCharts"],
  },
  Neovate: { kind: "unknown" },
  OpenCode: { kind: "open", repo: "anomalyco/opencode" },
  OpenClaw: {
    kind: "open",
    repo: "openclaw/openclaw",
    sources: ["Vercel Skills", "ClawCharts"],
  },
  OpenFang: {
    kind: "open",
    repo: "RightNow-AI/openfang",
    sources: ["ClawCharts"],
  },
  OpenHands: { kind: "open", repo: "All-Hands-AI/OpenHands" },
  Paperclip: {
    kind: "open",
    repo: "paperclipai/paperclip",
    sources: ["ClawCharts"],
  },
  Pi: { kind: "open", repo: "badlogic/pi-mono" },
  PicoClaw: { kind: "open", repo: "sipeed/picoclaw", sources: ["ClawCharts"] },
  Pochi: { kind: "closed", vendor: "TabbyML" },
  Qoder: { kind: "closed", vendor: "Qoder" },
  Qwen: { kind: "open", repo: "QwenLM/qwen-code" },
  Replit: { kind: "closed", vendor: "Replit" },
  Roo: { kind: "open", repo: "RooVetGit/Roo-Code" },
  ADAL: { kind: "closed", vendor: "ADAL" },
  TinyClaw: { kind: "open", repo: "TinyAGI/tinyclaw", sources: ["ClawCharts"] },
  Trae: { kind: "open", repo: "bytedance/trae-agent" },
  Vibe: { kind: "unknown" },
  Warp: { kind: "open", repo: "warpdotdev/Warp" },
  Windsurf: { kind: "closed", vendor: "Codeium" },
  Zed: { kind: "open", repo: "zed-industries/zed" },
  ZeroClaw: {
    kind: "open",
    repo: "zeroclaw-labs/zeroclaw",
    sources: ["ClawCharts"],
  },
  Zencoder: { kind: "closed", vendor: "Zencoder" },
};

interface RepoStats {
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  pushedAt: string | null;
  updatedAt: string | null;
  description: string | null;
  htmlUrl: string | null;
  error?: string;
}

interface OpenResult {
  agent: string;
  repo: string;
  stats: RepoStats;
  sources: AgentSource[];
}

interface ClosedEntry {
  agent: string;
  vendor: string;
  sources: AgentSource[];
}

interface UnknownEntry {
  agent: string;
  sources: AgentSource[];
}

const SOURCE_URL =
  "https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents";
const CLAWCHARTS_URL = "https://clawcharts.com/";
const SOURCE_INFO: Record<
  AgentSource,
  { label: string; zhLabel: string; url?: string }
> = {
  "Vercel Skills": {
    label: "Vercel Skills",
    zhLabel: "Vercel Skills",
    url: SOURCE_URL,
  },
  ClawCharts: {
    label: "ClawCharts",
    zhLabel: "ClawCharts",
    url: CLAWCHARTS_URL,
  },
  Manual: { label: "Manual", zhLabel: "手工维护" },
};
const DEFAULT_OUTPUT = "agent-stars.md";
const DEFAULT_ZH_OUTPUT = "agent-stars.zh-CN.md";
const DEFAULT_JSON_OUTPUT = "site/data/latest.json";
const DEFAULT_HISTORY_OUTPUT = "site/data/history.json";
const DEFAULT_SNAPSHOT_DIR = "site/data/snapshots";
const HISTORY_LIMIT = 120;
const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

async function fetchRepoStats(
  repo: string,
  token?: string,
): Promise<RepoStats> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "agent-stars-script",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (res.status === 404) {
      return { stars: null, forks: null, openIssues: null, pushedAt: null, updatedAt: null, description: null, htmlUrl: null, error: "404" };
    }
    if (!res.ok) {
      console.error(`  HTTP ${res.status} for ${repo}`);
      return { stars: null, forks: null, openIssues: null, pushedAt: null, updatedAt: null, description: null, htmlUrl: null, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      stargazers_count: number;
      forks_count: number;
      open_issues_count: number;
      pushed_at: string | null;
      updated_at: string | null;
      description: string | null;
      html_url: string;
    };
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      pushedAt: data.pushed_at,
      updatedAt: data.updated_at,
      description: data.description,
      htmlUrl: data.html_url,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { stars: null, forks: null, openIssues: null, pushedAt: null, updatedAt: null, description: null, htmlUrl: null, error: message };
  }
}

function getFlagValue(flag: string, fallback: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? fallback;
}

function getOptionalFlag(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function generatedDate(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.TZ || "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function generatedDateTime(date = new Date()): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: process.env.TZ || "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function escapeMarkdownCell(cell: string): string {
  return cell.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function sourcesFor(entry: AgentEntry): AgentSource[] {
  return entry.sources ?? ["Vercel Skills"];
}

function formatSources(sources: AgentSource[], language: "en" | "zh"): string {
  return sources
    .map((source) => {
      const info = SOURCE_INFO[source];
      const label = language === "zh" ? info.zhLabel : info.label;
      return info.url ? `[${label}](${info.url})` : label;
    })
    .join(", ");
}

function formatConsoleSources(sources: AgentSource[]): string {
  return sources.join(", ");
}

function nullableNumber(value: number | null | undefined): string {
  return typeof value === "number" ? NUMBER_FORMAT.format(value) : "N/A";
}

function shortDate(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "N/A";
}

function consoleTable(
  headers: string[],
  rows: string[][],
  widths: number[],
): void {
  const sep = widths.map((w) => "-".repeat(w)).join("-+-");
  console.log(headers.map((h, i) => h.padEnd(widths[i]!)).join(" | "));
  console.log(sep);
  for (const row of rows) {
    console.log(row.map((cell, i) => cell.padEnd(widths[i]!)).join(" | "));
  }
}

function mdTable(headers: string[], rows: string[][]): string {
  const header = `| ${headers.map(escapeMarkdownCell).join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows
    .map((row) => `| ${row.map(escapeMarkdownCell).join(" | ")} |`)
    .join("\n");
  return [header, sep, body].join("\n");
}

function buildEnglishMarkdown(
  open: OpenResult[],
  closed: ClosedEntry[],
  unknown: UnknownEntry[],
): string {
  const date = generatedDate();
  const lines: string[] = [
    "# Agent GitHub Stars",
    "",
    `> Generated on ${date}; star counts are fetched from GitHub API when generated. Source tags show discovery lists.`,
    "",
    "## Open Source Agents",
    "",
    mdTable(
      ["#", "Agent", "Stars", "Forks", "Last Push", "GitHub Repo", "Source"],
      open.map(({ agent, repo, stats, sources }, i) => [
        String(i + 1),
        agent,
        nullableNumber(stats.stars),
        nullableNumber(stats.forks),
        shortDate(stats.pushedAt),
        `[${repo}](https://github.com/${repo})`,
        formatSources(sources, "en"),
      ]),
    ),
    "",
    "## Closed Source Agents",
    "",
    mdTable(
      ["Agent", "Vendor", "Source"],
      closed.map((
        { agent, vendor, sources },
      ) => [agent, vendor, formatSources(sources, "en")]),
    ),
  ];

  if (unknown.length > 0) {
    lines.push(
      "",
      "## Unknown / No Repo Found",
      "",
      mdTable(
        ["Agent", "Source"],
        unknown.map((
          { agent, sources },
        ) => [agent, formatSources(sources, "en")]),
      ),
    );
  }

  return lines.join("\n") + "\n";
}

function buildChineseMarkdown(
  open: OpenResult[],
  closed: ClosedEntry[],
  unknown: UnknownEntry[],
): string {
  const date = generatedDate();
  const lines: string[] = [
    "# Agent GitHub 星标排行",
    "",
    `> 生成日期：${date}；生成时星标数从 GitHub API 获取；来源标签表示候选项目发现列表。`,
    "",
    "## 开源 Agent",
    "",
    mdTable(
      ["排名", "Agent", "星标数", "Forks", "最后推送", "GitHub 仓库", "来源"],
      open.map(({ agent, repo, stats, sources }, i) => [
        String(i + 1),
        agent,
        nullableNumber(stats.stars),
        nullableNumber(stats.forks),
        shortDate(stats.pushedAt),
        `[${repo}](https://github.com/${repo})`,
        formatSources(sources, "zh"),
      ]),
    ),
    "",
    "## 闭源 Agent",
    "",
    mdTable(
      ["Agent", "厂商", "来源"],
      closed.map((
        { agent, vendor, sources },
      ) => [agent, vendor, formatSources(sources, "zh")]),
    ),
  ];

  if (unknown.length > 0) {
    lines.push(
      "",
      "## 未知 / 未找到仓库",
      "",
      mdTable(
        ["Agent", "来源"],
        unknown.map((
          { agent, sources },
        ) => [agent, formatSources(sources, "zh")]),
      ),
    );
  }

  return lines.join("\n") + "\n";
}

// ── Site / JSON types ────────────────────────────────────────────────────

type SiteAgent = {
  id: string;
  name: string;
  kind: string;
  repo: string | null;
  vendor: string | null;
  url: string | null;
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  pushedAt: string | null;
  updatedAt: string | null;
  sources: string[];
  sourceLabels: string[];
};

type SitePayload = {
  generatedAt: string;
  generatedDate: string;
  generatedDateTime: string;
  timezone: string;
  totals: {
    agents: number;
    repos: number;
    stars: number;
    forks: number;
    openAgents: number;
    closedAgents: number;
    unknownAgents: number;
  };
  agents: SiteAgent[];
};

type HistorySnapshot = {
  date: string;
  generatedAt: string;
  agents: Array<{
    id: string;
    name: string;
    repo: string | null;
    kind: string;
    stars: number | null;
    forks: number | null;
  }>;
};

type HistoryPayload = {
  updatedAt: string;
  snapshots: HistorySnapshot[];
};

function projectId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function agentUrl(repo: string | null, kind: string, entry?: AgentEntry): string | null {
  if (repo) return `https://github.com/${repo}`;
  return null;
}

function buildSitePayload(open: OpenResult[], closed: ClosedEntry[], unknown: UnknownEntry[], now: Date): SitePayload {
  const agents: SiteAgent[] = [
    ...open.map((o) => ({
      id: projectId(o.agent),
      name: o.agent,
      kind: "open",
      repo: o.repo,
      vendor: null,
      url: `https://github.com/${o.repo}`,
      stars: o.stats.stars,
      forks: o.stats.forks,
      openIssues: o.stats.openIssues,
      pushedAt: o.stats.pushedAt,
      updatedAt: o.stats.updatedAt,
      sources: o.sources,
      sourceLabels: o.sources,
    })),
    ...closed.map((c) => ({
      id: projectId(c.agent),
      name: c.agent,
      kind: "closed",
      repo: null,
      vendor: c.vendor,
      url: null,
      stars: null,
      forks: null,
      openIssues: null,
      pushedAt: null,
      updatedAt: null,
      sources: c.sources,
      sourceLabels: c.sources,
    })),
    ...unknown.map((u) => ({
      id: projectId(u.agent),
      name: u.agent,
      kind: "unknown",
      repo: null,
      vendor: null,
      url: null,
      stars: null,
      forks: null,
      openIssues: null,
      pushedAt: null,
      updatedAt: null,
      sources: u.sources,
      sourceLabels: u.sources,
    })),
  ];

  const repoAgents = agents.filter((a) => a.repo);
  const totalStars = repoAgents.reduce((sum, a) => sum + (a.stars ?? 0), 0);
  const totalForks = repoAgents.reduce((sum, a) => sum + (a.forks ?? 0), 0);

  return {
    generatedAt: now.toISOString(),
    generatedDate: generatedDate(now),
    generatedDateTime: generatedDateTime(now),
    timezone: process.env.TZ || "Asia/Shanghai",
    totals: {
      agents: agents.length,
      repos: repoAgents.length,
      stars: totalStars,
      forks: totalForks,
      openAgents: open.length,
      closedAgents: closed.length,
      unknownAgents: unknown.length,
    },
    agents,
  };
}

function buildSnapshot(payload: SitePayload): HistorySnapshot {
  return {
    date: payload.generatedDate,
    generatedAt: payload.generatedAt,
    agents: payload.agents
      .filter((a) => a.kind === "open")
      .map((a) => ({
        id: a.id,
        name: a.name,
        repo: a.repo,
        kind: a.kind,
        stars: a.stars,
        forks: a.forks,
      })),
  };
}

async function readHistory(path: string): Promise<HistoryPayload> {
  try {
    const file = Bun.file(path);
    if (!(await file.exists())) return { updatedAt: new Date(0).toISOString(), snapshots: [] };
    const parsed = (await file.json()) as Partial<HistoryPayload>;
    return {
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots as HistorySnapshot[] : [],
    };
  } catch {
    return { updatedAt: new Date(0).toISOString(), snapshots: [] };
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeSiteData(payload: SitePayload, latestPath: string, historyPath: string, snapshotDir: string): Promise<void> {
  const snapshot = buildSnapshot(payload);
  const history = await readHistory(historyPath);
  const snapshotsByDate = new Map(history.snapshots.map((item) => [item.date, item]));
  snapshotsByDate.set(snapshot.date, snapshot);
  const snapshots = [...snapshotsByDate.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-HISTORY_LIMIT);
  const nextHistory: HistoryPayload = { updatedAt: payload.generatedAt, snapshots };

  await writeJson(latestPath, payload);
  await writeJson(historyPath, nextHistory);
  await writeJson(join(snapshotDir, `${payload.generatedDate}.json`), snapshot);
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) console.log("Tip: set GITHUB_TOKEN to avoid rate limiting\n");

  const outputPath = getFlagValue("--output", DEFAULT_OUTPUT);
  const explicitZhOutputPath = getFlagValue("--zh-output", DEFAULT_ZH_OUTPUT);
  const zhOutputPath = explicitZhOutputPath ??
    (outputPath ? DEFAULT_ZH_OUTPUT : null);
  const jsonOutputPath = getFlagValue("--json-output", DEFAULT_JSON_OUTPUT);
  const historyOutputPath = getFlagValue("--history-output", DEFAULT_HISTORY_OUTPUT);
  const snapshotDir = getOptionalFlag("--snapshot-dir") ?? DEFAULT_SNAPSHOT_DIR;

  const open: OpenResult[] = [];
  const closed: ClosedEntry[] = [];
  const unknown: UnknownEntry[] = [];

  await Promise.all(
    Object.entries(AGENTS).map(async ([agent, entry]) => {
      const sources = sourcesFor(entry);
      if (entry.kind === "closed") {
        closed.push({ agent, vendor: entry.vendor, sources });
        return;
      }
      if (entry.kind === "unknown") {
        unknown.push({ agent, sources });
        return;
      }
      const stats = await fetchRepoStats(entry.repo, token);
      if (stats.stars === null) {
        unknown.push({ agent, sources });
      } else {
        open.push({ agent, repo: entry.repo, stats, sources });
      }
    }),
  );

  open.sort((a, b) => (b.stats.stars ?? 0) - (a.stats.stars ?? 0) || a.agent.localeCompare(b.agent));
  closed.sort((a, b) => a.agent.localeCompare(b.agent));
  unknown.sort((a, b) => a.agent.localeCompare(b.agent));

  // ── Console output ───────────────────────────────────────────────
  console.log("\n## Open Source Agents (sorted by ⭐)\n");
  consoleTable(
    ["#", "Agent", "Stars", "Forks", "Last Push", "GitHub Repo", "Source"],
    open.map(({ agent, repo, stats, sources }, i) => [
      String(i + 1),
      agent,
      nullableNumber(stats.stars),
      nullableNumber(stats.forks),
      shortDate(stats.pushedAt),
      `https://github.com/${repo}`,
      formatConsoleSources(sources),
    ]),
    [3, 20, 10, 10, 14, 45, 28],
  );

  console.log("\n## Closed Source Agents\n");
  consoleTable(
    ["Agent", "Vendor", "Source"],
    closed.map((
      { agent, vendor, sources },
    ) => [agent, vendor, formatConsoleSources(sources)]),
    [20, 25, 28],
  );

  if (unknown.length > 0) {
    console.log("\n## Unknown / No Repo Found\n");
    console.log(
      unknown.map(({ agent, sources }) =>
        `${agent} (${formatConsoleSources(sources)})`
      ).join(", "),
    );
  }

  // ── Markdown file (optional) ─────────────────────────────────────
  if (outputPath) {
    await Bun.write(outputPath, buildEnglishMarkdown(open, closed, unknown));
    console.log(`\nMarkdown written to ${outputPath}`);
  }

  if (zhOutputPath) {
    await Bun.write(zhOutputPath, buildChineseMarkdown(open, closed, unknown));
    console.log(`Markdown written to ${zhOutputPath}`);
  }

  // ── JSON / site data (optional) ──────────────────────────────────
  if (jsonOutputPath && historyOutputPath && snapshotDir) {
    const now = new Date();
    const payload = buildSitePayload(open, closed, unknown, now);
    await writeSiteData(payload, jsonOutputPath, historyOutputPath, snapshotDir);
    console.log(`Site data written to ${jsonOutputPath}`);
    console.log(`History written to ${historyOutputPath}`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
