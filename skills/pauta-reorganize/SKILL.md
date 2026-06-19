---
name: pauta-reorganize
description: This skill should be used when the user wants to restructure a pauta-managed backlog — phrases like "reorganize the backlog", "regroup these into sprints", "clean up the roadmap", "rebatch these issues", or "this sprint is getting too big, split it".
---

# pauta: reorganize

This project tracks work with `pauta`, a flat-file backlog/sprint manager. The one
rule that matters: **the `pauta` CLI is the only writer to `docs/roadmap/*`.** You
read the plan via `pauta show --json` and you write to it only by calling `pauta`
commands — never by editing `docs/roadmap/issues.jsonl`, `docs/roadmap/sprints.json`,
or `docs/roadmap/specs/*.md` directly.

Sprints here are **context batches, not time boxes** — group issues so each sprint
is something an agent (or a person) could hold in mind at once, not so it fits a
calendar period. `position` is advisory only; reordering or activating sprints out
of position order is normal, not a problem to fix.

## Steps

1. Run `pauta show --json` to read the whole plan: every backlog issue, every sprint
   with its goal/position/status, and which sprint is active.
2. Reason about a regrouping that serves the user's stated goal (e.g. "these five
   backlog issues are really one feature," "this sprint has twelve issues, split it
   into two," "these two sprints overlap, merge their goals").
3. **Propose the plan in chat before acting** — list the moves and any new sprints
   in plain language, briefly enough to scan. This is a structural change to the
   user's plan; don't execute silently.
4. Once the user confirms (or if they already gave you clear enough instructions
   that confirmation would be redundant), execute via `pauta` commands only:
   - `pauta create-sprint <name> --goal "..." [--position <n>]` for new sprints
   - `pauta move <id> <sprint-name>` / `pauta move <id> --backlog` to reassign issues
   - `pauta set-position <name> <n>` to reorder sprints
   - `pauta edit-sprint <name> [--goal "..."] [--notes "..."]` to refine a goal
5. Do not delete or rename sprints — there's no `remove-sprint` command; if a sprint
   is no longer useful, move its issues elsewhere and leave it `done`/empty rather
   than working around the missing command.

After executing, summarize what moved in one short list — don't re-print the whole
plan unless asked.
