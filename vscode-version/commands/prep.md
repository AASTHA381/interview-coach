# prep [company]

Generate a one-page prep brief for a specific interview, plus optional interviewer intelligence cards.

## Inputs to gather (one question at a time, skip what you already know)

1. Company (from the command). Role and level if not in state.
2. "Attach or paste the job description if you have one." If none, say prep will be less targeted and note it in the brief.
3. Interview details: round, format (phone screen, behavioral, case, technical, panel, onsite), date, duration, who they are meeting if known.
4. "Any insider intel (referrals, things recruiters told you, what past candidates said)? It's always helpful." Optional.
5. Interviewers: "Optionally share **LinkedIn profile URLs** for your interviewers. Names alone are not reliable enough because of false-match risk." If only names are given, ask for URLs or pasted profile text. If URLs are given, try to retrieve them; LinkedIn usually blocks retrieval, so then ask the user to paste the profile text. Never fabricate profile details.

Also read `coaching_state.md` (stories, concerns, prior research on this company, interview history). If there is no prior research, do a quick one per `commands/research.md` rules.

## Output: one-page prep brief

```
PREP BRIEF: <Company> — <Role> — <Round/Format> — <Date>

1. WHAT THEY OPTIMIZE FOR
   Based on the JD and their stated values. 3-5 bullets. Label sources.

2. YOUR UNIQUE POSITIONING FOR THIS ROLE
   2-3 lines: the one thing that makes you a different candidate, drawn from the user's real background.

3. PREDICTED QUESTIONS (7-10)
   | # | Question | Competency | Best story (ID) | Gap? |
   Tag each by competency. Map to story bank IDs. Mark "GAP" where no story is strong (strength < 3 or none), and suggest `stories`/`practice gap`.

4. LIKELY CONCERNS ABOUT YOUR BACKGROUND
   Each concern with a one-sentence counter, grounded in real evidence from the user.

5. CULTURE READ
   What this company rewards in interviews (e.g., structured thinking, bias to action, written clarity). Label verified/inferred.

6. QUESTIONS FOR YOU TO ASK THEM
   5 non-generic questions (the `questions` command can go deeper).

7. FORMAT GUIDANCE
   What to expect in this round and how to pace answers. Caveat anything uncertain.
```

## Interviewer Intelligence cards (only when URLs or pasted profile text are provided)

For each interviewer produce:

```
INTERVIEWER: <Name> — <Title> — Confidence: High/Medium/Low
Source: <URL or "pasted text">
- Functional lens:
- Career path signals:
- Recent public interests:           (only from retrieved/pasted material; else "Unknown")
- What you have in common:
- Predicted focus areas:
- Rapport hooks:
- Watch-for signals: likely interviewing style from seniority and function
Story mapping: which story to deploy for this person and why   (only if a story bank exists)
```

Rules: confidence reflects how much real material you had. Predictions are labeled inferred. Do not speculate about personal life, protected characteristics, or anything not professionally relevant.

The interviewer intel flows into other commands: `mock` calibrates the persona, `hype` references the likely focus area, `thankyou` personalizes notes, and `questions` tailors rapport-building questions. Store it so those commands can use it.

## Finish

- Save to `coaching_state.md`: Company block (status `interviewing`, prep, concerns, interviewer_intel, interview entry).
- Suggest the next command: `mock [format] [company]` or `concerns`, or `stories` if the brief shows gaps.
