# analyze

Score an interview transcript the user pastes, diagnose the root cause, and give a delta sheet. Use `reference/rubric.md`, `reference/root_causes.md` and `reference/principles.md`.

## Preconditions

- Requires a transcript. If none is in the message, ask the user to paste it (tools like Granola produce good transcripts). If the transcript is partial or noisy, say so and score only what is clear.
- Identify which speaker is the user. If unclear, ask once.
- Ask for company, round and interviewer(s) if not obvious (for storing results).

## Flow

1. **Self-assessment first.** Before showing any scores, ask: "How do you think it went? Which answers felt strong? Which felt off? Overall, rate yourself 1-5." Wait for the reply and record it.
2. **Segment** the transcript into question/answer pairs. Skip small talk. Note answers that were interrupted.
3. **Score each answer** on the five dimensions (1-5) with a quote as evidence and a one-line fix for any score below 4:

```
Q3: "<question>"
| Dimension | Score | Evidence | Fix |
Answer avg: X.X | Weakest: <dim> | Strongest: <dim>
```

For long transcripts, give the full table for the 3-4 most important answers (weakest, strongest, most-consequential) and a compact one-line row for the rest.

4. **Reveal the session summary:** per-dimension averages, session average, and the **self-assessment gap** (`self - actual`). Order the feedback by directness level (strengths first at lower levels).
5. **Triage:**
   - Identify the **primary bottleneck** (the lowest-averaging dimension or the one that best explains the lost points).
   - **Diagnose the root cause** per `reference/root_causes.md` using the format there, with at least two pieces of evidence. Ask whether the diagnosis rings true, and record the user's reaction.
   - **Branch the coaching** according to the root cause's coaching branch.
6. **Delta sheet:**
   - **What's working** (keep doing, with evidence)
   - **What to fix** (ranked, max 3, each specific and changeable)
   - **Stories**: which to sharpen, which to retire, which gaps appeared (cross-reference the story bank)
   - **Signals about the interviewer's reaction** (only if visible in the transcript)
7. **Optional side-by-side rewrite.** Offer: "Want a rewrite of your weakest answer?" If yes:
   - Show **Original** and **Rewrite** side by side (table or two blocks), then 3-4 bullets naming exactly what changed and why.
   - The rewrite must reach a **4-5** on the rubric. Use only facts the user gave; use `[add: ...]` placeholders for missing specifics. Never invent metrics, names, or outcomes.
   - Keep the user's voice; avoid generic polish.
   - Re-score the rewrite honestly. If it cannot reach 4 without missing facts, say what facts are needed.
8. **Growth choice.** Ask: "Which growth area feels most within your control to change by your next interview?" Offer the 2-3 candidates from the delta sheet. Record the choice as `current_focus` with why.

## Save to `coaching_state.md`

- Session Log line, Scores table row, Patterns (increment root cause counts), Growth Focus, Story Bank updates (strength changes, retire/sharpen flags), Company interview entry (outcome unknown until the user reports it), and the self-assessment gap. Store scores and short evidence, not the full transcript.

## Next command

Suggest one: `practice [drill matching the root cause]`, `stories` (if story gaps), or `thankyou` (if the interview was recent and no note has been sent).
