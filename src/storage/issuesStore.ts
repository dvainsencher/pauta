import fs from "node:fs";
import path from "node:path";
import type { Issue } from "../domain/types.js";
import { issuesFilePath } from "./paths.js";

export function readIssues(cwd: string): Issue[] {
  const filePath = issuesFilePath(cwd);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  return lines.map((line, index) => {
    try {
      return JSON.parse(line) as Issue;
    } catch (cause) {
      throw new Error(`Malformed JSON in issues.jsonl at line ${index + 1}`, { cause });
    }
  });
}

export function writeIssues(cwd: string, issues: Issue[]): void {
  const filePath = issuesFilePath(cwd);
  const tempPath = path.join(path.dirname(filePath), `.issues.jsonl.${process.pid}.tmp`);
  const content = issues.map((issue) => JSON.stringify(issue)).join("\n");
  const trailing = issues.length > 0 ? `${content}\n` : "";
  fs.writeFileSync(tempPath, trailing);
  fs.renameSync(tempPath, filePath);
}
