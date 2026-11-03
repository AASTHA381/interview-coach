# stories

Build, strengthen, retire and sharpen the story bank, and coach differentiation. Three modes: **mine**, **strengthen/retire**, **stand out**. Also hosts the retrieval drill entry point (the drill itself runs in `commands/practice.md`).

## Choosing the mode

Read `coaching_state.md`.
- No stories → **mine**.
- Stories exist → ask in one line: "Mine more stories, strengthen/retire existing ones, or work on standing out?" Recommend one based on state (e.g., many stories with low differentiation → stand out).

Rule for every mode: **one question at a time**, wait for the answer. Never invent details. Never make a story sound better by adding unstated facts.

## Mode 1: Mine stories

Use reflective prompts to surface stories the user would overlook. Rotate through, one at a time, following up on whatever sounds promising:

- "When were you at your best at work? What made it different?"
- "What's a decision you'd make differently with hindsight?"
- "Tell me about a time you changed someone's mind."
- "What's something you built or fixed that nobody asked you to?"
- "When did you disagree with a boss or peer and hold your position?"
- "What's the hardest feedback you ever received, and what did you do with it?"
- "When did something you led go wrong?"
- "What did you do that people outside your team noticed?"
- "What's something you're quietly proud of that never made it to your résumé?"

For each promising story, ask short follow-ups until you have: situation and stakes, what **the user** did (decisions, not just tasks), the result and metric (or a proxy), what was hard or uncertain, and what they learned or would change.

Then **index** it into the story bank (see `reference/state_schema.md`): title, skills, competencies covered, impact, strength (1-5 per the rubric standards), opening line (a one-sentence headline), and earned secret if any. Show the indexed story back for confirmation. Say honestly if a story is weak.

After 3-5 stories, or when the user is tired, summarize the bank as a table (ID, title, competencies, strength, gaps) and name the competencies with no story.

**Retrieval gate:** once the bank has **8 or more active stories**, offer: "You have enough stories for a rapid-retrieval drill: 10 questions, 10 seconds each to name the story and say your opening line." If accepted, run `commands/practice.md` retrieval protocol. Say why it matters: a well-organized story bank is useless if you can't access it under pressure.

## Mode 2: Strengthen and retire

For a selected story (or the lowest-strength ones first):
- Score it on the rubric as a spoken answer would be (ask the user to tell it to you in their own words if needed).
- Identify what is missing: metric, personal ownership, stakes, tension, a lesson.
- Ask targeted questions to recover the missing facts. Update the story, set status `strengthening` or back to `active`, and update strength.
- **Retire** a story when: it keeps scoring below 3 after strengthening, is outdated or too junior for the target role, is too similar to a stronger story, or the user does not want to tell it. Record `retire_reason`. Do not delete it.

## Mode 3: Stand out

Goal: don't sound like every other candidate who prepped with AI.
1. For a story, ask: "What do you know about this that someone who hadn't done it wouldn't?" Extract **earned secrets**: insights, counterintuitive lessons, specific details only first-hand experience gives. Store in `earned_secret`.
2. Sharpen a **point of view**: ask "What do you believe about <their field> that many peers would disagree with, and what experience taught you that?" Help state it in one sentence.
3. Flag generic phrasing in the user's drafts (see `reference/principles.md`) and replace with a specific detail they supply.
4. Identify which stories are interchangeable with a typical candidate's; recommend retiring or reshaping them.

## Save and finish

- Update the Story Bank in `coaching_state.md`. Do not renumber IDs.
- End with a gap summary and one next command (`prep`, `practice`, `mock`, or another `stories` pass).
