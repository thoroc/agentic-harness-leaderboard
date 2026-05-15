export const shortDate = (value: string | null | undefined): string => {
  return value ? value.slice(0, 10) : "N/A";
};
