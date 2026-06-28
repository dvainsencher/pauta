import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addIssue } from "./addIssue.js";
import { createSprint } from "./createSprint.js";
import { init } from "./init.js";
import { setStatus } from "./setStatus.js";
import { status } from "./status.js";

describe("status", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "scrummy-test-"));
    init(cwd);
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("reports no active sprint when no sprint has started work", () => {
    createSprint(cwd, "foundation", { goal: "g" });
    addIssue(cwd, "Wire up CLI", { sprint: "foundation" }); // idea-only → planned
    expect(status(cwd)).toBe("no active sprint");
  });

  it("reports no active sprint when a sprint is fully done", () => {
    createSprint(cwd, "foundation", { goal: "g" });
    const id = addIssue(cwd, "Wire up CLI", { sprint: "foundation" });
    setStatus(cwd, id, "done"); // all issues done → done, not active
    expect(status(cwd)).toBe("no active sprint");
  });

  it("shows the active sprint's done/total counts and the issue in progress", () => {
    createSprint(cwd, "foundation", { goal: "g" });
    const first = addIssue(cwd, "Wire up CLI", { sprint: "foundation" });
    addIssue(cwd, "Write docs", { sprint: "foundation" });
    setStatus(cwd, first, "doing"); // work started + work remaining → active

    expect(status(cwd)).toBe(`foundation 0/2 → #${first} Wire up CLI`);
  });

  it("falls back to the next not-done issue when nothing is in progress", () => {
    createSprint(cwd, "foundation", { goal: "g" });
    const first = addIssue(cwd, "Wire up CLI", { sprint: "foundation" });
    const second = addIssue(cwd, "Write docs", { sprint: "foundation" });
    setStatus(cwd, first, "done"); // finished work + a remaining issue → active

    expect(status(cwd)).toBe(`foundation 1/2 → #${second} Write docs`);
  });

  it("picks the lowest-position active sprint when several are active", () => {
    createSprint(cwd, "alpha", { goal: "g", position: 10 });
    createSprint(cwd, "beta", { goal: "g", position: 20 });
    const a = addIssue(cwd, "Alpha work", { sprint: "alpha" });
    const b = addIssue(cwd, "Beta work", { sprint: "beta" });
    setStatus(cwd, a, "doing");
    setStatus(cwd, b, "doing");

    expect(status(cwd)).toBe(`alpha 0/1 → #${a} Alpha work`);
  });
});
