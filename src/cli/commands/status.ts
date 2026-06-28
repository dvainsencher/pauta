import { buildPlan } from "../../reader/plan.js";

export function status(cwd: string): string {
  const plan = buildPlan(cwd, { done: true });
  // plan.sprints is sorted active-first then by position, so the first active group
  // is the lowest-position active sprint — the "current" one when several are active.
  const active = plan.sprints.find((sprint) => sprint.active);
  if (!active) {
    return "no active sprint";
  }

  const done = active.issues.filter((issue) => issue.status === "done").length;
  const base = `${active.name} ${done}/${active.issues.length}`;

  // An active sprint always has a non-done issue (that is what makes it active),
  // so a "current" issue is always found.
  const current =
    active.issues.find((issue) => issue.status === "doing") ??
    active.issues.find((issue) => issue.status !== "done")!;

  return `${base} → #${current.id} ${current.title}`;
}
