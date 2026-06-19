import type { Issue, IssueStatus } from "../../domain/types.js";
import { nextId } from "../../domain/ids.js";
import { assertIssueStatus, assertSprintExists } from "../../domain/validation.js";
import { readIssues, writeIssues } from "../../storage/issuesStore.js";
import { readSprints } from "../../storage/sprintsStore.js";

export interface AddIssueOptions {
  status?: string;
  sprint?: string;
}

export function addIssue(cwd: string, title: string, options: AddIssueOptions = {}): number {
  const sprint = options.sprint ?? "";
  if (sprint !== "") {
    assertSprintExists(readSprints(cwd), sprint);
  }
  if (options.status !== undefined) {
    assertIssueStatus(options.status);
  }

  const issues = readIssues(cwd);
  const id = nextId(issues);
  const now = new Date().toISOString();
  const issue: Issue = {
    id,
    title,
    status: (options.status as IssueStatus | undefined) ?? "idea",
    sprint,
    createdAt: now,
    updatedAt: now,
  };

  writeIssues(cwd, [...issues, issue]);
  return id;
}
