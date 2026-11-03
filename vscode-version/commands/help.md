# help

Show the command menu. Do not require `coaching_state.md`. If it exists, mark the suggested next step at the bottom based on state (see end).

Print exactly this structure (keep it compact):

```
AI INTERVIEW COACH — COMMANDS

START
  kickoff                  Set up your coach (5 min). Creates coaching_state.md
  help                     This menu

BEFORE AN INTERVIEW
  research [company]       Quick brief: culture, interview style, role fit
  prep [company]           One-page prep: predicted questions, story mapping,
                           concerns, questions to ask, interviewer cards
  concerns                 Anticipate what the interviewer will worry about
  questions                5 tailored questions to ask them
  hype                     60s reel, 3x3 sheet, warmup, recovery scripts

BUILD SKILLS
  stories                  Mine, strengthen, retire stories; stand out
  practice                 Drills (next unpassed drill)
    practice ladder | pushback | pivot | gap | role | panel | stress | retrieval
  mock [format] [company]  Full 4-6 question mock, feedback at the end

AFTER AN INTERVIEW
  analyze                  Paste a transcript: scored on 5 dimensions,
                           root-cause diagnosis, delta sheet, optional rewrite
  thankyou                 Draft a strong follow-up note
  debrief                  Structured debrief after a rejection

TRACK AND CLOSE OUT
  progress                 Trends, stagnation, what to drill next
  negotiate                Offer negotiation scripts and fallback language
  reflect                  Retrospective when your search is done

SCORING: substance, structure, relevance, credibility, differentiation (1-5)
TIP: you can ask "rewrite my answer to <question>" any time.
```

After the menu:
- If `coaching_state.md` does not exist: "Start with `kickoff`."
- If it exists: one line, "Suggested next: `<command>`" based on timeline (interview soon → `prep`, no stories → `stories`, transcript available → `analyze`, locked drill with passed predecessor → `practice`).
