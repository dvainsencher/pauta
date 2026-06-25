import fs from "node:fs";
import { buildPlan } from "../../reader/plan.js";
import { renderRoadmapMarkdown } from "../../reader/render.js";
import { roadmapMarkdownPath } from "../../storage/paths.js";

export function generateRoadmapMarkdown(cwd: string): void {
  const plan = buildPlan(cwd, { done: true });
  fs.writeFileSync(roadmapMarkdownPath(cwd), renderRoadmapMarkdown(plan));
}

export function roadmap(cwd: string): string {
  generateRoadmapMarkdown(cwd);
  return "Wrote ROADMAP.md";
}
