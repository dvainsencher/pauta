import { editIssue } from "./editIssue.js";

export function setStatus(cwd: string, id: number, status: string): void {
  editIssue(cwd, id, { status });
}
