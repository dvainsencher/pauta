import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { SprintStatus } from "../../domain/types.js";
import type { SprintGroup } from "../../reader/plan.js";
import { groupSprintsByStatus, SPRINT_COLUMN_ORDER } from "./kanban.js";
import { moveLeft, moveRight, moveUp, moveDown, type NavState } from "./navigation.js";

const COLUMN_COLORS: Record<SprintStatus, string> = {
  active: "yellow",
  planned: "cyan",
  done: "green",
};

interface SprintBoardProps {
  sprints: SprintGroup[];
  selected: string | null;
  onSelect: (name: string) => void;
  onCancel: () => void;
}

function doneTotal(sprint: SprintGroup): { done: number; total: number } {
  const total = sprint.issues.length;
  const done = sprint.issues.filter((i) => i.status === "done").length;
  return { done, total };
}

function SprintCard({ sprint, selected }: { sprint: SprintGroup; selected: boolean }) {
  const { done, total } = doneTotal(sprint);
  return (
    <Box
      flexDirection="column"
      borderStyle={selected ? "double" : "single"}
      borderColor={selected ? "cyan" : undefined}
      paddingX={1}
      marginBottom={1}
    >
      <Text bold wrap="truncate-end">{sprint.name}</Text>
      <Text dimColor wrap="truncate-end">{sprint.goal || " "}</Text>
      <Text dimColor>{done}/{total} done</Text>
    </Box>
  );
}

function SprintColumn({
  status,
  sprints,
  focused,
  selectedRow,
}: {
  status: SprintStatus;
  sprints: SprintGroup[];
  focused: boolean;
  selectedRow: number;
}) {
  return (
    <Box flexDirection="column" width="33%" marginRight={1}>
      <Box borderStyle="single" borderColor={focused ? "cyan" : undefined} paddingX={1}>
        <Text color={COLUMN_COLORS[status]} bold>{status.toUpperCase()}</Text>
        <Text dimColor> ({sprints.length})</Text>
      </Box>
      {sprints.length === 0 && <Text dimColor>  —</Text>}
      {sprints.map((sprint, i) => (
        <SprintCard key={sprint.name} sprint={sprint} selected={focused && i === selectedRow} />
      ))}
    </Box>
  );
}

/**
 * Sprint-overview board: sprints laid out in three columns by derived state —
 * ACTIVE | PLANNED | DONE. Enter drills into the selected sprint's issue board.
 * Replaces the old flat sprint picker.
 */
export function SprintBoard({ sprints, selected, onSelect, onCancel }: SprintBoardProps) {
  const columns = groupSprintsByStatus(sprints);
  const counts = SPRINT_COLUMN_ORDER.map((s) => columns[s].length);

  const [nav, setNav] = useState<NavState>(() => {
    // Start on the selected sprint if it's on the board, else the first non-empty column.
    for (let c = 0; c < SPRINT_COLUMN_ORDER.length; c++) {
      const row = columns[SPRINT_COLUMN_ORDER[c]].findIndex((s) => s.name === selected);
      if (row >= 0) return { colIndex: c, rowIndex: row };
    }
    const firstNonEmpty = counts.findIndex((n) => n > 0);
    return { colIndex: firstNonEmpty < 0 ? 0 : firstNonEmpty, rowIndex: 0 };
  });

  const focusedSprint = (): SprintGroup | undefined =>
    columns[SPRINT_COLUMN_ORDER[nav.colIndex]]?.[nav.rowIndex];

  useInput((_, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.leftArrow) return setNav((s) => moveLeft(s, counts));
    if (key.rightArrow) return setNav((s) => moveRight(s, counts));
    if (key.upArrow) return setNav((s) => moveUp(s, counts));
    if (key.downArrow) return setNav((s) => moveDown(s, counts));
    if (key.return) {
      const sprint = focusedSprint();
      if (sprint) onSelect(sprint.name);
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Sprints</Text>
      </Box>
      <Box flexDirection="row">
        {SPRINT_COLUMN_ORDER.map((status, colIdx) => (
          <SprintColumn
            key={status}
            status={status}
            sprints={columns[status]}
            focused={nav.colIndex === colIdx}
            selectedRow={nav.rowIndex}
          />
        ))}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>←→↑↓ navigate  Enter open sprint  Esc cancel</Text>
      </Box>
    </Box>
  );
}
