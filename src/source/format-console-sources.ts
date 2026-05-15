import type { AgentSource } from "../agents";

export const formatConsoleSources = (sources: AgentSource[]): string => {
  return sources.join(", ");
};
