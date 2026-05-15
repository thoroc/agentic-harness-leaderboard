import { expect, test } from "bun:test";
import { AGENTS } from "./index.ts";

test("AGENTS is a non-empty record", () => {
  const entries = Object.entries(AGENTS);
  expect(entries.length).toBeGreaterThan(0);
});

test("AGENTS entries have valid kinds", () => {
  for (const [name, entry] of Object.entries(AGENTS)) {
    expect(["open", "closed", "unknown"]).toContain(entry.kind);
    expect(name).toBeString();
    if (entry.kind === "open") {
      expect(entry.repo).toBeString();
    }
    if (entry.kind === "closed") {
      expect(entry.vendor).toBeString();
    }
  }
});
