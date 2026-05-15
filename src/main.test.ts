import { beforeEach, expect, mock, test } from "bun:test";

const originalArgv = process.argv;
const originalEnv = process.env;
const originalFetch = globalThis.fetch;
const originalLog = console.log;

beforeEach(() => {
  process.argv = originalArgv;
  process.env = { ...originalEnv };
  globalThis.fetch = originalFetch;
  console.log = originalLog;
});

test("main handles empty argvs (no output flags)", async () => {
  mock.module("./agents/index.ts", () => ({
    AGENTS: {
      OpenAgent: { kind: "open", repo: "test/repo" },
      ClosedAgent: { kind: "closed", vendor: "TestVendor" },
      UnknownAgent: { kind: "unknown" },
    },
  }));

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        stargazers_count: 500,
        forks_count: 25,
        open_issues_count: 10,
        pushed_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-10T00:00:00Z",
        description: "A test repo",
        html_url: "https://github.com/test/repo",
      }),
      { status: 200 },
    ) as Response;

  process.argv = ["bun", "main.ts"];
  process.env.GITHUB_TOKEN = "test-token";

  const logs: string[] = [];
  console.log = (...args: string[]) => {
    logs.push(args.join(" "));
  };

  const { main } = await import("./main.ts");
  await main();

  expect(logs.some((l) => l.includes("OpenAgent"))).toBe(true);
  expect(logs.some((l) => l.includes("ClosedAgent"))).toBe(true);
  expect(logs.some((l) => l.includes("UnknownAgent"))).toBe(true);
});

test("main reclassifies failed fetch as unknown", async () => {
  mock.module("./agents/index.ts", () => ({
    AGENTS: {
      MissingAgent: { kind: "open", repo: "missing/repo" },
    },
  }));

  globalThis.fetch = async () => new Response("Not Found", { status: 404 }) as Response;

  process.argv = ["bun", "main.ts"];

  const logs: string[] = [];
  console.log = (...args: string[]) => {
    logs.push(args.join(" "));
  };

  const { main } = await import("./main.ts");
  await main();

  expect(logs.some((l) => l.includes("No Repo Found"))).toBe(true);
  expect(logs.some((l) => l.includes("MissingAgent"))).toBe(true);
});

test("main writes output files when flags provided", async () => {
  mock.module("./agents/index.ts", () => ({
    AGENTS: {
      TestAgent: { kind: "open", repo: "test/repo" },
    },
  }));

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        stargazers_count: 100,
        forks_count: 10,
        open_issues_count: 5,
        pushed_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-10T00:00:00Z",
        description: null,
        html_url: "https://github.com/test/repo",
      }),
      { status: 200 },
    ) as Response;

  process.argv = [
    "bun",
    "main.ts",
    "--output",
    "/tmp/test-agent-stars.md",
    "--zh-output",
    "/tmp/test-zh-stars.md",
    "--json-output",
    "/tmp/test-latest.json",
    "--history-output",
    "/tmp/test-history.json",
    "--snapshot-dir",
    "/tmp/test-snapshots",
  ];
  process.env.GITHUB_TOKEN = "test-token";

  const logs: string[] = [];
  console.log = (...args: string[]) => {
    logs.push(args.join(" "));
  };

  const { main } = await import("./main.ts");
  await main();

  expect(logs.some((l) => l.includes("Markdown written"))).toBe(true);
  expect(logs.some((l) => l.includes("Site data written"))).toBe(true);
  expect(logs.some((l) => l.includes("History written"))).toBe(true);
});
