import { beforeEach, expect, test } from "bun:test";
import { fetchRepoStats } from "./fetch-repo-stats";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = originalFetch;
});

test("fetchRepoStats returns stats on success", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        stargazers_count: 100,
        forks_count: 10,
        open_issues_count: 5,
        pushed_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-10T00:00:00Z",
        description: "A test repo",
        html_url: "https://github.com/test/repo",
      }),
      { status: 200 },
    );

  const result = await fetchRepoStats("test/repo");
  expect(result.stars).toBe(100);
  expect(result.forks).toBe(10);
  expect(result.openIssues).toBe(5);
  expect(result.pushedAt).toBe("2024-03-01T00:00:00Z");
  expect(result.updatedAt).toBe("2024-03-10T00:00:00Z");
  expect(result.description).toBe("A test repo");
  expect(result.htmlUrl).toBe("https://github.com/test/repo");
  expect(result.error).toBeUndefined();
});

test("fetchRepoStats handles 404", async () => {
  globalThis.fetch = async () => new Response("Not Found", { status: 404 });

  const result = await fetchRepoStats("test/missing");
  expect(result.stars).toBeNull();
  expect(result.error).toBe("404");
});

test("fetchRepoStats handles non-200 status", async () => {
  globalThis.fetch = async () => new Response("Forbidden", { status: 403 });

  const result = await fetchRepoStats("test/forbidden");
  expect(result.stars).toBeNull();
  expect(result.error).toBe("HTTP 403");
});

test("fetchRepoStats handles network errors", async () => {
  globalThis.fetch = async () => {
    throw new Error("Network failure");
  };

  const result = await fetchRepoStats("test/error");
  expect(result.stars).toBeNull();
  expect(result.error).toBe("Network failure");
});

test("fetchRepoStats includes auth header when token provided", async () => {
  let authHeader: string | undefined;
  globalThis.fetch = async (_url: string, opts: { headers: Record<string, string> }) => {
    authHeader = opts.headers.Authorization;
    return new Response(
      JSON.stringify({
        stargazers_count: 100,
        forks_count: 10,
        open_issues_count: 5,
        pushed_at: null,
        updated_at: null,
        description: null,
        html_url: "",
      }),
      { status: 200 },
    );
  };

  await fetchRepoStats("test/repo", "gh_token_123");
  expect(authHeader).toBe("Bearer gh_token_123");
});
