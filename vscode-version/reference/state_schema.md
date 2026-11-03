# `coaching_state.md` Schema

`coaching_state.md` is created by `kickoff` in the project root and is the only memory across sessions. Keep it human-readable markdown. Update it with targeted edits at the end of each command; never rewrite the whole file unless it is corrupt. Update `last_updated`.

## Template

```markdown
# Coaching State

last_updated: YYYY-MM-DD
mode: quick_prep | full_system

## Profile
- target_role:
- directness: 5            # 1-5, see reference/principles.md
- timeline:                # where the user is in the process
- interview_history:       # count and how they went
- biggest_concern:
- background_summary:      # 3-5 lines, from user's own words

## Story Bank
<!-- one block per story; id is S1, S2, ... -->
### S1 — <short title>
- status: active | strengthening | retired
- skills: [leadership, conflict, ...]
- competencies_covered: []
- impact: <quantified if possible, else [need metric]>
- strength: 1-5
- earned_secret: <insight only the user can claim, or none yet>
- opening_line:
- notes:
- retire_reason:          # only if retired

## Companies
### <Company>
- status: researching | applied | interviewing | offer | rejected | withdrawn
- research_brief: <3-6 line summary with source labels>
- fit_read:
- prep: <date, link to key points: predicted questions, story mapping, gaps>
- concerns: <likely concerns with counters>
- questions_to_ask: []
- interviews:
  - date / round / format / interviewer(s) / outcome
- interviewer_intel:
  - name: <name>
    source: <URL or "pasted text">
    confidence: High | Medium | Low
    summary: <functional lens, focus areas, rapport hooks, watch-for>
- offer: <only if user supplied; comp details, ideal outcome, walk-away>

## Session Log
<!-- append-only, newest last -->
- YYYY-MM-DD | analyze | <company/round> | avg 3.4 | self 4.0 | gap +0.6 | bottleneck: structure | root cause: rambling

## Scores
### Dimension averages over time
| Date | Context | Substance | Structure | Relevance | Credibility | Differentiation | Avg | Self | Gap |
|---|---|---|---|---|---|---|---|---|---|

## Patterns
<!-- root causes observed, with counts and user reaction -->
- <root cause>: seen N times, first YYYY-MM-DD, last YYYY-MM-DD, status: persistent | improving | resolved, user_reaction: confirmed | disputed

## Drill Progress
| Drill | Rounds | Last key-dim avg | Consecutive passes | Status |
|---|---|---|---|---|
| ladder | 0 | - | 0 | unlocked |
| pushback | 0 | - | 0 | locked |
| pivot | 0 | - | 0 | locked |
| gap | 0 | - | 0 | locked |
| role | 0 | - | 0 | locked |
| panel | 0 | - | 0 | locked |
| stress | 0 | - | 0 | locked |
| retrieval | 0 | - | 0 | locked (needs 8 stories) |

## Growth Focus
- current_focus: <the one growth area the user chose>
- chosen_on:
- why_within_control:

## Self-Awareness Notes
<!-- the user's own observations about themselves as a communicator -->

## Open Items
- [ ] <next action>
```

## Rules

- Keep story IDs stable. Never renumber. Retired stories stay in the file with `status: retired` and a `retire_reason`.
- Drill statuses: `locked`, `unlocked`, `passed`. A drill becomes `passed` after 2 consecutive rounds with key-dimension average >= 4.0.
- When a transcript is analyzed, store scores and short evidence, **not** the full transcript.
- Never store credentials, financial account numbers, or sensitive personal data. Compensation figures may be stored in `offer` only if the user provided them.
- If a field is unknown, leave it blank; do not guess.
