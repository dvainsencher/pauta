import { buildPlan, getIssue } from "../../reader/plan.js";
import { renderJson, renderPretty } from "../../reader/render.js";

export interface ShowOptions {
  id?: number;
  sprint?: string;
  done?: boolean;
  json?: boolean;
}

export function show(cwd: string, options: ShowOptions): string {
  if (options.id !== undefined) {
    const issue = getIssue(cwd, options.id);
    if (options.json) {
      return JSON.stringify(issue, null, 2);
    }
    const specTag = issue.hasSpec ? "  [spec]" : "";
    const logTag = issue.hasLog ? "  [log]" : "";
    const location = issue.sprint ? `sprint: ${issue.sprint}` : "backlog";
    return `  #${issue.id}  ${issue.status.padEnd(5)} ${issue.title}${specTag}${logTag}\n  ${location}`;
  }
  const plan = buildPlan(cwd, { sprint: options.sprint, done: options.done });
  return options.json ? renderJson(plan) : renderPretty(plan);
}
