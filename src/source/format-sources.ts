import type { AgentSource } from "../agents";
import { SOURCE_INFO } from "../constants";
import { i18next } from "../i18n";

export const formatSources = (sources: AgentSource[], language: string): string => {
  const t = i18next.getFixedT(language);
  return sources
    .map((source) => {
      const info = SOURCE_INFO[source];
      const label = t(info.translationKey);
      return info.url ? `[${label}](${info.url})` : label;
    })
    .join(", ");
};
