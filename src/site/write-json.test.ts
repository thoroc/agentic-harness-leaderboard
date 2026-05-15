import { test, expect } from "bun:test";
import { writeJson } from "./write-json.ts";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

test("writeJson creates file with JSON content", async () => {
  const dir = mkdtempSync(join(tmpdir(), "write-json-test-"));
  const path = join(dir, "output.json");

  await writeJson(path, { hello: "world", num: 42 });

  expect(existsSync(path)).toBe(true);
  const content = readFileSync(path, "utf-8");
  expect(content).toBe('{\n  "hello": "world",\n  "num": 42\n}\n');
  rmSync(dir, { recursive: true });
});

test("writeJson creates parent directory if needed", async () => {
  const dir = mkdtempSync(join(tmpdir(), "write-json-test-"));
  const path = join(dir, "sub", "nested", "output.json");

  await writeJson(path, { test: true });

  expect(existsSync(path)).toBe(true);
  const content = readFileSync(path, "utf-8");
  expect(content).toBe('{\n  "test": true\n}\n');
  rmSync(dir, { recursive: true });
});

test("writeJson overwrites existing file", async () => {
  const dir = mkdtempSync(join(tmpdir(), "write-json-test-"));
  const path = join(dir, "output.json");
  await writeJson(path, { first: true });
  await writeJson(path, { second: true });

  const content = readFileSync(path, "utf-8");
  expect(content).toBe('{\n  "second": true\n}\n');
  rmSync(dir, { recursive: true });
});
