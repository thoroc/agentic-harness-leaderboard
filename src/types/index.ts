import { z } from "zod";

export const AgentSourceSchema = z.enum(["Vercel Skills", "ClawCharts", "Manual"]);
export type AgentSource = z.infer<typeof AgentSourceSchema>;

export const RepoStatsSchema = z.object({
  stars: z.number().nullable(),
  forks: z.number().nullable(),
  openIssues: z.number().nullable(),
  pushedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  description: z.string().nullable(),
  htmlUrl: z.string().nullable(),
  error: z.string().optional(),
});
export type RepoStats = z.infer<typeof RepoStatsSchema>;

export const OpenResultSchema = z.object({
  agent: z.string(),
  repo: z.string(),
  stats: RepoStatsSchema,
  sources: AgentSourceSchema.array(),
});
export type OpenResult = z.infer<typeof OpenResultSchema>;

export const ClosedEntrySchema = z.object({
  agent: z.string(),
  vendor: z.string(),
  sources: AgentSourceSchema.array(),
});
export type ClosedEntry = z.infer<typeof ClosedEntrySchema>;

export const UnknownEntrySchema = z.object({
  agent: z.string(),
  sources: AgentSourceSchema.array(),
});
export type UnknownEntry = z.infer<typeof UnknownEntrySchema>;

export const SiteAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.string(),
  repo: z.string().nullable(),
  vendor: z.string().nullable(),
  url: z.string().nullable(),
  stars: z.number().nullable(),
  forks: z.number().nullable(),
  openIssues: z.number().nullable(),
  pushedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  sources: z.string().array(),
  sourceLabels: z.string().array(),
});
export type SiteAgent = z.infer<typeof SiteAgentSchema>;

export const SitePayloadSchema = z.object({
  generatedAt: z.string(),
  generatedDate: z.string(),
  generatedDateTime: z.string(),
  timezone: z.string(),
  totals: z.object({
    agents: z.number(),
    repos: z.number(),
    stars: z.number(),
    forks: z.number(),
    openAgents: z.number(),
    closedAgents: z.number(),
    unknownAgents: z.number(),
  }),
  agents: SiteAgentSchema.array(),
  translations: z.record(z.string(), z.record(z.string(), z.string())),
});
export type SitePayload = z.infer<typeof SitePayloadSchema>;

export const HistorySnapshotAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  repo: z.string().nullable(),
  kind: z.string(),
  stars: z.number().nullable(),
  forks: z.number().nullable(),
});

export const HistorySnapshotSchema = z.object({
  date: z.string(),
  generatedAt: z.string(),
  agents: HistorySnapshotAgentSchema.array(),
});
export type HistorySnapshot = z.infer<typeof HistorySnapshotSchema>;

export const HistoryPayloadSchema = z.object({
  updatedAt: z.string(),
  snapshots: HistorySnapshotSchema.array(),
});
export type HistoryPayload = z.infer<typeof HistoryPayloadSchema>;

export const AgentEntrySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("open"), repo: z.string(), sources: AgentSourceSchema.array().optional() }),
  z.object({ kind: z.literal("closed"), vendor: z.string(), sources: AgentSourceSchema.array().optional() }),
  z.object({ kind: z.literal("unknown"), sources: AgentSourceSchema.array().optional() }),
]);
export type AgentEntry = z.infer<typeof AgentEntrySchema>;
