import type { AgentEntry, AgentSource } from ".";

export const sourcesFor = (entry: AgentEntry): AgentSource[] => {
  return entry.sources ?? ["Vercel Skills"];
};
