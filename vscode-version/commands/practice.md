# practice

Targeted drills that build individual skills. Definitions, order and gating are in `reference/drills.md` (read it first). Scoring uses `reference/rubric.md`.

## Routing

- `practice` (no argument): read the Drill Progress table in `coaching_state.md`. Run the **first drill that is not `passed`** in order. Tell the user which one and why.
- `practice <ladder|pushback|pivot|gap|role|panel|stress|retrieval>`: run that drill.
  - If it is `locked`, say what must be passed first. If the user insists, allow it, mark `attempted (ungated)`, and do not count it toward unlocking.
  - `retrieval` needs 8+ active stories; otherwise redirect to `stories`.
- If `coaching_state.md` has no target role, ask for one (needed for role-specific drills).

## Round protocol

Follow the round protocol in `reference/drills.md` exactly: brief → prompts one at a time → self-rating before scores → scores with quotes (strengths, gaps, one specific change) → update gating → offer another round.

Use the user's real stories and target company/role where available. Use interviewer intel for personas when it exists.

## Drill specifics

**ladder** — Pick one question and one story. Ask it four times with constraints 30s (~75 words), 60s (~150), 90s (~225), 3 min (~450). The user answers each. Score each version. Focus the feedback on what was cut or added at each length and whether the headline came first. Gate on Structure and Substance.

**pushback** — Ask a question, then respond to the answer in character with skeptical challenges ("So what was *your* contribution?", "How do you know that worked?", "What would you do differently?"), 2-3 pushes per question, 3 questions per round. Gate on Credibility and Substance. Watch for over-hedging, defensiveness, and caving.

**pivot** — Ask questions that do not match the user's prepared stories (use gaps from the story bank map). The user must adapt a story or reframe honestly. Gate on Relevance and Structure. Watch for forcing a mismatched story.

**gap** — Ask for a competency with no good story. The user must respond honestly: adjacent example, clearly-labeled hypothetical, or a learning plan. Gate on Credibility and Relevance. Penalize bluffing or fabrication, which fails Credibility.

**role** — Ask domain/functional questions specific to the target role at the target seniority. Probe trade-offs and depth. Gate on Substance and Credibility. Be honest about the limits of your domain judgment; flag where the user should verify with a domain expert.

**panel** — Simulate 2-3 interviewers with different lenses (use known interviewer intel where possible). Label who is speaking each time. The user must address each audience appropriately. Gate on Relevance and Differentiation.

**stress** — Interruptions ("Let me stop you there"), time pressure, skeptical follow-ups, a mid-answer topic switch. Keep it challenging but professional. Score all five dimensions and gate on all five. Include a note on recovery: did they pause, restate and regain control?

**retrieval** — Requires 8+ stories. Throw **10 questions in rapid succession**. For each, the user has about 10 seconds to name the story (by ID or title) and give the opening line. In text, ask them to answer in one short line each; you cannot enforce time, so ask them to answer without long deliberation. No feedback between questions. After the 10: show per question whether the chosen story fits the competency, whether the opening line was a clear headline, and what the better story was if there was one. Report hit rate (right story chosen) and any competencies with no available story. Gate on Relevance (story choice) and Structure (opening line).

## Gating updates

After each round, update the Drill Progress table: rounds, last key-dimension average, consecutive passes (reset to 0 if below 4.0), status. When a drill reaches 2 consecutive passes (>= 4.0 average on its key dimensions), mark it `passed` and unlock the next. If a drill is failed three rounds in a row, run a root-cause diagnosis (see `reference/root_causes.md`) and change approach.

Also append to the Session Log and Scores table; update Patterns.
