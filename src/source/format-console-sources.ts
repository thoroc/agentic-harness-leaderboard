import type { AgentSource } from "../agents/index.ts";

export const formatConsoleSources = (sources: AgentSource[]): string => {
  return sources.join(", ");
};
