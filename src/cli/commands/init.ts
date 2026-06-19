import fs from "node:fs";
import { roadmapDir, specsDir } from "../../storage/paths.js";
import { readIssues, writeIssues } from "../../storage/issuesStore.js";
import { readSprints, writeSprints } from "../../storage/sprintsStore.js";

export function init(cwd: string): void {
  fs.mkdirSync(roadmapDir(cwd), { recursive: true });
  fs.mkdirSync(specsDir(cwd), { recursive: true });
  if (readIssues(cwd).length === 0) {
    writeIssues(cwd, []);
  }
  if (readSprints(cwd).length === 0) {
    writeSprints(cwd, []);
  }
}
