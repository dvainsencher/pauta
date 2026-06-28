import { describe, expect, it } from "vitest";
import type { IssueStatus } from "./types.js";
import { deriveSprintStatus } from "./sprintStatus.js";

const issues = (...statuses: IssueStatus[]) => statuses.map((status) => ({ status }));

describe("deriveSprintStatus", () => {
  it("an empty sprint is planned", () => {
    expect(deriveSprintStatus([])).toBe("planned");
  });

  it("idea/ready-only sprints are planned (no work started)", () => {
    expect(deriveSprintStatus(issues("idea"))).toBe("planned");
    expect(deriveSprintStatus(issues("ready", "idea"))).toBe("planned");
  });

  it("a sprint with work started and work remaining is active", () => {
    expect(deriveSprintStatus(issues("doing"))).toBe("active");
    expect(deriveSprintStatus(issues("doing", "idea"))).toBe("active");
  });

  it("finished work plus a non-finished issue is still active", () => {
    expect(deriveSprintStatus(issues("done", "idea"))).toBe("active");
    expect(deriveSprintStatus(issues("done", "ready", "doing"))).toBe("active");
  });

  it("a sprint whose issues are all done is done", () => {
    expect(deriveSprintStatus(issues("done"))).toBe("done");
    expect(deriveSprintStatus(issues("done", "done"))).toBe("done");
  });

  it("marking the last open issue done flips active -> done", () => {
    expect(deriveSprintStatus(issues("done", "doing"))).toBe("active");
    expect(deriveSprintStatus(issues("done", "done"))).toBe("done");
  });

  it("starting work flips planned -> active", () => {
    expect(deriveSprintStatus(issues("ready", "ready"))).toBe("planned");
    expect(deriveSprintStatus(issues("doing", "ready"))).toBe("active");
  });
});
