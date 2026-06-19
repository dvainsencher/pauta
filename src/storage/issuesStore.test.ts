import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Issue } from "../domain/types.js";
import { issuesFilePath, roadmapDir } from "./paths.js";
import { readIssues, writeIssues } from "./issuesStore.js";

describe("issuesStore", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "pauta-test-"));
    fs.mkdirSync(roadmapDir(cwd), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  const sample: Issue = {
    id: 1,
    title: "First issue",
    status: "idea",
    sprint: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("reads an empty/missing file as an empty array", () => {
    expect(readIssues(cwd)).toEqual([]);
  });

  it("round-trips issues through write then read", () => {
    writeIssues(cwd, [sample]);
    expect(readIssues(cwd)).toEqual([sample]);
  });

  it("round-trips multiple issues, one per line", () => {
    const second: Issue = { ...sample, id: 2, title: "Second issue" };
    writeIssues(cwd, [sample, second]);
    const raw = fs.readFileSync(issuesFilePath(cwd), "utf8");
    expect(raw.split("\n").filter(Boolean)).toHaveLength(2);
    expect(readIssues(cwd)).toEqual([sample, second]);
  });

  it("ends the file with a trailing newline", () => {
    writeIssues(cwd, [sample]);
    const raw = fs.readFileSync(issuesFilePath(cwd), "utf8");
    expect(raw.endsWith("\n")).toBe(true);
  });

  it("throws a useful error on a malformed line", () => {
    fs.writeFileSync(issuesFilePath(cwd), "not json\n");
    expect(() => readIssues(cwd)).toThrow(/line 1/);
  });

  it("tolerates trailing blank lines", () => {
    fs.writeFileSync(issuesFilePath(cwd), `${JSON.stringify(sample)}\n\n`);
    expect(readIssues(cwd)).toEqual([sample]);
  });
});
