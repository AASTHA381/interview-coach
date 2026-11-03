const { app, BrowserWindow, ipcMain, dialog, shell, safeStorage, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const { route, COMMANDS } = require('./lib/router');
const { buildSystemPrompt } = require('./lib/prompt');
const { streamChat, testKey, DEFAULT_MODELS, DEPRECATED_MODELS } = require('./lib/providers');
const { visibleText, hasStateBlock, mergeStateFromResponse } = require('./lib/state');
const { LIMITS, estimateTokens, fitToBudget } = require('./lib/budget');
const { extractTextFromFile, clampText } = require('./lib/extract');

// In the packaged app the helper is unpacked next to app.asar so it can be executed.
const ocrPath = () => path.join(__dirname, 'native', 'ic-ocr').replace('app.asar' + path.sep, 'app.asar.unpacked' + path.sep);
const { DIGEST_SYSTEM, companyKey, docsForPrompt, digestInput } = require('./lib/docs');

const MAX_HISTORY_MESSAGES = 30;

const MAX_BACKUPS = 15;

let mainWindow = null;
let currentRequest = null;

const dataDir = () => app.getPath('userData');
const settingsFile = () => path.join(dataDir(), 'settings.json');
const stateFile = () => path.join(dataDir(), 'coaching_state.md');
const chatFile = () => path.join(dataDir(), 'chat.json');
const docsFile = () => path.join(dataDir(), 'docs.json');
const backupsDir = () => path.join(dataDir(), 'backups');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeFileAtomic(file, content) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, content, { mode: 0o600 });
  fs.renameSync(tmp, file);
}

function loadSettings() {
  const s = readJson(settingsFile(), {});
  const models = { ...DEFAULT_MODELS, ...(s.models || {}) };
  for (const p of Object.keys(models)) {
    if (DEPRECATED_MODELS.has(models[p])) models[p] = DEFAULT_MODELS[p];
  }
  return {
    provider: s.provider === 'gemini' ? 'gemini' : 'groq',
    models,
    keys: s.keys || {},
    webSearch: s.webSearch !== false,
  };
}

function saveSettings(settings) {
  writeFileAtomic(settingsFile(), JSON.stringify(settings, null, 2));
}

function getApiKey(provider) {
  const enc = loadSettings().keys[provider];
  if (!enc) return null;
  try {
    return safeStorage.decryptString(Buffer.from(enc, 'base64'));
  } catch (_) {
    return null;
  }
}

function readState() {
  try {
    return fs.readFileSync(stateFile(), 'utf8');
  } catch (_) {
    return null;
  }
}

