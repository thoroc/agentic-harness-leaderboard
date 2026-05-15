import type { OpenResult, ClosedEntry, UnknownEntry } from "../types/index.ts";
import { generatedDate } from "../format/generated-date.ts";
import { mdTable } from "../table/md-table.ts";
import { nullableNumber } from "../format/nullable-number.ts";
import { shortDate } from "../format/short-date.ts";
import { formatSources } from "../source/format-sources.ts";

export const buildChineseMarkdown = (open: OpenResult[], closed: ClosedEntry[], unknown: UnknownEntry[]): string => {
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
      closed.map(({ agent, vendor, sources }) => [agent, vendor, formatSources(sources, "zh")]),
    ),
  ];

  if (unknown.length > 0) {
    lines.push(
      "",
      "## 未知 / 未找到仓库",
      "",
      mdTable(
        ["Agent", "来源"],
        unknown.map(({ agent, sources }) => [agent, formatSources(sources, "zh")]),
      ),
    );
  }

  return lines.join("\n") + "\n";
};
