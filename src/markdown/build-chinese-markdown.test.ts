import { beforeAll, beforeEach, expect, test } from "bun:test";
import { initI18n } from "../i18n/index";
import type { ClosedEntry, OpenResult, UnknownEntry } from "../types/index";
import { buildChineseMarkdown } from "./build-chinese-markdown";

beforeAll(async () => {
  await initI18n("zh");
});

beforeEach(() => {
  process.env.TZ = "UTC";
});

const open: OpenResult[] = [
  {
    agent: "Test Agent",
    repo: "test/repo",
    stats: {
      stars: 1000,
      forks: 50,
      openIssues: 5,
      pushedAt: "2024-03-01T00:00:00Z",
      updatedAt: "2024-03-10T00:00:00Z",
      description: "A test repo",
      htmlUrl: "https://github.com/test/repo",
    },
    sources: ["Vercel Skills"],
  },
];

const closed: ClosedEntry[] = [{ agent: "Closed Corp", vendor: "Corp Inc", sources: ["Manual"] }];

test("buildChineseMarkdown includes Chinese headings", () => {
  const result = buildChineseMarkdown(open, closed, []);
  expect(result).toContain("# Agent GitHub 星标排行");
  expect(result).toContain("## 开源 Agent");
  expect(result).toContain("## 闭源 Agent");
  expect(result).toContain("Test Agent");
  expect(result).not.toContain("未知 / 未找到仓库");
});

test("buildChineseMarkdown includes unknown section with Chinese heading", () => {
  const unknown: UnknownEntry[] = [{ agent: "Mystery", sources: ["ClawCharts"] }];
  const result = buildChineseMarkdown(open, closed, unknown);
  expect(result).toContain("## 未知 / 未找到仓库");
  expect(result).toContain("Mystery");
});

test("buildChineseMarkdown ends with newline", () => {
  const result = buildChineseMarkdown(open, closed, []);
  expect(result).toEndWith("\n");
});
