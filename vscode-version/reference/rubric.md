# Scoring Rubric

Every answer is scored 1–5 on five dimensions. Every score must cite a quote or close paraphrase from the transcript. Scores are integers; use half points only for averages.

| Score | Meaning |
|---|---|
| 1 | Missing or harmful |
| 2 | Weak |
| 3 | Acceptable (passes, does not stand out) |
| 4 | Strong |
| 5 | Exceptional, interview-winning |

Hiring-bar guidance: 3 is "would not be rejected for this answer alone", 4 is "would advance on this answer", 5 is "would be remembered and cited in the debrief".

## 1. Substance — what you actually did and achieved

| Score | Anchor |
|---|---|
| 1 | No concrete example; only opinions or generalities. |
| 2 | Example exists but vague; unclear what the user personally did; no outcome. |
| 3 | Clear example with the user's role and an outcome, but little depth or quantification. |
| 4 | Specific actions, decisions, and a quantified or clearly evidenced result. |
| 5 | Rich, non-obvious detail: decision under uncertainty, trade-offs weighed, measurable impact, and what changed afterwards. |

## 2. Structure — how the answer is organized

| Score | Anchor |
|---|---|
| 1 | Cannot follow; no beginning or end. |
| 2 | Rambles or buries the point; context overwhelms action. |
| 3 | Followable arc (situation, action, result) but uneven pacing or late headline. |
| 4 | Headline up front, balanced context/action/result, clean ending. |
| 5 | Headline first, tight pacing with most time on the user's actions, ends with result and a one-line takeaway; length fits the question. |

## 3. Relevance — fit to the question and the role

| Score | Anchor |
|---|---|
| 1 | Does not answer the question asked. |
| 2 | Partly answers; story is a poor fit or answers a different question. |
| 3 | Answers the question; fit to the role's priorities is incidental. |
| 4 | Directly answers and the chosen story matches the competency being tested. |
| 5 | Directly answers, targets the competency, and connects to what this company/role optimizes for without forcing it. |

## 4. Credibility — does it sound true and owned

| Score | Anchor |
|---|---|
| 1 | Contradictions, evasion, or claims that cannot be believed. |
| 2 | Uses "we" throughout, vague ownership, inflated or unverifiable claims, over-hedging. |
| 3 | Plausible and mostly owned; some unsupported claims or unclear individual contribution. |
| 4 | Clear individual ownership, believable detail, honest about limits or mistakes. |
| 5 | Unmistakably first-hand: specific names/numbers/constraints, candid about what went wrong or what was learned, would survive follow-up probing. |

## 5. Differentiation — would a different candidate give this answer

| Score | Anchor |
|---|---|
| 1 | Pure cliché; any candidate could say it. |
| 2 | Generic, polished-sounding, AI-prepped feel; no point of view. |
| 3 | Some personal flavor but a similar candidate could give it. |
| 4 | A distinctive angle or detail that sets the user apart. |
| 5 | Contains an earned secret: an insight or detail only this person could claim, with a clear point of view. |

## Per-answer outputs

For each answer, report:

| Dimension | Score | Evidence (quote) | Fix |
|---|---|---|---|

Then:
- **Answer average** = mean of the five scores (one decimal).
- **Weakest dimension** and **strongest dimension**.
- **Primary bottleneck** across the session = the dimension (or root cause) that most limits the average.

## Session-level outputs

- Session average and per-dimension averages.
- Self-assessment gap = `self_rating - session_average`.
- Trend vs. prior sessions (from `coaching_state.md`).

## Rewrite quality bar

A rewrite of the user's weakest answer must score **4 or 5** on the rubric, using only facts the user has provided. Where a strong answer would need a fact that is missing, insert a bracketed prompt like `[add: team size]` instead of inventing it.
