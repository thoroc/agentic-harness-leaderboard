import type { AgentSource } from "../agents/index.ts";
import { SOURCE_INFO } from "../constants/index.ts";

export const formatSources = (sources: AgentSource[], language: "en" | "zh"): string => {
  return sources
    .map((source) => {
      const info = SOURCE_INFO[source];
      const label = language === "zh" ? info.zhLabel : info.label;
      return info.url ? `[${label}](${info.url})` : label;
    })
    .join(", ");
};
