export interface NavState {
  colIndex: number;
  rowIndex: number;
}

/**
 * Column-agnostic keyboard navigation. `counts[i]` is the number of selectable rows
 * in column `i`. Works for any board — the issue board (4 status columns) and the
 * sprint board (3 state columns) both drive it with their own per-column counts.
 */
export function moveRight(state: NavState, counts: number[]): NavState {
  const nextCol = Math.min(counts.length - 1, state.colIndex + 1);
  const maxRow = Math.max(0, (counts[nextCol] ?? 0) - 1);
  return { colIndex: nextCol, rowIndex: Math.min(state.rowIndex, maxRow) };
}

export function moveLeft(state: NavState, counts: number[]): NavState {
  const nextCol = Math.max(0, state.colIndex - 1);
  const maxRow = Math.max(0, (counts[nextCol] ?? 0) - 1);
  return { colIndex: nextCol, rowIndex: Math.min(state.rowIndex, maxRow) };
}

export function moveDown(state: NavState, counts: number[]): NavState {
  const count = counts[state.colIndex] ?? 0;
  if (count === 0) return state;
  return { ...state, rowIndex: Math.min(count - 1, state.rowIndex + 1) };
}

export function moveUp(state: NavState, _counts: number[]): NavState {
  return { ...state, rowIndex: Math.max(0, state.rowIndex - 1) };
}
