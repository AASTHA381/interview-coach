# Interview Coach

An AI interview coach that scores your answers on evidence, diagnoses why they lose points, and tracks your progress across your whole job search. It covers company research, prep briefs, story mining, drills, mock interviews, transcript analysis, thank-you notes, negotiation scripts, rejection debriefs and a final retrospective.

This repo has two versions of the same coach:

| Folder | What it is | Needs |
|---|---|---|
| [`app/`](./app) | macOS desktop app (Electron). Resume and job-description upload (PDF, DOCX, scans via OCR), persistent progress, free-tier friendly. | A free Groq or Gemini API key |
| [`vscode-version/`](./vscode-version) | The same coaching instructions as plain markdown for an AI agent in a folder (GitHub Copilot, Claude Code, etc.). | An agent that can read and write files |

Start with the app: see [`app/README.md`](./app/README.md) for setup, build and data/privacy notes.

## How it works

Every message you send goes through the same loop: route the keyword, build a prompt from the coach's rules plus *your* documents and saved progress, call the AI, then merge any progress updates back into your saved file.

```mermaid
flowchart TD
    U(["You type a command or reply"]) --> R{"Router: which command?"}
    R -->|"help"| H["Local reply: command menu<br/>(no AI call)"]
    R -->|"not set up yet"| G["Local reply: run kickoff first<br/>(no AI call)"]
    R -->|"command or reply"| P1

    subgraph BUILD ["Build the prompt"]
        P1["Core coaching rules"] --> P2["Reference: rubric, root causes,<br/>drills, principles"]
        P2 --> P3["Instructions for the active command"]
        P3 --> P4["Your documents: resume + job description<br/>(only for commands that use them)"]
        P4 --> P5["Saved progress: coaching_state.md"]
    end

    P5 --> B{"Fits the token budget?"}
    B -->|"Too long"| E["Ask you to shorten the message"]
    B -->|"Yes (oldest turns trimmed)"| A["AI provider: Groq or Gemini<br/>streams the reply"]
    A -->|"rate limit"| RT["Wait, then retry"] --> A
    A -->|"model not available to your key"| FB["Try a fallback model"] --> A
    A --> V{"Reply ends with a<br/>state_update block?"}
    V -->|"No"| D["Show the reply<br/>(you answer, and the loop repeats)"]
    V -->|"Yes"| M["Merge only the changed sections<br/>into your saved progress"]
    M --> BK["Back up the previous file"] --> W[("Write coaching_state.md")]
    W --> D
```

### Resume and job descriptions

Documents are read on your Mac, condensed once so they fit free-tier limits, and stored locally. Scans and photos go through macOS text recognition.

```mermaid
flowchart LR
    F["Resume or job description<br/>PDF, DOCX, TXT, image, or pasted text"] --> T{"Readable text<br/>in the file?"}
    T -->|"Yes"| X["Extract text"]
    T -->|"No: scan or photo"| O["macOS Vision OCR<br/>(offline)"] --> X
    X --> C["Condense with the AI<br/>into a short, factual digest"]
    C --> S[("docs.json on your Mac")]
    S --> Q["Used in prompts for<br/>prep, mock, stories, ..."]
```

## What your progress looks like

Every scored answer (from `analyze`, `practice` and `mock`) is saved with a rating on five dimensions, plus the score you gave yourself *before* seeing it. Two trends matter most.

> The charts below use **sample numbers** to show the idea. They are not real results, and they are drawn from your saved progress file rather than rendered by the app.

**Score trend** is the session average (1 to 5). It should climb as you drill your bottleneck.

```mermaid
%%{init: {"themeVariables": {"xyChart": {"plotColorPalette": "#4f46e5"}}}}%%
xychart-beta
    title "Sample: session average score (1 = missing, 5 = interview-winning)"
    x-axis ["Mock 1", "Analyze 1", "Ladder 1", "Mock 2", "Analyze 2", "Mock 3"]
    y-axis "Average score" 1 --> 5
    line [2.6, 2.9, 3.1, 3.4, 3.6, 3.9]
```

**Self-assessment gap** is your own rating minus the actual average. Above zero means you overrate your answers; below zero means you underrate them. The goal is a gap that shrinks toward zero, because that is the self-awareness that carries into the real interview.

```mermaid
%%{init: {"themeVariables": {"xyChart": {"plotColorPalette": "#0d9488"}}}}%%
xychart-beta
    title "Sample: self-assessment gap (your rating minus actual average)"
    x-axis ["Mock 1", "Analyze 1", "Ladder 1", "Mock 2", "Analyze 2", "Mock 3"]
    y-axis "Gap (points)" -1 --> 2
    bar [1.4, 1.2, 0.8, 0.5, 0.3, 0.1]
```

## Privacy

Your progress file, resume, job descriptions and API keys are never part of this repo. The app stores them on your machine and the `.gitignore` excludes them. The text you chat is sent to the AI provider you choose.
