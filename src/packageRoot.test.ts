import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { packageRoot, skillsSourceDir } from "./packageRoot.js";

describe("packageRoot", () => {
  it("resolves to the directory containing package.json", () => {
    expect(fs.existsSync(path.join(packageRoot(), "package.json"))).toBe(true);
  });
});

describe("skillsSourceDir", () => {
  it("resolves to the package's skills/ directory", () => {
    expect(skillsSourceDir()).toBe(path.join(packageRoot(), "skills"));
  });

  it("points at a directory that actually contains the shipped skills", () => {
    expect(fs.existsSync(path.join(skillsSourceDir(), "pauta-add-item", "SKILL.md"))).toBe(true);
  });
});
