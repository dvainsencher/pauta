import { describe, expect, it } from "vitest";
import type { Issue } from "./types.js";
import { nextId } from "./ids.js";

function issue(id: number): Issue {
  return {
    id,
    title: "x",
    status: "idea",
    sprint: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("nextId", () => {
  it("returns 1 for an empty list", () => {
    expect(nextId([])).toBe(1);
  });

  it("returns max + 1", () => {
    expect(nextId([issue(1), issue(5)])).toBe(6);
  });

  it("is unaffected by issue order", () => {
    expect(nextId([issue(5), issue(1), issue(3)])).toBe(6);
  });
});
