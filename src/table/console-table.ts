export const consoleTable = (headers: string[], rows: string[][], widths: number[]): void => {
  const sep = widths.map((w) => "-".repeat(w)).join("-+-");
  console.log(headers.map((h, i) => h.padEnd(widths[i]!)).join(" | "));
  console.log(sep);
  for (const row of rows) {
    console.log(row.map((cell, i) => cell.padEnd(widths[i]!)).join(" | "));
  }
};
