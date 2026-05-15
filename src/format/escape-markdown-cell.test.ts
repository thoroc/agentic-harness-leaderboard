import { expect, test } from "bun:test";
import { escapeMarkdownCell } from "./escape-markdown-cell";

test("escapeMarkdownCell handles empty string", () => {
  expect(escapeMarkdownCell("")).toBe("");
});

test("escapeMarkdownCell passes through plain text", () => {
  expect(escapeMarkdownCell("hello world")).toBe("hello world");
});

test("escapeMarkdownCell escapes backslash", () => {
  expect(escapeMarkdownCell("a\\b")).toBe("a\\\\b");
});

test("escapeMarkdownCell escapes pipe", () => {
  expect(escapeMarkdownCell("a|b")).toBe("a\\|b");
});

test("escapeMarkdownCell replaces newlines with spaces", () => {
  expect(escapeMarkdownCell("a\nb")).toBe("a b");
});

test("escapeMarkdownCell handles all special chars in order", () => {
  expect(escapeMarkdownCell("a\\|b\nc")).toBe("a\\\\\\|b c");
});

test("escapeMarkdownCell only replaces newline not carriage return", () => {
  expect(escapeMarkdownCell("a\r\nb")).toBe("a\r b");
});
