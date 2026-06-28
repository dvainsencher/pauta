import { describe, expect, it, vi } from "vitest";
import { render } from "ink-testing-library";
import { act } from "react";
import React from "react";
import { SprintBoard } from "./sprintBoard.js";
import type { IssueView, SprintGroup } from "../../reader/plan.js";


function makeIssue(id: number, status: IssueView["status"]): IssueView {
  return {
    id,
    title: `Issue ${id}`,
    status,
    sprint: "s",
    createdAt: "",
    updatedAt: "",
    hasSpec: false,
    hasLog: false,
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

const sprints: SprintGroup[] = [
  makeSprint({
    name: "active-one",
    status: "active",
    active: true,
    goal: "ship the thing",
    issues: [makeIssue(1, "done"), makeIssue(2, "doing")],
  }),
  makeSprint({ name: "planned-one", status: "planned", active: false, position: 20 }),
  makeSprint({ name: "done-one", status: "done", active: false, position: 5 }),
];

describe("SprintBoard", () => {
  it("renders three state columns and every sprint", () => {
    const { lastFrame } = render(
      <SprintBoard sprints={sprints} selected={null} onSelect={() => {}} onCancel={() => {}} />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("ACTIVE");
    expect(frame).toContain("PLANNED");
    expect(frame).toContain("DONE");
    expect(frame).toContain("active-one");
    expect(frame).toContain("planned-one");
    expect(frame).toContain("done-one");
  });

  it("shows each sprint's done/total progress and goal", () => {
    const { lastFrame } = render(
      <SprintBoard sprints={sprints} selected={null} onSelect={() => {}} onCancel={() => {}} />,
    );
    const frame = lastFrame() ?? "";
    expect(frame).toContain("1/2 done");
    expect(frame).toContain("ship the thing");
  });

  it("opens the focused sprint on Enter", () => {
    const onSelect = vi.fn();
    const { stdin } = render(
      <SprintBoard sprints={sprints} selected={null} onSelect={onSelect} onCancel={() => {}} />,
    );
    // Cursor starts on the first non-empty column (active).
    act(() => stdin.write("\r"));
    expect(onSelect).toHaveBeenCalledWith("active-one");
  });

  it("shows a cancel hint", () => {
    const { lastFrame } = render(
      <SprintBoard sprints={sprints} selected={null} onSelect={() => {}} onCancel={() => {}} />,
    );
    expect(lastFrame() ?? "").toMatch(/esc/i);
  });

  it("starts the cursor on the currently selected sprint", () => {
    const onSelect = vi.fn();
    const { stdin } = render(
      <SprintBoard sprints={sprints} selected="planned-one" onSelect={onSelect} onCancel={() => {}} />,
    );
    act(() => stdin.write("\r"));
    expect(onSelect).toHaveBeenCalledWith("planned-one");
  });
});
