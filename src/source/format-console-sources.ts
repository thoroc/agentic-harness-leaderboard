import type { AgentSource } from "../agents/index";

export const formatConsoleSources = (sources: AgentSource[]): string => {
  return sources.join(", ");
};
