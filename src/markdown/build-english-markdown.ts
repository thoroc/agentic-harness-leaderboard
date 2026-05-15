import type { ClosedEntry, OpenResult, UnknownEntry } from "../types/index.ts";
import { buildMarkdown } from "./build-markdown.ts";

export const buildEnglishMarkdown = (open: OpenResult[], closed: ClosedEntry[], unknown: UnknownEntry[]): string => {
  return buildMarkdown(open, closed, unknown, "en");
};
