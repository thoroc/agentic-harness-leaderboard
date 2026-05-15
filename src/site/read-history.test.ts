import { test, expect } from "bun:test";
import { readHistory } from "./read-history";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

test("readHistory returns default for non-existent file", async () => {
  const result = await readHistory("/tmp/nonexistent-file-12345.json");
  expect(result.updatedAt).toBe(new Date(0).toISOString());
  expect(result.snapshots).toEqual([]);
});

test("readHistory parses valid JSON file", async () => {
  const dir = mkdtempSync(join(tmpdir(), "read-history-test-"));
  const path = join(dir, "history.json");
  writeFileSync(path, JSON.stringify({
    updatedAt: "2024-03-15T12:00:00.000Z",
    snapshots: [{ date: "2024-03-15", generatedAt: "2024-03-15T12:00:00.000Z", agents: [] }],
  }));

  const result = await readHistory(path);
  expect(result.updatedAt).toBe("2024-03-15T12:00:00.000Z");
  expect(result.snapshots).toHaveLength(1);
  expect(result.snapshots[0]?.date).toBe("2024-03-15");
});

test("readHistory returns default for malformed JSON", async () => {
  const dir = mkdtempSync(join(tmpdir(), "read-history-test-"));
  const path = join(dir, "bad.json");
  writeFileSync(path, "not json");

  const result = await readHistory(path);
  expect(result.updatedAt).toBe(new Date(0).toISOString());
  expect(result.snapshots).toEqual([]);
});

test("readHistory handles missing updatedAt field", async () => {
  const dir = mkdtempSync(join(tmpdir(), "read-history-test-"));
  const path = join(dir, "missing.json");
  writeFileSync(path, JSON.stringify({ snapshots: [] }));

  const result = await readHistory(path);
  expect(result.updatedAt).toBe(new Date(0).toISOString());
  expect(result.snapshots).toEqual([]);
});

test("readHistory handles non-array snapshots", async () => {
  const dir = mkdtempSync(join(tmpdir(), "read-history-test-"));
  const path = join(dir, "bad-snapshots.json");
  writeFileSync(path, JSON.stringify({ updatedAt: "2024-03-15T12:00:00.000Z", snapshots: "invalid" }));

  const result = await readHistory(path);
  expect(result.snapshots).toEqual([]);
});
