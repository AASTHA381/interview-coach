const OPEN_TAG = '<state_update>';
const CLOSE_TAG = '</state_update>';

const APPEND_SECTIONS = new Set(['session log', 'scores', 'self-awareness notes']);
const KEYED_SECTIONS = new Set(['profile', 'growth focus', 'patterns']);
const TABLE_SECTIONS = new Set(['drill progress']);
const ENTRY_SECTIONS = { 'story bank': 'story', companies: 'company' };

const DRILLS = ['ladder', 'pushback', 'pivot', 'gap', 'role', 'panel', 'stress', 'retrieval'];

function initialState(today) {
  const drillRows = DRILLS.map((d, i) => `| ${d} | 0 | - | 0 | ${i === 0 ? 'unlocked' : d === 'retrieval' ? 'locked (needs 8 stories)' : 'locked'} |`);
  return [
    '# Coaching State',
    '',
    `last_updated: ${today}`,
    'mode:',
    '',
    '## Profile',
    '',
    '## Story Bank',
    '',
    '## Companies',
    '',
    '## Session Log',
    '',
    '## Scores',
    '| Date | Context | Substance | Structure | Relevance | Credibility | Differentiation | Avg | Self | Gap |',
    '|---|---|---|---|---|---|---|---|---|---|',
    '',
    '## Patterns',
    '',
    '## Drill Progress',
    '| Drill | Rounds | Last key-dim avg | Consecutive passes | Status |',
    '|---|---|---|---|---|',
    ...drillRows,
    '',
    '## Growth Focus',
    '',
    '## Self-Awareness Notes',
    '',
    '## Open Items',
    '',
  ].join('\n');
}

