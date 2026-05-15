import type { RepoStats } from "../types/index";

export const fetchRepoStats = async (repo: string, token?: string): Promise<RepoStats> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "agent-stars-script",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

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
};
