import type { Issue } from "../domain/types.js";

export function backlogIssues(issues: Issue[]): Issue[] {
  return issues.filter((issue) => issue.sprint === "");
}
