import path from "node:path";
import { fileURLToPath } from "node:url";

export function packageRoot(): string {
  const thisFile = fileURLToPath(import.meta.url);
  return path.dirname(path.dirname(thisFile));
}

export function skillsSourceDir(): string {
  return path.join(packageRoot(), "skills");
}
