import type { SitePayload, HistorySnapshot } from "../types/index.ts";

export const buildSnapshot = (payload: SitePayload): HistorySnapshot => {
  return {
    date: payload.generatedDate,
    generatedAt: payload.generatedAt,
    agents: payload.agents
      .filter((a) => a.kind === "open")
      .map((a) => ({
        id: a.id,
        name: a.name,
        repo: a.repo,
        kind: a.kind,
        stars: a.stars,
        forks: a.forks,
      })),
  };
};
