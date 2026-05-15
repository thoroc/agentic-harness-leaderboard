import { expect, test } from "bun:test";
import { mdTable } from "./md-table.ts";

test("mdTable generates table with headers and rows", () => {
  const result = mdTable(
    ["Name", "Stars"],
    [
      ["Foo", "100"],
      ["Bar", "200"],
    ],
  );
  expect(result).toBe("| Name | Stars |\n| --- | --- |\n| Foo | 100 |\n| Bar | 200 |");
});

test("mdTable escapes special characters", () => {
  const result = mdTable(["Name"], [["a|b"]]);
  expect(result).toBe("| Name |\n| --- |\n| a\\|b |");
});

test("mdTable handles empty rows", () => {
  const result = mdTable(["Name"], []);
  expect(result).toBe("| Name |\n| --- |\n");
});

test("mdTable handles empty headers", () => {
  const result = mdTable([], [["a"]]);
  expect(result).toBe("|  |\n|  |\n| a |");
});
