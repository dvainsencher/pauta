import { describe, expect, it } from "vitest";
import { buildKanbanData, groupSprintsByStatus, selectKanbanView } from "./kanban.js";
import type { IssueView, SprintGroup } from "../../reader/plan.js";

function makeIssue(overrides: Partial<IssueView> & { id: number }): IssueView {
  return {
    title: `Issue ${overrides.id}`,
    status: "ready",
    sprint: "s1",
    createdAt: "",
    updatedAt: "",
    hasSpec: false,
    hasLog: false,
    ...overrides,
  };
}

function makeSprint(overrides: Partial<SprintGroup> & { name: string }): SprintGroup {
  return {
    position: 10,
    status: "active",
    goal: "",
    notes: "",
    active: true,
    issues: [],
    ...overrides,
  };
}

describe("buildKanbanData", () => {
  it("returns active sprint by default", () => {
    const active = makeSprint({ name: "sprint-a", active: true, issues: [makeIssue({ id: 1 })] });
    const planned = makeSprint({ name: "sprint-b", status: "planned", active: false, issues: [] });
    const result = buildKanbanData({ sprints: [active, planned], backlog: [] });
    expect(result.sprintName).toBe("sprint-a");
  });

  it("falls back to backlog when no active sprint", () => {
    const result = buildKanbanData({
      sprints: [],
      backlog: [makeIssue({ id: 1, sprint: "" })],
    });
    expect(result.sprintName).toBeNull();
    expect(result.columns.ready).toHaveLength(1);
  });

  it("groups issues into four status columns", () => {
    const issues = [
      makeIssue({ id: 1, status: "idea" }),
      makeIssue({ id: 2, status: "ready" }),
      makeIssue({ id: 3, status: "ready" }),
      makeIssue({ id: 4, status: "doing" }),
      makeIssue({ id: 5, status: "done" }),
    ];
    const sprint = makeSprint({ name: "s", active: true, issues });
    const result = buildKanbanData({ sprints: [sprint], backlog: [] });
    expect(result.columns.idea).toHaveLength(1);
    expect(result.columns.ready).toHaveLength(2);
    expect(result.columns.doing).toHaveLength(1);
    expect(result.columns.done).toHaveLength(1);
  });

  it("preserves issue ordering by id within each column", () => {
    const issues = [
      makeIssue({ id: 3, status: "ready" }),
      makeIssue({ id: 1, status: "ready" }),
      makeIssue({ id: 2, status: "ready" }),
    ];
    const sprint = makeSprint({ name: "s", active: true, issues });
    const result = buildKanbanData({ sprints: [sprint], backlog: [] });
    expect(result.columns.ready.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it("exposes all sprints for the sprint board", () => {
    const s1 = makeSprint({ name: "alpha", active: true });
    const s2 = makeSprint({ name: "beta", status: "planned", active: false });
    const result = buildKanbanData({ sprints: [s1, s2], backlog: [] });
    expect(result.allSprints.map((s) => s.name)).toEqual(["alpha", "beta"]);
  });
});

describe("groupSprintsByStatus", () => {
  it("buckets sprints into active/planned/done columns", () => {
    const sprints = [
      makeSprint({ name: "a", status: "active", active: true }),
      makeSprint({ name: "p", status: "planned", active: false }),
      makeSprint({ name: "d", status: "done", active: false }),
      makeSprint({ name: "a2", status: "active", active: true }),
    ];
    const cols = groupSprintsByStatus(sprints);
    expect(cols.active.map((s) => s.name)).toEqual(["a", "a2"]);
    expect(cols.planned.map((s) => s.name)).toEqual(["p"]);
    expect(cols.done.map((s) => s.name)).toEqual(["d"]);
  });

  it("orders sprints within a column by position", () => {
    const sprints = [
      makeSprint({ name: "late", status: "active", active: true, position: 30 }),
      makeSprint({ name: "early", status: "active", active: true, position: 10 }),
    ];
    expect(groupSprintsByStatus(sprints).active.map((s) => s.name)).toEqual(["early", "late"]);
  });
});

describe("selectKanbanView", () => {
  it("returns backlog issues when sprint is null", () => {
    const sprint = makeSprint({ name: "alpha", active: true, issues: [makeIssue({ id: 10 })] });
    const backlogIssue = makeIssue({ id: 99, sprint: "" });
    const result = selectKanbanView({ sprints: [sprint], backlog: [backlogIssue] }, null);
    expect(result.sprintName).toBeNull();
    expect(result.columns.ready).toHaveLength(1);
    expect(result.columns.ready[0].id).toBe(99);
  });

  it("returns sprint issues when sprint name is given", () => {
    const issues = [makeIssue({ id: 5, status: "doing" })];
    const sprint = makeSprint({ name: "beta", status: "planned", active: false, issues });
    const result = selectKanbanView({ sprints: [sprint], backlog: [] }, "beta");
    expect(result.sprintName).toBe("beta");
    expect(result.columns.doing).toHaveLength(1);
  });

  it("falls back to active sprint when sprint name not found", () => {
    const sprint = makeSprint({ name: "real-sprint", active: true, issues: [makeIssue({ id: 1 })] });
    const result = selectKanbanView({ sprints: [sprint], backlog: [] }, "nonexistent");
    expect(result.sprintName).toBe("real-sprint");
  });
});
