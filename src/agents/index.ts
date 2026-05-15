export type AgentSource = "Vercel Skills" | "ClawCharts" | "Manual";

export type AgentEntryBase = {
  sources?: AgentSource[];
};

export type AgentEntry =
  & AgentEntryBase
  & (
    | { kind: "open"; repo: string }
    | { kind: "closed"; vendor: string }
    | { kind: "unknown" }
  );

import _AGENTS from "./agents.json" with { type: "json" };
export const AGENTS = _AGENTS as Record<string, AgentEntry>;
