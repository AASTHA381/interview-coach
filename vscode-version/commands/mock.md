# mock [format] [company]

Run a full mock interview of **4-6 questions**. Unlike drills (single skills), a mock tests the whole package.

## Limitation to state up front (one or two lines)

This is the most limited feature of the coach. Interview processes differ across companies and keep changing, and no single mock covers all types. The coach asks for as much information as it can and caveats clearly where it is guessing.

## Setup (one question at a time, skip what you know)

1. Format: behavioral, product sense, analytical, technical/role-specific, case, panel, hiring manager, or other. If not given in the command, ask.
2. Company and role. Pull from state if available.
3. What they know about the actual format: duration, number of interviewers, what they've been told, any known question styles. Say you will treat these as inputs, not facts.
4. Interviewer persona: use stored interviewer intel from `prep` if available, else pick a sensible default persona from `reference/drills.md`. Tell the user which persona you chose.
5. Confirm the rules in two lines: 4-6 questions, one at a time, **no feedback until the end**.

## Running the mock

- Open in character as the interviewer, briefly. Then ask questions **one at a time**.
- Choose 4-6 questions (a number that fits the format and any stated duration): mix competencies from the company's predicted questions (from prep, if any) and include **at least one question targeting a known gap in the story bank** (a competency with no story, or a story with strength < 3).
- Ask natural follow-ups when the answer warrants it, as a real interviewer would; they count toward the 4-6 only if you replace a planned question. Do **not** give feedback, praise, hints, or scores during the mock. Neutral acknowledgements only ("Thanks, let's move on.").
- If the user breaks character to ask for help, answer briefly, note it, and return to the mock.
- Track: question, competency, story used, rough length, interruptions or recoveries, energy and clarity trends. Do not reveal this during the mock.

## After the last question

1. **Self-assessment first:** "How do you think that went? What felt strong or off? Rate yourself 1-5." Record it.
2. **Score each answer** on the five dimensions with quotes, per `reference/rubric.md`.
3. **Holistic arc feedback** (the heart of a mock):
   - How energy and clarity shifted across the questions
   - Whether stories were reused, and whether the reuse hurt
   - How the user adapted to interviewer cues, follow-ups and interruptions
   - Strongest and weakest moments across the whole session
   - Whether the user hit the gap question and how they handled it
4. Self-assessment gap, primary bottleneck and root-cause diagnosis (formats in `reference/root_causes.md`).
5. **One specific change** to carry into the next mock or real interview, plus the 2-3 most valuable follow-up actions (e.g., `practice pushback`, `stories`).

## Save

Append to Session Log and Scores; update Patterns, Story Bank strength notes, and Company interview entry (mock). Mark the session as `mock`, not a real interview.

Next command: whichever drill or story work the diagnosis points to.
