import type { AgentEntry, AgentSource } from "./index";

export const sourcesFor = (entry: AgentEntry): AgentSource[] => {
  return entry.sources ?? ["Vercel Skills"];
};
