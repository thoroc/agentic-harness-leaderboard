import type { AgentSource } from "../agents/index.ts";

export interface RepoStats {
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  pushedAt: string | null;
  updatedAt: string | null;
  description: string | null;
  htmlUrl: string | null;
  error?: string;
}

export interface OpenResult {
  agent: string;
  repo: string;
  stats: RepoStats;
  sources: AgentSource[];
}

export interface ClosedEntry {
  agent: string;
  vendor: string;
  sources: AgentSource[];
}

export interface UnknownEntry {
  agent: string;
  sources: AgentSource[];
}

export interface SiteAgent {
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
}

export interface SitePayload {
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
}

export interface HistorySnapshot {
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
}

export interface HistoryPayload {
  updatedAt: string;
  snapshots: HistorySnapshot[];
}
