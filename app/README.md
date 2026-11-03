# Interview Coach (desktop app)

A macOS desktop app version of the AI Interview Coach. Same coach as the instruction-file project in `../InterviewCoach`, but it runs on its own: no VS Code, no paid subscription. You paste a free API key once.

## Use it

1. Open **Interview Coach** from Applications (or Spotlight).
2. In **Settings**, pick an engine and paste a free API key:
   - **Groq** (default): key at https://console.groq.com/keys. Default model `openai/gpt-oss-120b` (Groq retired the older Llama 3.x models). The free plan allows only about 8K tokens per minute, so the app sends compact prompts, trims old chat turns, caps reply length, and retries automatically when a rate limit is hit. Very long messages (for example a full interview transcript) are rejected with a hint to paste only the 4-6 key questions and answers.
   - **Google Gemini** (optional, larger limits, web search for `research` and `prep`): key at https://aistudio.google.com/apikey. Default model `gemini-3.6-flash`. Google restricted `gemini-2.5-flash` to accounts that already used it, so new keys fail on it; the app migrates old settings and automatically tries `gemini-3.5-flash-lite` and `gemini-3.1-flash-lite` if a model is not available to your key.
3. Click **Test connection**, then **Save**.
4. Click **📄 Resume & JDs** and add your resume (PDF, DOCX, TXT, MD, or paste). The coach condenses it, summarizes your background, and suggests stories from it. Add a job description per company the same way, then run `prep [company]`.
5. Click **Start setup (kickoff)** and answer the six questions. Then use the commands on the left or type them.

If macOS blocks the first launch: right-click the app, choose Open, then Open.

## Where your data lives

Everything stays on this Mac in `~/Library/Application Support/interview-coach/`:
- `coaching_state.md`: your stories, scores, patterns and progress (use **Show progress file**)
- `chat.json`: current conversation
- `backups/`: the last 15 versions of the state file
- `settings.json`: provider/model and your API key, encrypted with the macOS Keychain

Your messages and progress are sent to the AI provider you choose in order to get replies. Don't paste anything you wouldn't send to that provider.

## How it works

The app routes your typed keyword to the matching instruction file in `prompts/commands/`, adds the shared references (`prompts/reference/`) and your saved state, and streams the model's reply. The model ends a turn with a small `<state_update>` patch containing only the changed sections; the app merges it into your progress file (replacing, appending or updating story/company entries as appropriate), backs up the previous version, and hides the patch from the chat. On Groq the app uses the compact prompts in `prompts/compact/`.

## Develop

```
npm install
npm start          # run in development
npm test           # unit tests
npm run dist:mac   # compiles the OCR helper (needs Xcode command line tools) and builds dist/mac-arm64/Interview Coach.app
```

If `npm install` leaves Electron without its binary, run `node node_modules/electron/install.js`.

To change coaching behavior, edit the files in `prompts/` and rebuild.
