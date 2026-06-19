import fs from "node:fs";
import { assertIssueExists } from "../../domain/validation.js";
import { specFilePath, specsDir } from "../../storage/paths.js";
import { readIssues } from "../../storage/issuesStore.js";

export function spec(cwd: string, id: number): string {
  const issues = readIssues(cwd);
  assertIssueExists(issues, id);

  const filePath = specFilePath(cwd, id);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(specsDir(cwd), { recursive: true });
    const issue = issues.find((candidate) => candidate.id === id);
    fs.writeFileSync(filePath, `# ${issue?.title}\n`);
  }

  return filePath;
}
