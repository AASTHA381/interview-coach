# AI Interview Coach

A project of instruction files that turns an AI agent (GitHub Copilot, Claude Code, etc.) into a rigorous interview coach. It is a set of instruction files plus a persistent `coaching_state.md` that tracks your stories, scores, patterns and progress across sessions.

## What it does

1. Scores your interview answers on five dimensions, based on what you actually said
2. Runs quick company research briefs (culture, interview style, fit)
3. Builds company-specific prep: predicted questions, story mapping, format guidance, likely concerns, interviewer intelligence cards
4. Runs mock interviews (4-6 questions, no feedback until the end) and eight gated drills
5. Mines your experience for stories you didn't know you had
6. Helps you stand out from other candidates who prepped with AI
7. Strengthens weak stories and retires ones that aren't landing
8. Debriefs rejections
9. Rewrites your weakest answers side by side with the original
10. Tracks your self-assessment accuracy over time
11. Coaches post-offer negotiation with scripts and fallback language

## Setup

The instructions are plain markdown, so any agent that can read and write files in this folder works.

- **GitHub Copilot CLI:** `cd` into this folder, run `copilot`. It loads `AGENTS.md`, which points to `CLAUDE.md`. 
- **Copilot in VS Code:** open this folder, switch Chat to Agent mode. `AGENTS.md` is picked up automatically (setting `chat.useAgentsMdFile`). If it is not, start with: "Read CLAUDE.md in full and follow it."
- **Claude Code:** run `claude` in this folder; it loads `CLAUDE.md` automatically.
- **Other tools:** start the session with "Read CLAUDE.md in full and follow it."

1. Open the folder with one of the tools above.
2. If the coach does not respond as a coach, say: "Read AGENTS.md and CLAUDE.md and follow them."
3. Type `kickoff`. Claude asks six questions, one at a time (about 5 minutes), and creates `coaching_state.md`.
4. Type `help` any time for the command list.

## Commands

Type these as plain words (no slash).

| Command | Purpose |
|---|---|
| `kickoff` | Set up; creates `coaching_state.md` |
| `help` | Command menu |
| `research [company]` | Quick brief: culture, interview style, fit |
| `prep [company]` | One-page prep brief + interviewer cards |
| `analyze` | Paste a transcript; scored, diagnosed, delta sheet, optional rewrite |
| `stories` | Mine, strengthen, retire stories; stand-out coaching |
| `practice` | Next drill; or `practice ladder / pushback / pivot / gap / role / panel / stress / retrieval` |
| `mock [format] [company]` | Full mock interview, feedback at the end |
| `concerns` | Anticipate interviewer concerns |
| `questions` | 5 tailored questions to ask |
| `progress` | Trends, stagnation, what to drill next |
| `hype` | 60s reel, 3x3 sheet, warm-up, recovery scripts |
| `thankyou` | Draft a follow-up note |
| `negotiate` | Offer negotiation scripts |
| `debrief` | Structured debrief after a rejection |
| `reflect` | Retrospective when your search is over |

## How it's organized

```
CLAUDE.md                 Entry point: persona, rules, command routing
commands/                 One instruction file per command
reference/
  principles.md           Directness levels (1-5), honesty/sourcing rules
  rubric.md               5 dimensions, 1-5 anchors
  root_causes.md          Root-cause taxonomy for diagnosis
  drills.md               Drill order, gating (avg >= 4.0 in 2 consecutive rounds)
  state_schema.md         Structure of coaching_state.md
coaching_state.md         Created by kickoff; your personal data (gitignored)
```

## Notes

- **Privacy:** `coaching_state.md` contains personal information and is gitignored. Keep it out of public repos.
- **Research:** the coach uses web search when available. LinkedIn blocks scraping, so for interviewer cards you paste the profile text (and share the URL). Claims are labeled verified or inferred, with confidence ratings.
- **Mocks** are the most limited feature, because interview formats vary and keep changing. The coach asks what you know about the format and caveats clearly.
- **Analyzing interviews:** record with a tool such as Granola and paste the transcript after typing `analyze`.
- **Editing the coach:** change thresholds, rubric anchors or root causes in `reference/`; command behavior lives in `commands/`.
