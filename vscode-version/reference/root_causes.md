# Root-Cause Taxonomy

After scoring, find the **primary bottleneck** (the dimension that most limits the average), then diagnose the **root cause** — the behavior pattern that produces the low scores. Choose one primary root cause and at most one secondary. Support each with at least two pieces of transcript evidence or a repeated pattern across answers. If evidence is thin, say "low confidence" and name what extra evidence would settle it.

For each root cause, the coaching branch is what you do next.

| # | Root cause | Detection signals | Typically depresses | Coaching branch |
|---|---|---|---|---|
| 1 | **Narrative hoarding** — holds back the best material, gives the safe summary | Answers are short or generic although the user's background is rich; the best story shows up only when prompted; "I just did my job" | Substance, Differentiation | Run `stories` in mining mode to surface the hidden story; drill "lead with the headline" (practice ladder). |
| 2 | **Conflict avoidance** — sanitizes disagreements and failures | Conflict stories end in smooth harmony; no stakes, no position held; "we aligned quickly" | Credibility, Substance | Reconstruct the real disagreement: what was at stake, what the user argued, what it cost. Drill with `practice pushback`. |
| 3 | **Status anxiety** — over-justifies credentials or deflects to titles/brand names | Name-dropping, titles instead of actions, defensive tone to probing, long preambles about background | Structure, Credibility | Strip to actions and outcomes; drill short-form answers (30s/60s ladder); reframe from "prove I belong" to "here is what I did". |
| 4 | **Over-hedging** — qualifies every claim | "kind of", "I think maybe", "sort of", "I guess" repeated; ownership softened | Credibility | Rewrite with declarative ownership statements; drill with `practice pushback`. |
| 5 | **Rambling / no headline** — context before point, no ending | Answer exceeds target length, result arrives in the last 10%, trails off | Structure | Headline-first template; ladder drills (30s → 3m); practice cutting context to two sentences. |
| 6 | **Metric-light** — impact is never quantified | Outcomes described as "went well", "improved", "stakeholders were happy" | Substance | Metric recovery exercise: baseline, change, time frame, how measured, proxy if no number exists. Mark `[need metric]` until supplied. |
| 7 | **Credit diffusion** — "we" everywhere, unclear personal contribution | Pronoun pattern; interviewer would ask "what did *you* do?" | Credibility, Substance | Force first-person breakdown: decisions you made, actions you took, what would not have happened without you. |
| 8 | **Story-question mismatch** — reaches for the same favorite story regardless of question | Same story reused; story does not test the competency asked | Relevance | Map each story to competencies in the story bank; run `practice retrieval`; retire or add stories to cover gaps. |
| 9 | **Generic AI-polish** — fluent but interchangeable | Buzzwords, symmetrical phrasing, no specific detail, no point of view | Differentiation | Earned-secrets mining; insert one specific detail and one opinion per answer; `stories` stand-out mode. |
| 10 | **Pressure collapse** — quality drops when interrupted or challenged | Strong prepared answers, weak responses to follow-ups or pushback; apologetic reversals | Credibility, Relevance | `practice pushback`, `practice pivot`, `practice stress`; teach a recovery move (pause, restate, answer the real question). |

## Diagnosis output format

```
Primary bottleneck: <dimension> (avg X.X)
Root cause: <name> — confidence <High/Medium/Low>
Evidence:
  1. "<quote>" → <what it shows>
  2. "<quote>" → <what it shows>
Secondary (optional): <name>
Coaching branch: <what happens next, which command to run>
```

Rules:
- Never diagnose personality or character. Describe the behavior pattern in the interview.
- Phrase the diagnosis as a hypothesis the user can confirm or reject; ask them if it rings true, then record their reaction in `coaching_state.md` under patterns.
- Add newly observed root causes to `coaching_state.md` with a count so `progress` can show persistence or improvement.
