import { generatedDate } from "../format/generated-date.ts";
import { nullableNumber } from "../format/nullable-number.ts";
import { shortDate } from "../format/short-date.ts";
import { formatSources } from "../source/format-sources.ts";
import { mdTable } from "../table/md-table.ts";
import type { ClosedEntry, OpenResult, UnknownEntry } from "../types/index.ts";

export const buildEnglishMarkdown = (open: OpenResult[], closed: ClosedEntry[], unknown: UnknownEntry[]): string => {
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
      closed.map(({ agent, vendor, sources }) => [agent, vendor, formatSources(sources, "en")]),
    ),
  ];

  if (unknown.length > 0) {
    lines.push(
      "",
      "## Unknown / No Repo Found",
      "",
      mdTable(
        ["Agent", "Source"],
        unknown.map(({ agent, sources }) => [agent, formatSources(sources, "en")]),
      ),
    );
  }

  return `${lines.join("\n")}\n`;
};
