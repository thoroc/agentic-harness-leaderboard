import type { ClosedEntry, OpenResult, UnknownEntry } from "../types/index";
import { buildMarkdown } from "./build-markdown";

export const buildEnglishMarkdown = (open: OpenResult[], closed: ClosedEntry[], unknown: UnknownEntry[]): string => {
  return buildMarkdown(open, closed, unknown, "en");
};
