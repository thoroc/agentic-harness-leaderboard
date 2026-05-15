import { AGENTS } from "./agents/index.ts";
import { sourcesFor } from "./agents/sources-for.ts";
import { getFlagValue } from "./cli/get-flag-value.ts";
import { getOptionalFlag } from "./cli/get-optional-flag.ts";
import { DEFAULT_HISTORY_OUTPUT, DEFAULT_JSON_OUTPUT, DEFAULT_OUTPUT, DEFAULT_SNAPSHOT_DIR, DEFAULT_ZH_OUTPUT } from "./constants/index.ts";
import { nullableNumber } from "./format/nullable-number.ts";
import { shortDate } from "./format/short-date.ts";
import { fetchRepoStats } from "./github/fetch-repo-stats.ts";
import { initI18n } from "./i18n/index.ts";
import { buildChineseMarkdown } from "./markdown/build-chinese-markdown.ts";
import { buildEnglishMarkdown } from "./markdown/build-english-markdown.ts";
import { buildSitePayload } from "./site/build-site-payload.ts";
import { writeSiteData } from "./site/write-site-data.ts";
import { formatConsoleSources } from "./source/format-console-sources.ts";
import { consoleTable } from "./table/console-table.ts";
import type { ClosedEntry, OpenResult, UnknownEntry } from "./types/index.ts";

export const main = async (): Promise<void> => {
  await initI18n(process.env.LOCALE || "en");
  const token = process.env.GITHUB_TOKEN;
  if (!token) console.log("Tip: set GITHUB_TOKEN to avoid rate limiting\n");

  const outputPath = getFlagValue("--output", DEFAULT_OUTPUT);
  const explicitZhOutputPath = getFlagValue("--zh-output", DEFAULT_ZH_OUTPUT);
  const zhOutputPath = explicitZhOutputPath ?? (outputPath ? DEFAULT_ZH_OUTPUT : null);
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
    closed.map(({ agent, vendor, sources }) => [agent, vendor, formatConsoleSources(sources)]),
    [20, 25, 28],
  );

  if (unknown.length > 0) {
    console.log("\n## Unknown / No Repo Found\n");
    console.log(unknown.map(({ agent, sources }) => `${agent} (${formatConsoleSources(sources)})`).join(", "));
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
};
