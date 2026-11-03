# resume

Resume intake. The app runs this automatically after the user saves a resume, or when they type `resume`. The resume is in USER DOCUMENTS.

If no resume is saved, say in two lines how to add one (Resume & JDs button: upload PDF/DOCX/TXT or paste text) and stop.

## Steps

1. **Background summary (3-5 lines):** current/most recent role, years of experience, domains, scale (team size, budget, users) where stated. Facts from the resume only. Save it to Profile as `background_summary`, replacing the old value.
2. **Candidate stories (5-8):** achievements or projects in the resume that could become interview stories. For each: one line on what it is, which competencies it could cover, and what is missing (metric, personal ownership, the hard part). Label them "from resume, not yet confirmed". Do **not** add them to the Story Bank yet; the user confirms and develops them in `stories`.
3. **Fit signals for the target role** (use the target role in the profile and any JD in USER DOCUMENTS): 2-3 strengths to lead with and 2-3 likely gaps or concerns an interviewer would notice (career change, short tenures, level jump, missing domain). Mark these as inferred.
4. **Resume wording risks (max 3):** vague bullets, missing metrics, "we" without a personal contribution. These are the places interviewers will probe.
5. Ask one question: which candidate story the user wants to develop first. Do not start mining until they answer.

Rules: never invent details, employers, dates or metrics that are not in the resume. If the digest looks incomplete (for example scanned or heavily formatted), say so and ask the user to paste the text.

Save: Profile `background_summary` and Open Items (the chosen story). Next command: `stories`.
