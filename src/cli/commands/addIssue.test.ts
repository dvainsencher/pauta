import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readIssues } from "../../storage/issuesStore.js";
import { addIssue } from "./addIssue.js";
import { createSprint } from "./createSprint.js";
import { init } from "./init.js";

describe("addIssue", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "pauta-test-"));
    init(cwd);
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("adds an issue with default status idea and empty sprint, returns its id", () => {
    const id = addIssue(cwd, "Dark mode");
    expect(id).toBe(1);
    const [issue] = readIssues(cwd);
    expect(issue).toMatchObject({ id: 1, title: "Dark mode", status: "idea", sprint: "" });
  });

  it("accepts an explicit status", () => {
    addIssue(cwd, "Dark mode", { status: "ready" });
    expect(readIssues(cwd)[0].status).toBe("ready");
  });

  it("accepts a sprint that exists", () => {
    createSprint(cwd, "foundation", { goal: "g" });
    addIssue(cwd, "Dark mode", { sprint: "foundation" });
    expect(readIssues(cwd)[0].sprint).toBe("foundation");
  });

  it("rejects a sprint that does not exist", () => {
    expect(() => addIssue(cwd, "Dark mode", { sprint: "missing" })).toThrow(/missing/);
  });

  it("rejects an invalid status", () => {
    expect(() => addIssue(cwd, "Dark mode", { status: "bogus" })).toThrow(/bogus/);
  });

  it("allocates increasing ids", () => {
    addIssue(cwd, "first");
    const second = addIssue(cwd, "second");
    expect(second).toBe(2);
  });
});
