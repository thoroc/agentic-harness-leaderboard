const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export const nullableNumber = (value: number | null | undefined): string => {
  return typeof value === "number" ? NUMBER_FORMAT.format(value) : "N/A";
};
