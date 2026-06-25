import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { roadmapMarkdownPath } from "../../storage/paths.js";
import { init } from "./init.js";
import { addIssue } from "./addIssue.js";
import { generateRoadmapMarkdown, roadmap } from "./roadmap.js";

describe("generateRoadmapMarkdown", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "scrummy-test-"));
    init(cwd);
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("writes ROADMAP.md at the project root", () => {
    addIssue(cwd, "Dark mode", {});
    generateRoadmapMarkdown(cwd);
    const content = fs.readFileSync(roadmapMarkdownPath(cwd), "utf8");
    expect(content).toContain("# Roadmap");
    expect(content).toContain("Dark mode");
  });

  it("overwrites a previously generated ROADMAP.md", () => {
    addIssue(cwd, "Dark mode", {});
    generateRoadmapMarkdown(cwd);
    addIssue(cwd, "Light mode", {});
    generateRoadmapMarkdown(cwd);
    const content = fs.readFileSync(roadmapMarkdownPath(cwd), "utf8");
    expect(content).toContain("Dark mode");
    expect(content).toContain("Light mode");
  });
});

describe("roadmap command", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "scrummy-test-"));
    init(cwd);
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("returns a confirmation message naming the written file", () => {
    expect(roadmap(cwd)).toContain("ROADMAP.md");
    expect(fs.existsSync(roadmapMarkdownPath(cwd))).toBe(true);
  });
});
