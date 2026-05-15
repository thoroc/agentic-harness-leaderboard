import { generatedDate } from "../format/generated-date";
import { nullableNumber } from "../format/nullable-number";
import { shortDate } from "../format/short-date";
import { i18next } from "../i18n";
import { formatSources } from "../source/format-sources";
import { mdTable } from "../table/md-table";
import type { ClosedEntry, OpenResult, UnknownEntry } from "../types";

export const buildMarkdown = (open: OpenResult[], closed: ClosedEntry[], unknown: UnknownEntry[], language: string): string => {
  const t = i18next.getFixedT(language);
  const date = generatedDate();
  const lines: string[] = [
    `# ${t("markdown.title")}`,
    "",
    t("markdown.generatedOn", { date }),
    "",
    `## ${t("markdown.sectionOpen")}`,
    "",
    mdTable(
      t("markdown.tableOpen", { returnObjects: true }) as string[],
      open.map(({ agent, repo, stats, sources }, i) => [
        String(i + 1),
        agent,
        nullableNumber(stats.stars),
        nullableNumber(stats.forks),
        shortDate(stats.pushedAt),
        `[${repo}](https://github.com/${repo})`,
        formatSources(sources, language),
      ]),
    ),
    "",
    `## ${t("markdown.sectionClosed")}`,
    "",
    mdTable(
      t("markdown.tableClosed", { returnObjects: true }) as string[],
      closed.map(({ agent, vendor, sources }) => [agent, vendor, formatSources(sources, language)]),
    ),
  ];

  if (unknown.length > 0) {
    lines.push(
      "",
      `## ${t("markdown.sectionUnknown")}`,
      "",
      mdTable(
        t("markdown.tableUnknown", { returnObjects: true }) as string[],
        unknown.map(({ agent, sources }) => [agent, formatSources(sources, language)]),
      ),
    );
  }

  return `${lines.join("\n")}\n`;
};