function backupState() {
  if (!fs.existsSync(stateFile())) return;
  fs.mkdirSync(backupsDir(), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(stateFile(), path.join(backupsDir(), `coaching_state-${stamp}.md`));
  const files = fs.readdirSync(backupsDir()).filter((f) => f.endsWith('.md')).sort();
  for (const f of files.slice(0, Math.max(0, files.length - MAX_BACKUPS))) {
    fs.unlinkSync(path.join(backupsDir(), f));
  }
}

function writeState(content) {
  backupState();
  writeFileAtomic(stateFile(), content);
}

function loadChat() {
  const c = readJson(chatFile(), {});
  return {
    messages: Array.isArray(c.messages) ? c.messages : [],
    activeCommand: COMMANDS[c.activeCommand] ? c.activeCommand : null,
    args: typeof c.args === 'string' ? c.args : '',
    lastCompany: typeof c.lastCompany === 'string' ? c.lastCompany : '',
  };
}

function loadDocs() {
  const d = readJson(docsFile(), {});
  return {
    resume: d.resume && d.resume.text ? d.resume : null,
    jds: Array.isArray(d.jds) ? d.jds.filter((j) => j && j.company && j.text) : [],
  };
}

function saveDocs(docs) {
  writeFileAtomic(docsFile(), JSON.stringify(docs));
}

function docsSummary() {
  const d = loadDocs();
  const meta = (x) => ({ chars: x.text.length, summarized: !!x.digest, updatedAt: x.updatedAt });
  return {
    resume: d.resume ? { name: d.resume.name || 'Pasted text', ...meta(d.resume) } : null,
    jds: d.jds.map((j) => ({ id: j.id, company: j.company, ...meta(j) })),
  };
}

// One short model call that condenses a document so every later turn stays inside the free-tier token budget.
async function makeDigest(kind, text) {
  const settings = loadSettings();
  const apiKey = getApiKey(settings.provider);
  if (!apiKey) return { digest: null, reason: 'Add your API key in Settings so the document can be condensed.' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const out = await streamChat(settings.provider, {
      apiKey,
      model: settings.models[settings.provider],
      system: DIGEST_SYSTEM[kind],
      messages: [{ role: 'user', content: digestInput(text) }],
      useSearch: false,
      maxTokens: 900,
      signal: controller.signal,
      onDelta: () => {},
    });
    const digest = out.text.trim();
    return digest.length > 40 ? { digest } : { digest: null, reason: 'The model returned an empty summary.' };
  } catch (err) {
    return { digest: null, reason: controller.signal.aborted ? 'Condensing timed out.' : err.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
}

function saveChat(chat) {
  writeFileAtomic(chatFile(), JSON.stringify(chat));
}

// Merge consecutive same-role messages and make sure the history starts with a user turn.
function normalizeMessages(messages) {
  const out = [];
  for (const m of messages.slice(-MAX_HISTORY_MESSAGES)) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content;
    else out.push({ role: m.role, content: m.content });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

function helpMenuText(hasState) {
  const raw = fs.readFileSync(path.join(__dirname, 'prompts', 'commands', 'help.md'), 'utf8');
  const match = raw.match(/```\n([\s\S]*?)\n```/);
  const menu = match ? '```\n' + match[1] + '\n```' : 'Type `kickoff` to begin.';
  return menu + '\n\n' + (hasState ? 'Tell me what you want to work on, or type a command.' : 'Start with `kickoff`.');
}

function send(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
}

function sourcesMarkdown(sources) {
  if (!sources || !sources.length) return '';
  const safe = sources.filter((s) => /^https?:\/\//i.test(s.uri)).slice(0, 8);
  if (!safe.length) return '';
  return '\n\n**Sources (web search)**\n' + safe.map((s) => `- [${s.title.replace(/[\[\]]/g, '')}](${s.uri})`).join('\n');
}

async function handleSend(text) {
  if (currentRequest) return { error: 'The coach is still replying.' };
  const cleaned = String(text || '').trim();
  if (!cleaned) return { error: 'Empty message.' };

  const chat = loadChat();
  const routed = route(cleaned, chat.activeCommand);
  if (routed) {
    chat.activeCommand = routed.command;
    chat.args = routed.args;
  }
  const state = readState();
  chat.messages.push({ role: 'user', content: cleaned });

  // Answered locally: no API call needed.
  const localReply = (content) => {
    chat.messages.push({ role: 'assistant', content });
    saveChat(chat);
    return { local: true, message: { role: 'assistant', content } };
  };
  if (routed && routed.command === 'help') {
    return localReply(helpMenuText(!!state));
  }
  if (!state && chat.activeCommand !== 'kickoff') {
    return localReply('You have not set up your coach yet. Type `kickoff` first (about 5 minutes).');
  }
  const docs = loadDocs();
  if (routed && routed.command === 'resume' && !docs.resume) {
    return localReply('No resume saved yet. Click **📄 Resume & JDs** in the sidebar to upload a PDF/DOCX/TXT or paste the text, then type `resume`.');
  }

  const settings = loadSettings();
  const provider = settings.provider;
  const apiKey = getApiKey(provider);
  if (!apiKey) {
    chat.messages.pop();
    return { error: 'no-key' };
  }

  const searchEnabled =
    provider === 'gemini' && settings.webSearch && !!(chat.activeCommand && COMMANDS[chat.activeCommand].search);
  const today = new Date().toISOString().slice(0, 10);
  const compact = provider === 'groq';
  const def = chat.activeCommand ? COMMANDS[chat.activeCommand] : null;
  const documents = docsForPrompt({ docs, want: def && def.docs, args: chat.args, lastCompany: chat.lastCompany, compact });
  if (documents.company) chat.lastCompany = documents.company;
  const system = buildSystemPrompt({
    command: chat.activeCommand,
    args: chat.args,
    state,
    today,
    searchEnabled,
    compact,
    documents,
  });
  const fitted = fitToBudget(system, normalizeMessages(chat.messages), provider);
  if (fitted.tooLarge) {
    chat.messages.pop();
    saveChat(chat);
    const tooMuch = estimateTokens(cleaned);
    return {
      error:
        `That message is too long for the free Groq plan (about ${tooMuch.toLocaleString()} tokens; the limit is roughly ` +
        `${Math.max(500, fitted.budget - estimateTokens(system)).toLocaleString()} per message). ` +
        'Shorten it, for example paste only the 4-6 most important questions and answers, or split it into parts.',
      restoreText: cleaned,
    };
  }

  const controller = new AbortController();
  currentRequest = controller;
  const requestId = Date.now().toString(36);
  let lastSent = '';
  let result = null;
  let stopped = false;
  let partial = '';

  try {
    result = await streamChat(provider, {
      apiKey,
      model: settings.models[provider],
      system,
      messages: fitted.messages,
      useSearch: searchEnabled,
      maxTokens: LIMITS[provider].maxOutputTokens,
      signal: controller.signal,
      onStatus: (status) => send('chat:delta', { id: requestId, text: lastSent, saving: false, status }),
      onDelta: (full) => {
        partial = full;
        const visible = visibleText(full);
        if (visible !== lastSent) {
          lastSent = visible;
          send('chat:delta', { id: requestId, text: visible, saving: hasStateBlock(full) });
        }
      },
    });
  } catch (err) {
    if (controller.signal.aborted) {
      stopped = true;
    } else {
      currentRequest = null;
      chat.messages.pop();
      saveChat(chat);
      return { error: err.message || String(err), restoreText: cleaned };
    }
  }
  currentRequest = null;

  const full = stopped ? partial : result.text;
  let display = visibleText(full);
  let stateSaved = false;
  let warning = '';

  if (!stopped && hasStateBlock(full)) {
    const merged = mergeStateFromResponse(full, state, today);
    if (merged.state) {
      writeState(merged.state);
      stateSaved = true;
    } else {
      warning = '\n\n> ⚠️ I could not save your progress this turn (the coach\'s update was incomplete). Your previous progress is unchanged. Ask me to "save my progress" to retry.';
    }
  }
  if (!stopped && result && result.sources) display += sourcesMarkdown(result.sources);
  display += warning;
  if (stopped) display += display ? '\n\n_(stopped)_' : '_(stopped)_';

  if (!display.trim()) {
    chat.messages.pop();
    saveChat(chat);
    return { error: 'The model returned an empty reply. Try again.', restoreText: cleaned };
  }

  chat.messages.push({ role: 'assistant', content: display });
  saveChat(chat);

  // A fallback model that worked becomes the saved model, so later turns skip the failed attempt.
  let modelUsed = null;
  if (!stopped && result && result.model && result.model !== settings.models[provider]) {
    settings.models[provider] = result.model;
    saveSettings(settings);
    modelUsed = result.model;
  }
  return { id: requestId, message: { role: 'assistant', content: display }, stateSaved, modelUsed };
}

function registerIpc() {
  ipcMain.handle('app:init', () => {
    const settings = loadSettings();
    const chat = loadChat();
    return {
      provider: settings.provider,
      models: settings.models,
      hasKey: { gemini: !!settings.keys.gemini, groq: !!settings.keys.groq },
      webSearch: settings.webSearch,
      encryptionAvailable: safeStorage.isEncryptionAvailable(),
      stateExists: !!readState(),
      docs: docsSummary(),
      messages: chat.messages,
      activeCommand: chat.activeCommand,
      version: app.getVersion(),
    };
  });

  ipcMain.handle('settings:save', (_e, input) => {
    const settings = loadSettings();
    if (input.provider === 'gemini' || input.provider === 'groq') settings.provider = input.provider;
    if (input.models) {
      for (const p of ['gemini', 'groq']) {
        const m = String(input.models[p] || '').trim();
        if (m && /^[\w.\-:/]+$/.test(m)) settings.models[p] = m;
      }
    }
    if (typeof input.webSearch === 'boolean') settings.webSearch = input.webSearch;
    if (input.apiKey && input.apiKeyProvider) {
      if (!safeStorage.isEncryptionAvailable()) {
        return { error: 'Secure key storage is unavailable on this system.' };
      }
      const key = String(input.apiKey).trim();
      settings.keys[input.apiKeyProvider] = safeStorage.encryptString(key).toString('base64');
    }
    saveSettings(settings);
    return { ok: true, hasKey: { gemini: !!settings.keys.gemini, groq: !!settings.keys.groq } };
  });

  ipcMain.handle('settings:clearKey', (_e, provider) => {
    const settings = loadSettings();
    delete settings.keys[provider];
    saveSettings(settings);
    return { ok: true, hasKey: { gemini: !!settings.keys.gemini, groq: !!settings.keys.groq } };
  });

  ipcMain.handle('settings:test', async (_e, input) => {
    const settings = loadSettings();
    const provider = input.provider === 'groq' ? 'groq' : 'gemini';
    const apiKey = (input.apiKey && String(input.apiKey).trim()) || getApiKey(provider);
    if (!apiKey) return { ok: false, error: 'Enter an API key first.' };
    const model = (input.model && String(input.model).trim()) || settings.models[provider];
    try {
      const r = await testKey(provider, apiKey, model);
      return r.ok ? { ok: true, model: r.model } : { ok: false, error: 'No response from the model.' };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  });

  ipcMain.handle('chat:send', (_e, text) => handleSend(text));
  ipcMain.handle('chat:stop', () => {
    if (currentRequest) currentRequest.abort();
    return { ok: true };
  });
  ipcMain.handle('chat:new', () => {
    if (currentRequest) currentRequest.abort();
    saveChat({ messages: [], activeCommand: null, args: '', lastCompany: '' });
    return { ok: true };
  });

  ipcMain.handle('docs:list', () => docsSummary());

  ipcMain.handle('docs:pick', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Documents and scans', extensions: ['pdf', 'docx', 'txt', 'md', 'rtf', 'png', 'jpg', 'jpeg', 'heic', 'tif', 'tiff'] }],
    });
    if (canceled || !filePaths.length) return { canceled: true };
    try {
      const { text, truncated, ocr } = await extractTextFromFile(filePaths[0], { ocrPath: ocrPath() });
      return { name: path.basename(filePaths[0]), text, truncated, ocr };
    } catch (err) {
      return { error: err.message || String(err) };
    }
  });

  ipcMain.handle('docs:save', async (_e, input) => {
    const kind = input && input.kind === 'jd' ? 'jd' : 'resume';
    const { text, truncated } = clampText(input && input.text);
    if (text.length < 40) return { error: 'That looks too short. Paste the full text.' };
    const company = String((input && input.company) || '').trim().slice(0, 80);
    if (kind === 'jd' && !companyKey(company)) return { error: 'Enter the company name for this job description.' };

    const docs = loadDocs();
    const entry = { text, digest: null, name: String((input && input.name) || '').slice(0, 120), updatedAt: new Date().toISOString() };
    const { digest, reason } = await makeDigest(kind, text);
    entry.digest = digest;

    if (kind === 'resume') {
      docs.resume = entry;
    } else {
      const id = companyKey(company).replace(/\s+/g, '-');
      docs.jds = docs.jds.filter((j) => j.id !== id);
      docs.jds.push({ id, company, ...entry });
    }
    saveDocs(docs);
    return {
      ok: true,
      kind,
      company,
      truncated,
      summarized: !!digest,
      warning: digest ? '' : `Saved, but not condensed (${reason}). The coach will use a shortened version.`,
      summary: docsSummary(),
    };
  });

  ipcMain.handle('docs:remove', (_e, input) => {
    const docs = loadDocs();
    if (input && input.kind === 'resume') docs.resume = null;
    else if (input && input.kind === 'jd') docs.jds = docs.jds.filter((j) => j.id !== input.id);
    saveDocs(docs);
    return docsSummary();
  });

  ipcMain.handle('state:info', () => ({ exists: !!readState(), path: stateFile() }));
  ipcMain.handle('state:reveal', () => {
    if (fs.existsSync(stateFile())) shell.showItemInFolder(stateFile());
    else shell.openPath(dataDir());
    return { ok: true };
  });
  ipcMain.handle('state:export', async () => {
    const content = readState();
    if (!content) return { error: 'Nothing to export yet. Run kickoff first.' };
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: 'coaching_state.md',
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });
    if (canceled || !filePath) return { ok: false };
    fs.writeFileSync(filePath, content);
    return { ok: true };
  });
  ipcMain.handle('state:reset', async () => {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Cancel', 'Reset everything'],
      defaultId: 0,
      cancelId: 0,
      message: 'Reset all coaching progress?',
      detail: 'This removes your stories, scores and profile. A backup of the current file is kept in the app data folder.',
    });
    if (response !== 1) return { ok: false };
    if (currentRequest) currentRequest.abort();
    backupState();
    if (fs.existsSync(stateFile())) fs.unlinkSync(stateFile());
    saveChat({ messages: [], activeCommand: null, args: '', lastCompany: '' });
    return { ok: true };
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 820,
    minHeight: 560,
    title: 'Interview Coach',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f1220',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  const openExternal = (url) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
  };
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      openExternal(url);
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function buildMenu() {
  const template = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(() => {
    registerIpc();
    buildMenu();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
