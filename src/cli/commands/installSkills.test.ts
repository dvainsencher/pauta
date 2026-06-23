import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { skillsSourceDir } from "../../packageRoot.js";
import { installSkills } from "./installSkills.js";

describe("installSkills", () => {
  let cwd: string;
  let sourceDir: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "scrummy-test-cwd-"));
    sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), "scrummy-test-skills-"));
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
    fs.rmSync(sourceDir, { recursive: true, force: true });
  });

  function writeSkill(name: string, content: string): void {
    const dir = path.join(sourceDir, name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "SKILL.md"), content);
  }

  it("copies a skill directory into .claude/skills/<name>", () => {
    writeSkill("scrummy-add-issue", "# add issue\n");
    installSkills(cwd, sourceDir);
    const installed = fs.readFileSync(
      path.join(cwd, ".claude", "skills", "scrummy-add-issue", "SKILL.md"),
      "utf8",
    );
    expect(installed).toBe("# add issue\n");
  });

  it("copies every skill subdirectory", () => {
    writeSkill("scrummy-add-issue", "# a\n");
    writeSkill("scrummy-reorganize", "# b\n");
    installSkills(cwd, sourceDir);
    expect(fs.readdirSync(path.join(cwd, ".claude", "skills")).sort()).toEqual([
      "scrummy-add-issue",
      "scrummy-reorganize",
    ]);
  });

  it("returns the names of the skills installed", () => {
    writeSkill("scrummy-add-issue", "# a\n");
    writeSkill("scrummy-reorganize", "# b\n");
    expect(installSkills(cwd, sourceDir).sort()).toEqual(["scrummy-add-issue", "scrummy-reorganize"]);
  });

  it("overwrites stale content from a previous install", () => {
    writeSkill("scrummy-add-issue", "# old\n");
    installSkills(cwd, sourceDir);
    fs.writeFileSync(path.join(sourceDir, "scrummy-add-issue", "SKILL.md"), "# new\n");
    installSkills(cwd, sourceDir);
    const installed = fs.readFileSync(
      path.join(cwd, ".claude", "skills", "scrummy-add-issue", "SKILL.md"),
      "utf8",
    );
    expect(installed).toBe("# new\n");
  });

  it("creates .claude/skills even if .claude doesn't exist yet", () => {
    writeSkill("scrummy-add-issue", "# a\n");
    installSkills(cwd, sourceDir);
    expect(fs.statSync(path.join(cwd, ".claude", "skills")).isDirectory()).toBe(true);
  });

  it("throws a friendly error when the source skills directory is missing", () => {
    const missingDir = path.join(sourceDir, "does-not-exist");
    expect(() => installSkills(cwd, missingDir)).toThrow(
      `Skills source directory "${missingDir}" does not exist`,
    );
  });
});

describe("skill source files", () => {
  it("every SKILL.md uses npx scrummy <cmd>, not bare scrummy <cmd>", () => {
    const src = skillsSourceDir();
    const skillDirs = fs.readdirSync(src);
    const violations: string[] = [];
    for (const dir of skillDirs) {
      const skillFile = path.join(src, dir, "SKILL.md");
      if (!fs.existsSync(skillFile)) continue;
      const content = fs.readFileSync(skillFile, "utf8");
      // Two bad patterns:
      // 1. `scrummy <cmd>` — has scrummy prefix but missing npx
      // 2. `<known-subcommand> <args>` — subcommand invocation (with args) missing scrummy prefix entirely
      // Prose references like "the `add-issue` command" (subcommand + closing backtick) are fine.
      const SUBCOMMANDS =
        "show|add-issue|edit-issue|remove-issue|create-sprint|edit-sprint|remove-sprint|move|set-status|set-sprint-status|set-active|set-position|spec|log-issue|show-log|import|init|install-skills";
      const bareWithPauta = content.match(/`scrummy [a-z]/g) ?? [];
      // Only flag when followed by space+args (not closing backtick — that's just a name reference)
      const bareSubcommand = content.match(new RegExp(`\`(?:${SUBCOMMANDS}) `, "g")) ?? [];
      const bareInvocations = [...bareWithPauta, ...bareSubcommand];
      if (bareInvocations.length > 0) {
        violations.push(`${dir}/SKILL.md: ${bareInvocations.join(", ")}`);
      }
    }
    expect(violations).toEqual([]);
  });
});
