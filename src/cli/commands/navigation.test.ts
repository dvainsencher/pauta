import { describe, expect, it } from "vitest";
import { moveLeft, moveRight, moveUp, moveDown, type NavState } from "./navigation.js";

describe("keyboard navigation", () => {
  const col0: NavState = { colIndex: 0, rowIndex: 0 };

  it("moveRight advances column", () => {
    expect(moveRight(col0, [1, 1, 1, 1]).colIndex).toBe(1);
  });

  it("moveRight clamps at last column", () => {
    const at3: NavState = { colIndex: 3, rowIndex: 0 };
    expect(moveRight(at3, [1, 1, 1, 1]).colIndex).toBe(3);
  });

  it("moveLeft retreats column", () => {
    const at2: NavState = { colIndex: 2, rowIndex: 0 };
    expect(moveLeft(at2, [1, 1, 1, 1]).colIndex).toBe(1);
  });

  it("moveLeft clamps at column 0", () => {
    expect(moveLeft(col0, [1, 1, 1, 1]).colIndex).toBe(0);
  });

  it("works for a board with three columns", () => {
    const at2: NavState = { colIndex: 2, rowIndex: 0 };
    expect(moveRight(at2, [1, 1, 1]).colIndex).toBe(2);
    expect(moveLeft(at2, [1, 1, 1]).colIndex).toBe(1);
  });

  it("moveDown advances row within column", () => {
    const state: NavState = { colIndex: 1, rowIndex: 0 };
    expect(moveDown(state, [0, 3, 0, 0]).rowIndex).toBe(1);
  });

  it("moveDown clamps at last card", () => {
    const state: NavState = { colIndex: 1, rowIndex: 1 };
    expect(moveDown(state, [0, 2, 0, 0]).rowIndex).toBe(1);
  });

  it("moveDown on an empty column returns rowIndex 0, not -1", () => {
    const state: NavState = { colIndex: 1, rowIndex: 0 };
    expect(moveDown(state, [1, 0, 0, 0]).rowIndex).toBe(0);
  });

  it("moveUp retreats row", () => {
    const state: NavState = { colIndex: 1, rowIndex: 1 };
    expect(moveUp(state, [0, 2, 0, 0]).rowIndex).toBe(0);
  });

  it("moveRight resets rowIndex to 0 when column has fewer cards", () => {
    const state: NavState = { colIndex: 1, rowIndex: 2 };
    const next = moveRight(state, [0, 3, 1, 0]);
    expect(next.colIndex).toBe(2);
    expect(next.rowIndex).toBe(0);
  });
});
