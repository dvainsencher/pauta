import fs from "node:fs";
import type { Issue, Sprint, SprintStatus } from "../domain/types.js";
import { deriveSprintStatus } from "../domain/sprintStatus.js";
import { assertIssueExists, assertSprintExists } from "../domain/validation.js";
import { specFilePath } from "../storage/paths.js";
import { readIssues } from "../storage/issuesStore.js";
import { readProgress } from "../storage/progressStore.js";
import { readSprints } from "../storage/sprintsStore.js";
import { backlogIssues } from "./backlog.js";

export interface IssueView extends Issue {
  hasSpec: boolean;
  hasLog: boolean;
}

export interface SprintGroup extends Sprint {
  status: SprintStatus;
  active: boolean;
  issues: IssueView[];
}

export interface Plan {
  backlog: IssueView[];
  sprints: SprintGroup[];
  filteredBySprint?: string;
}

export interface BuildPlanOptions {
  sprint?: string;
  done?: boolean;
}

export function getIssue(cwd: string, id: number): IssueView {
  const issues = readIssues(cwd);
  assertIssueExists(issues, id);
  const progress = readProgress(cwd);
  const issue = issues.find((i) => i.id === id)!;
  return {
    ...issue,
    hasSpec: fs.existsSync(specFilePath(cwd, issue.id)),
    hasLog: progress.some((entry) => entry.issueId === issue.id),
  };
}

export function buildPlan(cwd: string, options: BuildPlanOptions): Plan {
  const issues = readIssues(cwd);
  const sprints = readSprints(cwd);
  const progress = readProgress(cwd);

  if (options.sprint !== undefined) {
    assertSprintExists(sprints, options.sprint);
  }

  const toView = (issue: Issue): IssueView => ({
    ...issue,
    hasSpec: fs.existsSync(specFilePath(cwd, issue.id)),
    hasLog: progress.some((entry) => entry.issueId === issue.id),
  });

  const allForSprint = (sprintName: string): Issue[] =>
    issues.filter((issue) => issue.sprint === sprintName);

  const issuesForSprint = (sprintName: string): IssueView[] =>
    allForSprint(sprintName)
      .filter((issue) => options.done || issue.status !== "done")
      .sort((a, b) => a.id - b.id)
      .map(toView);

  const sprintGroups = sprints
    .filter((sprint) => options.sprint === undefined || sprint.name === options.sprint)
    .map((sprint) => {
      // Status is derived from the sprint's FULL issue list — independent of the
      // done-hiding filter, or an all-done sprint would look empty (planned).
      const status = deriveSprintStatus(allForSprint(sprint.name));
      return {
        ...sprint,
        status,
        active: status === "active",
        issues: issuesForSprint(sprint.name),
      };
    })
    // Hide done sprints in the whole-plan view unless --done or a specific sprint is asked for.
    .filter((group) => options.sprint !== undefined || options.done || group.status !== "done")
    .sort((a, b) => {
      if (a.active !== b.active) {
        return a.active ? -1 : 1;
      }
      return a.position - b.position;
    });

  const backlog =
    options.sprint === undefined
      ? backlogIssues(issues)
          .filter((issue) => options.done || issue.status !== "done")
          .sort((a, b) => a.id - b.id)
          .map(toView)
      : [];

  return { backlog, sprints: sprintGroups, filteredBySprint: options.sprint };
}
