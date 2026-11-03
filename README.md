# Interview Coach

An AI interview coach that scores your answers on evidence, diagnoses why they lose points, and tracks your progress across your whole job search. It covers company research, prep briefs, story mining, drills, mock interviews, transcript analysis, thank-you notes, negotiation scripts, rejection debriefs and a final retrospective.

This repo has two versions of the same coach:

| Folder | What it is | Needs |
|---|---|---|
| [`app/`](./app) | macOS desktop app (Electron). Resume and job-description upload (PDF, DOCX, scans via OCR), persistent progress, free-tier friendly. | A free Groq or Gemini API key |
| [`vscode-version/`](./vscode-version) | The same coaching instructions as plain markdown for an AI agent in a folder (GitHub Copilot, Claude Code, etc.). | An agent that can read and write files |

Start with the app: see [`app/README.md`](./app/README.md) for setup, build and data/privacy notes.

## Privacy

Your progress file, resume, job descriptions and API keys are never part of this repo. The app stores them on your machine and the `.gitignore` excludes them. The text you chat is sent to the AI provider you choose.
