// refs: reference files for full prompts. compactRefs: smaller set for tight token budgets.
// docs: which of the user's saved documents the command receives (resume, job description).
const R = { resume: true };
const RJ = { resume: true, jd: true };
const COMMANDS = {
  kickoff: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], docs: R },
  help: { refs: [], compactRefs: [] },
  resume: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], docs: R },
  research: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], search: true, docs: RJ },
  prep: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], search: true, docs: RJ },
  analyze: { refs: ['rubric', 'root_causes', 'principles', 'state_schema'], compactRefs: ['rubric', 'root_causes', 'principles'], docs: { jd: true } },
  stories: { refs: ['rubric', 'principles', 'state_schema'], compactRefs: ['principles'], docs: R },
  practice: { refs: ['drills', 'rubric', 'root_causes', 'principles', 'state_schema'], compactRefs: ['drills', 'rubric', 'principles'], docs: R },
  mock: { refs: ['drills', 'rubric', 'root_causes', 'principles', 'state_schema'], compactRefs: ['rubric'], docs: RJ },
  concerns: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], docs: RJ },
  questions: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], docs: RJ },
  progress: { refs: ['rubric', 'root_causes', 'principles', 'state_schema'], compactRefs: ['principles'] },
  hype: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], docs: RJ },
  thankyou: { refs: ['principles', 'state_schema'], compactRefs: ['principles'], docs: { jd: true } },
  negotiate: { refs: ['principles', 'state_schema'], compactRefs: ['principles'] },
  debrief: { refs: ['rubric', 'root_causes', 'principles', 'state_schema'], compactRefs: ['root_causes', 'principles'] },
  reflect: { refs: ['rubric', 'root_causes', 'principles', 'state_schema'], compactRefs: ['root_causes', 'principles'] },
};

const MAX_INLINE_ARG_WORDS = 4;

// Returns { command, args } when the message starts with a command keyword, else null.
// Mid-conversation, long sentences that merely start with a keyword are treated as normal replies.
function route(text, activeCommand) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;
  const firstLine = trimmed.split('\n')[0].trim();
  const words = firstLine.split(/\s+/);
  const keyword = words[0].toLowerCase().replace(/[^a-z]/g, '');
  const rest = words.slice(1);

  if (/^rewrite\b/i.test(firstLine) && /answer/i.test(firstLine)) {
    return { command: 'analyze', args: firstLine };
  }
  if (!COMMANDS[keyword]) return null;

  if (keyword === 'help') {
    return rest.length === 0 && trimmed.split('\n').length === 1 ? { command: 'help', args: '' } : null;
  }
  const looksLikeCommand = rest.length <= MAX_INLINE_ARG_WORDS && !/[.?!]$/.test(firstLine);
  if (looksLikeCommand || !activeCommand) {
    return { command: keyword, args: rest.join(' ') };
  }
  return null;
}

module.exports = { COMMANDS, route };
