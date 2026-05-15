import type { AgentEntry, AgentSource } from "./index.ts";

export const sourcesFor = (entry: AgentEntry): AgentSource[] => {
  return entry.sources ?? ["Vercel Skills"];
};
