import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readIssues } from "../storage/issuesStore.js";
import { addIssue } from "../cli/commands/addIssue.js";
import { createSprint } from "../cli/commands/createSprint.js";
import { init } from "../cli/commands/init.js";
import { move } from "../cli/commands/move.js";
import { backlogIssues } from "./backlog.js";

describe("backlogIssues", () => {
  it("returns only issues with an empty sprint", () => {
    const issues = [
      { id: 1, title: "a", status: "idea" as const, sprint: "", createdAt: "", updatedAt: "" },
      {
        id: 2,
        title: "b",
        status: "idea" as const,
        sprint: "foundation",
        createdAt: "",
        updatedAt: "",
      },
    ];
    expect(backlogIssues(issues)).toEqual([issues[0]]);
  });

  describe("integration with add/move", () => {
    let cwd: string;

    beforeEach(() => {
      cwd = fs.mkdtempSync(path.join(os.tmpdir(), "pauta-test-"));
      init(cwd);
      createSprint(cwd, "foundation", { goal: "g" });
    });

    afterEach(() => {
      fs.rmSync(cwd, { recursive: true, force: true });
    });

    it("includes a freshly added issue with no sprint", () => {
      addIssue(cwd, "Dark mode");
      expect(backlogIssues(readIssues(cwd))).toHaveLength(1);
    });

    it("excludes an issue once moved into a sprint", () => {
      const id = addIssue(cwd, "Dark mode");
      move(cwd, id, "foundation");
      expect(backlogIssues(readIssues(cwd))).toHaveLength(0);
    });
  });
});
