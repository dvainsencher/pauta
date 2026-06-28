import type { IssueStatus, SprintStatus } from "./types.js";

/**
 * Sprint status is *derived* from the sprint's issues — it is never stored or set
 * by hand. This makes inconsistent state impossible (the guardrail): a sprint cannot
 * claim to be "done" while it holds an open issue, nor "planned" once work has begun.
 *
 *   planned — no work started yet (every issue idea/ready, or the sprint is empty)
 *   active  — some issue is doing/done AND some issue is not done (work + remainder)
 *   done    — the sprint has issues and every one of them is done
 *
 * Several sprints may be "active" at once; that is allowed by design.
 */
export function deriveSprintStatus(issues: readonly { status: IssueStatus }[]): SprintStatus {
  const hasWork = issues.some((i) => i.status === "doing" || i.status === "done");
  if (!hasWork) {
    return "planned";
  }
  const hasUnfinished = issues.some((i) => i.status !== "done");
  return hasUnfinished ? "active" : "done";
}
