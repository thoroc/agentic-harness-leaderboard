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
  translations: Record<string, Record<string, string>>;
}

export interface HistorySnapshotAgent {
  id: string;
  name: string;
  repo: string | null;
  kind: string;
  stars: number | null;
  forks: number | null;
}

export interface HistorySnapshot {
  date: string;
  generatedAt: string;
  agents: HistorySnapshotAgent[];
}

export interface HistoryPayload {
  updatedAt: string;
  snapshots: HistorySnapshot[];
}
