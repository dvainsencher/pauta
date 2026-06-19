import type { Issue } from "./types.js";

export function nextId(issues: Issue[]): number {
  const maxId = issues.reduce((max, issue) => Math.max(max, issue.id), 0);
  return maxId + 1;
}
