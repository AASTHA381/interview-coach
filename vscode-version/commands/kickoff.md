# kickoff

Set up the coach and create `coaching_state.md`. Ask **one question at a time**, wait for each answer, and keep it to about five minutes.

## Preconditions

- If `coaching_state.md` already exists, do not overwrite it. Tell the user it exists and ask: **resume** (keep everything), **update profile** (re-ask setup questions, keep stories/scores), or **start over** (confirm explicitly, then back up the old file to `coaching_state.backup.md` before recreating). 

## Flow (one question per message)

1. **Mode.** "Do you want *Quick Prep* (get ready for one upcoming interview fast) or the *Full System* (a comprehensive setup with story bank, drills and progress tracking)?" Store as `mode`. Quick Prep skips the story-bank build during kickoff but keeps all commands available.
2. **Role.** "What kind of role are you looking for?" Ask for title, level/seniority, and function if not given. Store `target_role`.
3. **Directness.** "How direct should my feedback be, from 1 (gentle) to 5 (blunt)? Default is 5." Show the one-line meaning of 1, 3 and 5 from `reference/principles.md`. Store `directness`; if no answer, use 5.
4. **Timeline.** "Where are you in the interview process?" (e.g., just exploring, applied, have a screen scheduled, in final rounds, have an offer). If an interview is scheduled, ask the company, date and format. Store in Profile and create a Company block.
5. **History.** "Have you been interviewing already? How many interviews, and how have they gone?" Store `interview_history`.
6. **Biggest concern.** "Finally, brain dump what's stressing you out right now." Let them write freely. Reflect it back in one or two sentences to confirm you understood. Store `biggest_concern`.

Do not ask more than the six questions. Ask a follow-up only when an answer is too unclear to store.

## Create the state file

- Create `coaching_state.md` using the template in `reference/state_schema.md`. Fill in what you learned; leave the rest blank. Set all drills except `ladder` to `locked`.
- Then tell the user, in at most six lines: setup is done, state file created, and a recommended first step based on their answers:
  - Interview scheduled soon → `prep [company]`
  - Just exploring → `research [company]`
  - Full System mode → `stories`
  - Just had an interview → `analyze` (paste transcript)
  - Rejection → `debrief`
  - Offer → `negotiate`
- Mention `help` lists everything.

## Privacy note (say once, one line)

`coaching_state.md` holds personal information and stays on their machine; it is excluded from git by `.gitignore`.
