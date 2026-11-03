# Drills and Gating

## Drill types (progression order)

| Order | Command | Drill | What it builds | Key dimensions for gating |
|---|---|---|---|---|
| 1 | `practice ladder` | **Constraint ladder** — the same question at 30s, 60s, 90s, then 3 min | Concision, headline-first structure | Structure, Substance |
| 2 | `practice pushback` | **Skepticism / "so what?"** — interviewer challenges claims and impact | Defending claims, ownership | Credibility, Substance |
| 3 | `practice pivot` | **Pivot** — a question that does not match prepared stories | Adapting a story to a new question | Relevance, Structure |
| 4 | `practice gap` | **"I don't have an example"** — a competency with no strong story | Honest, credible handling of gaps (adjacent example, hypothetical with honesty, learning plan) | Credibility, Relevance |
| 5 | `practice role` | **Role-specific scrutiny** — domain specialist questions for the user's target role | Depth and technical/functional credibility | Substance, Credibility |
| 6 | `practice panel` | **Panel** — multiple interviewer personas with different lenses | Managing multiple audiences | Relevance, Differentiation |
| 7 | `practice stress` | **High-pressure simulation** — interruptions, time pressure, challenge | Composure and recovery | All five |
| 8 | `practice retrieval` | **Rapid-fire story matching** — 10 questions, 10 seconds each to name the story and say the opening line | Access to the story bank under pressure | Relevance (story choice), Structure (opening line) |

Ladder constraints: 30 seconds, 60 seconds, 90 seconds, 3 minutes, in that order. In text chat, enforce length by word count: ~75 words ≈ 30s, ~150 ≈ 60s, ~225 ≈ 90s, ~450 ≈ 3 min. Tell the user this is an approximation and that they can time themselves if speaking aloud.

## Gating

- Drills are gated by **scores, not by feeling ready**.
- A drill is **passed** when the average of that drill's key dimensions is **>= 4.0 in 2 consecutive rounds**.
- Only drills that are passed unlock the next drill in order. A user may **attempt** a locked drill if they explicitly insist; record it as `attempted (ungated)` and do not count it toward progression.
- `practice` with no argument runs the next unpassed drill in order and says which one it is and why.
- `practice retrieval` requires **at least 8 stories** in the story bank. If fewer, redirect to `stories`.
- Each round is 3–5 prompts. Track round number, key-dimension average, and consecutive-pass count per drill in `coaching_state.md`.
- If a drill is failed (below 4.0) three rounds in a row, stop repeating it. Run a diagnosis (see `reference/root_causes.md`) and change the approach (different story, simpler variant, or a related command).

## Round protocol (every drill)

1. Brief the drill in two lines: goal and constraint.
2. Deliver the prompt(s) one at a time. Stay in role. No feedback between prompts, unless the drill is `pushback`/`stress`, where in-character challenges are part of the drill (still no coaching until the end).
3. After the last prompt, **ask for the user's self-rating (1–5) and what felt strong/off**. Record it.
4. Reveal scores per `reference/rubric.md` with quotes. Order: strengths, then gaps, then **one specific change for the next round** (follow the directness level).
5. Update gating status and `coaching_state.md`. State whether the drill is passed, how many consecutive passes it has, and what unlocks next.
6. Offer: another round, or move on.

## Interviewer personas (for pushback, panel, stress, mock)

Adapt personas to interviewer intel stored in `coaching_state.md` when available. Defaults:

| Persona | Behavior |
|---|---|
| Skeptical senior | Asks "so what?", challenges numbers, probes ownership |
| Friendly generalist | Warm, open-ended, lets the user ramble and tests self-editing |
| Domain specialist | Drills into specifics and trade-offs |
| Silent evaluator | Minimal reactions; tests composure and ending cleanly |
| Hiring manager | Focuses on impact, scope, judgment, and fit for the team |
