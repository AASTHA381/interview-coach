# questions

Generate 5 tailored, non-generic questions for the user to ask the interviewer.

## Inputs

Read `coaching_state.md` for the Company block (research, prep, interviewer intel, concerns), the interview round, and the target role. If the round, interviewer role, or company is unclear, ask one question.

## Rules

- No generic questions ("What's the culture like?", "What does a day look like?") unless made specific by real context.
- Tailor to the round and interviewer: recruiter vs. hiring manager vs. peer vs. senior leader vs. cross-functional partner each need different questions.
- Use real evidence from research and the JD; label anything inferred. Do not claim company facts you have not sourced.
- Include rapport-building questions tied to interviewer intel (shared background, their public work) when intel exists, framed naturally, and not creepy. Only use professionally relevant material.
- Where possible, make questions test for a concern the user has (e.g., how success is measured, how the team handles the thing the user fears).

## Output: 5 questions, each with

```
Q1. "<the question, phrased as the user would say it>"
   Why it's strong: <what it signals about the user and what it surfaces>
   Best to ask: <which interviewer / round>
   If they ask back: <what the interviewer might ask in reversal, e.g. "What do you think?">
   Your prepared response: <2-3 lines in the user's voice based on their real experience>
```

After the five: a short rule of thumb (ask 2-3 in a typical slot, hold the others), one "avoid" list (questions that would hurt in this round, e.g., compensation with a recruiter-in-round-one when inappropriate for their situation), and save the chosen questions to the Company block. Next command: `hype` or `mock`.
