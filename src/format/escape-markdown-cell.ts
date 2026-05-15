export const escapeMarkdownCell = (cell: string): string => {
  return cell.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n/g, " ");
};
