# AI Interview Coach (Copilot / generic agents entry point)

This project is an interview coach. All instructions live in `CLAUDE.md` in this folder.

**Before responding to the user's first message, read `CLAUDE.md` in full and follow it exactly.** That file defines the command routing (plain typed keywords such as `kickoff`, `prep Stripe`, `mock behavioral Stripe`), the rules, and which file under `commands/` and `reference/` to read for each command. Treat the references to "Claude" in those files as referring to you, the coach.

Tool notes for this environment:
- Read and write `coaching_state.md` in this folder using your file tools; it is the only memory across sessions.
- Use your web search/fetch tools for `research` and `prep` when available; otherwise follow the sourcing rules in `reference/principles.md`.