// Text shown to the user: everything before the update block, including while it streams.
function visibleText(full) {
  let idx = full.indexOf(OPEN_TAG);
  if (idx === -1) {
    for (let len = OPEN_TAG.length - 1; len > 0; len--) {
      if (full.endsWith(OPEN_TAG.slice(0, len))) {
        idx = full.length - len;
        break;
      }
    }
  }
  let out = idx === -1 ? full : full.slice(0, idx);
  out = out.replace(/\n?```[a-zA-Z]*\s*$/, '');
  return out.trimEnd();
}

function hasStateBlock(full) {
  return full.includes(OPEN_TAG);
}

function extractUpdate(full) {
  const start = full.indexOf(OPEN_TAG);
  if (start === -1) return { update: null };
  const end = full.indexOf(CLOSE_TAG, start);
  if (end === -1) return { update: null, reason: 'incomplete' };
  let body = full.slice(start + OPEN_TAG.length, end).trim();
  body = body.replace(/^```[a-zA-Z]*\s*\n/, '').replace(/\n```\s*$/, '').trim();
  if (!/^##\s+\S/m.test(body)) return { update: null, reason: 'invalid' };
  return { update: body };
}

function trimBlank(lines) {
  let a = 0;
  let b = lines.length;
  while (a < b && !lines[a].trim()) a++;
  while (b > a && !lines[b - 1].trim()) b--;
  return lines.slice(a, b);
}

// Splits markdown into a preamble and ordered "## Name" sections.
function parseSections(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const preamble = [];
  const sections = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      current = { name: m[1], lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  return { preamble, sections: sections.map((s) => ({ name: s.name, body: trimBlank(s.lines) })) };
}

// Splits a section body into leading text and "### " entries.
function parseEntries(bodyLines) {
  const head = [];
  const entries = [];
  let current = null;
  for (const line of bodyLines) {
    if (/^###\s+/.test(line)) {
      current = { heading: line.replace(/^###\s+/, '').trim(), lines: [line] };
      entries.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      head.push(line);
    }
  }
  return { head: trimBlank(head), entries: entries.map((e) => ({ heading: e.heading, lines: trimBlank(e.lines) })) };
}

function entryKey(kind, heading) {
  if (kind === 'story') {
    const m = heading.match(/^(S\d+)\b/i);
    if (m) return m[1].toUpperCase();
  }
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function mergeEntries(kind, baseBody, updateBody) {
  const base = parseEntries(baseBody);
  const upd = parseEntries(updateBody);
  const entries = [...base.entries];
  for (const e of upd.entries) {
    const key = entryKey(kind, e.heading);
    const idx = entries.findIndex((x) => entryKey(kind, x.heading) === key);
    if (idx >= 0) entries[idx] = e;
    else entries.push(e);
  }
  const out = [...base.head];
  for (const e of entries) {
    if (out.length) out.push('');
    out.push(...e.lines);
  }
  return out;
}

function mergeAppend(baseBody, updateBody) {
  const seen = new Set(baseBody.map((l) => l.trim()));
  const out = [...baseBody];
  for (const line of updateBody) {
    const t = line.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(line);
  }
  return out;
}

// "- key: value" lines replace the line with the same key; everything else is appended if new.
function mergeKeyed(baseBody, updateBody) {
  const keyOf = (l) => {
    const m = l.match(/^\s*[-*]\s*([^:]+?)\s*:/);
    return m ? m[1].toLowerCase() : null;
  };
  const out = [...baseBody];
  for (const line of updateBody) {
    if (!line.trim()) continue;
    const key = keyOf(line);
    const idx = key ? out.findIndex((l) => keyOf(l) === key) : out.findIndex((l) => l.trim() === line.trim());
    if (idx >= 0) out[idx] = line;
    else out.push(line);
  }
  return out;
}

// Table rows are matched on their first cell; header and separator rows are kept from the base.
function mergeTable(baseBody, updateBody) {
  const cell = (l) => (l.match(/^\|\s*([^|]*?)\s*\|/) || [])[1];
  const isData = (l) => /^\|/.test(l) && !/^\|\s*:?-{2,}/.test(l);
  const out = [...baseBody];
  const hasHeader = out.some((l) => /^\|/.test(l));
  for (const line of updateBody) {
    if (!/^\|/.test(line)) continue;
    if (!isData(line)) {
      if (!hasHeader) out.push(line);
      continue;
    }
    const key = (cell(line) || '').toLowerCase();
    const idx = out.findIndex((l) => isData(l) && (cell(l) || '').toLowerCase() === key);
    if (idx >= 0) out[idx] = line;
    else if (!hasHeader || (cell(line) || '').toLowerCase() !== 'drill') out.push(line);
  }
  return out;
}

function render(preamble, sections, today) {
  const pre = preamble.filter((l) => !/^last_updated:/i.test(l));
  const header = pre[0] && /^#\s/.test(pre[0]) ? pre[0] : '# Coaching State';
  const rest = pre.slice(pre[0] && /^#\s/.test(pre[0]) ? 1 : 0).filter((l) => l.trim());
  const out = [header, '', `last_updated: ${today}`, ...rest];
  for (const s of sections) {
    out.push('', `## ${s.name}`);
    if (s.body.length) out.push(...s.body);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function applyUpdate(baseText, updateText, today) {
  const base = parseSections(baseText);
  const upd = parseSections(updateText);
  const sections = base.sections.map((s) => ({ ...s }));

  for (const u of upd.sections) {
    if (!u.body.length) continue;
    const key = u.name.toLowerCase();
    const idx = sections.findIndex((s) => s.name.toLowerCase() === key);
    if (idx === -1) {
      sections.push({ name: u.name, body: u.body });
    } else if (APPEND_SECTIONS.has(key)) {
      sections[idx].body = mergeAppend(sections[idx].body, u.body);
    } else if (ENTRY_SECTIONS[key]) {
      sections[idx].body = mergeEntries(ENTRY_SECTIONS[key], sections[idx].body, u.body);
    } else if (KEYED_SECTIONS.has(key)) {
      sections[idx].body = mergeKeyed(sections[idx].body, u.body);
    } else if (TABLE_SECTIONS.has(key)) {
      sections[idx].body = mergeTable(sections[idx].body, u.body);
    } else {
      sections[idx].body = u.body;
    }
  }

  // Accept a new `mode:` value from the update's preamble.
  const modeLine = upd.preamble.find((l) => /^mode:\s*\S/i.test(l));
  const preamble = base.preamble.map((l) => (modeLine && /^mode:/i.test(l) ? modeLine : l));
  return render(preamble, sections, today);
}

// Merges the model's update into the saved state. Returns { state } or { state: null, reason }.
function mergeStateFromResponse(full, previousState, today) {
  const { update, reason } = extractUpdate(full);
  if (!update) return { state: null, reason };
  const base = previousState && previousState.trim() ? previousState : initialState(today);
  try {
    const merged = applyUpdate(base, update, today);
    if (!/^#\s*Coaching State/i.test(merged)) return { state: null, reason: 'invalid' };
    return { state: merged };
  } catch (_) {
    return { state: null, reason: 'invalid' };
  }
}

// Smaller copy of the state for prompts: keeps recent log/score entries only.
function compactState(state, { logLines = 6, scoreRows = 5 } = {}) {
  if (!state) return state;
  const parsed = parseSections(state);
  const sections = parsed.sections.map((s) => {
    const key = s.name.toLowerCase();
    let body = s.body;
    if (key === 'session log') {
      const items = body.filter((l) => l.trim());
      body = items.length > logLines ? ['<!-- older entries omitted -->', ...items.slice(-logLines)] : items;
    } else if (key === 'scores') {
      const table = body.filter((l) => /^\|/.test(l));
      body = table.length - 2 > scoreRows ? [...table.slice(0, 2), ...table.slice(-scoreRows)] : body;
    }
    return { name: s.name, body };
  });
  const out = [...trimBlank(parsed.preamble)];
  for (const s of sections) {
    out.push('', `## ${s.name}`);
    if (s.body.length) out.push(...s.body);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

module.exports = { visibleText, hasStateBlock, extractUpdate, applyUpdate, mergeStateFromResponse, compactState, initialState };
