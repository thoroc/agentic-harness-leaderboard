import { beforeEach, expect, test } from "bun:test";
import type { ClosedEntry, OpenResult, UnknownEntry } from "../types/index.ts";
import { buildEnglishMarkdown } from "./build-english-markdown.ts";

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

test("buildEnglishMarkdown includes open and closed sections", () => {
  const result = buildEnglishMarkdown(open, closed, []);
  expect(result).toContain("# Agent GitHub Stars");
  expect(result).toContain("## Open Source Agents");
  expect(result).toContain("## Closed Source Agents");
  expect(result).toContain("Test Agent");
  expect(result).toContain("Closed Corp");
  expect(result).toContain("Corp Inc");
  expect(result).toContain("1,000");
  expect(result).not.toContain("Unknown");
});

test("buildEnglishMarkdown includes unknown section when present", () => {
  const unknown: UnknownEntry[] = [{ agent: "Mystery", sources: ["ClawCharts"] }];
  const result = buildEnglishMarkdown(open, closed, unknown);
  expect(result).toContain("## Unknown / No Repo Found");
  expect(result).toContain("Mystery");
});

test("buildEnglishMarkdown ends with newline", () => {
  const result = buildEnglishMarkdown(open, closed, []);
  expect(result).toEndWith("\n");
});
