import type { AgentSource } from "../agents/index.ts";

export const SOURCE_URL = "https://github.com/vercel-labs/skills?tab=readme-ov-file#supported-agents";
export const CLAWCHARTS_URL = "https://clawcharts.com/";

export const SOURCE_INFO: Record<AgentSource, { label: string; zhLabel: string; url?: string }> = {
  "Vercel Skills": { label: "Vercel Skills", zhLabel: "Vercel Skills", url: SOURCE_URL },
  ClawCharts: { label: "ClawCharts", zhLabel: "ClawCharts", url: CLAWCHARTS_URL },
  Manual: { label: "Manual", zhLabel: "手工维护" },
};

export const DEFAULT_OUTPUT = "agent-stars.md";
export const DEFAULT_ZH_OUTPUT = "agent-stars.zh-CN.md";
export const DEFAULT_JSON_OUTPUT = "site/data/latest.json";
export const DEFAULT_HISTORY_OUTPUT = "site/data/history.json";
export const DEFAULT_SNAPSHOT_DIR = "site/data/snapshots";
export const HISTORY_LIMIT = 120;
