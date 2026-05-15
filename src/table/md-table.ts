import { escapeMarkdownCell } from "../format/escape-markdown-cell.ts";

export const mdTable = (headers: string[], rows: string[][]): string => {
  const header = `| ${headers.map(escapeMarkdownCell).join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(escapeMarkdownCell).join(" | ")} |`).join("\n");
  return [header, sep, body].join("\n");
};
