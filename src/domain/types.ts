export type IssueStatus = "idea" | "ready" | "doing" | "done";

export type SprintStatus = "planned" | "active" | "done";

export interface Issue {
  id: number;
  title: string;
  status: IssueStatus;
  sprint: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  name: string;
  position: number;
  status: SprintStatus;
  goal: string;
  notes: string;
}

export const ISSUE_STATUSES: readonly IssueStatus[] = ["idea", "ready", "doing", "done"];
export const SPRINT_STATUSES: readonly SprintStatus[] = ["planned", "active", "done"];
