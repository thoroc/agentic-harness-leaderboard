import { expect, test } from "bun:test";
import { consoleTable } from "./console-table";

test("consoleTable logs formatted table", () => {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: string[]) => {
    logs.push(args.join(" "));
  };

  try {
    consoleTable(["Name", "Age"], [["Alice", "30"]], [10, 5]);

    expect(logs.length).toBe(3);
    expect(logs[0]).toBe("Name       | Age  ");
    expect(logs[1]).toBe("-----------+------");
    expect(logs[2]).toBe("Alice      | 30   ");
  } finally {
    console.log = originalLog;
  }
});
