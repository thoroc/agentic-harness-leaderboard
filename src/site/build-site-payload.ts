import type { OpenResult, ClosedEntry, UnknownEntry, SiteAgent, SitePayload } from "../types/index.ts";
import { projectId } from "./project-id.ts";
import { generatedDate } from "../format/generated-date.ts";
import { generatedDateTime } from "../format/generated-date-time.ts";

export const buildSitePayload = (open: OpenResult[], closed: ClosedEntry[], unknown: UnknownEntry[], now: Date): SitePayload => {
  const agents: SiteAgent[] = [
    ...open.map((o) => ({
      id: projectId(o.agent),
      name: o.agent,
      kind: "open",
      repo: o.repo,
      vendor: null,
      url: `https://github.com/${o.repo}`,
      stars: o.stats.stars,
      forks: o.stats.forks,
      openIssues: o.stats.openIssues,
      pushedAt: o.stats.pushedAt,
      updatedAt: o.stats.updatedAt,
      sources: o.sources,
      sourceLabels: o.sources,
    })),
    ...closed.map((c) => ({
      id: projectId(c.agent),
      name: c.agent,
      kind: "closed",
      repo: null,
      vendor: c.vendor,
      url: null,
      stars: null,
      forks: null,
      openIssues: null,
      pushedAt: null,
      updatedAt: null,
      sources: c.sources,
      sourceLabels: c.sources,
    })),
    ...unknown.map((u) => ({
      id: projectId(u.agent),
      name: u.agent,
      kind: "unknown",
      repo: null,
      vendor: null,
      url: null,
      stars: null,
      forks: null,
      openIssues: null,
      pushedAt: null,
      updatedAt: null,
      sources: u.sources,
      sourceLabels: u.sources,
    })),
  ];

  const repoAgents = agents.filter((a) => a.repo);
  const totalStars = repoAgents.reduce((sum, a) => sum + (a.stars ?? 0), 0);
  const totalForks = repoAgents.reduce((sum, a) => sum + (a.forks ?? 0), 0);

  return {
    generatedAt: now.toISOString(),
    generatedDate: generatedDate(now),
    generatedDateTime: generatedDateTime(now),
    timezone: process.env.TZ || "Asia/Shanghai",
    totals: {
      agents: agents.length,
      repos: repoAgents.length,
      stars: totalStars,
      forks: totalForks,
      openAgents: open.length,
      closedAgents: closed.length,
      unknownAgents: unknown.length,
    },
    agents,
  };
};
