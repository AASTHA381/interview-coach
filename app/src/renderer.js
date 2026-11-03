(function () {
  const COMMAND_GROUPS = [
    { title: 'Start', items: [['kickoff', ''], ['resume', ''], ['help', '']] },
    { title: 'Before an interview', items: [['research', '[company]'], ['prep', '[company]'], ['concerns', ''], ['questions', ''], ['hype', '']] },
    { title: 'Build skills', items: [['stories', ''], ['practice', ''], ['mock', '[format] [company]']] },
    { title: 'After an interview', items: [['analyze', ''], ['thankyou', ''], ['debrief', '']] },
    { title: 'Track and close out', items: [['progress', ''], ['negotiate', ''], ['reflect', '']] },
  ];

  const KEY_LINKS = {
    gemini: 'Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com/apikey</a>',
    groq: 'Get a free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a>',
  };

  const $ = (id) => document.getElementById(id);
  const chatEl = $('chat');
  const inputEl = $('input');
  const sendBtn = $('sendBtn');
  const stopBtn = $('stopBtn');

  let appState = null;
  let busy = false;
  let streamBubble = null;
  let pendingSaving = false;
  let pendingStatus = '';
  let renderQueued = false;
  let pendingText = '';

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function scrollToEnd() {
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function addMessage(role, content, extraClass) {
    const row = el('div', `msg ${role}${extraClass ? ' ' + extraClass : ''}`);
    const bubble = el('div', 'bubble');
    if (role === 'assistant' && !extraClass) bubble.innerHTML = window.renderMarkdown(content);
    else bubble.textContent = content;
    row.appendChild(bubble);
    chatEl.appendChild(row);
    scrollToEnd();
    return bubble;
  }

  function showWelcome() {
    chatEl.textContent = '';
    const box = el('div', 'welcome');
    box.appendChild(el('h1', null, 'Interview Coach'));
    box.appendChild(
      el('p', null, appState && appState.stateExists
        ? 'Welcome back. Pick a command on the left, or tell me what you want to work on.'
        : 'Your rigorous, honest interview coach. Setup takes about 5 minutes and your progress is saved on this Mac.')
    );
    if (!appState || !appState.stateExists) {
      const btn = el('button', 'cta', 'Start setup (kickoff)');
      btn.addEventListener('click', () => submit('kickoff'));
      box.appendChild(btn);
    }
    chatEl.appendChild(box);
  }

  function renderHistory(messages) {
    chatEl.textContent = '';
    if (!messages.length) return showWelcome();
    for (const m of messages) addMessage(m.role, m.content);
  }

  function updateEngineLabel() {
    const p = appState.provider;
    $('engineLabel').textContent = `${p === 'gemini' ? 'Gemini' : 'Groq'} · ${appState.models[p]}`;
  }

  function updateStatePill() {
    const pill = $('statePill');
    pill.textContent = appState.stateExists ? '✓ Progress saved on this Mac' : 'No progress saved yet';
    pill.classList.toggle('ok', !!appState.stateExists);
  }

  function setBusy(value) {
    busy = value;
    sendBtn.classList.toggle('hidden', value);
    stopBtn.classList.toggle('hidden', !value);
    inputEl.disabled = false;
  }

  function buildSidebar() {
    const nav = $('commands');
    nav.textContent = '';
    for (const group of COMMAND_GROUPS) {
      nav.appendChild(el('div', 'group-title', group.title));
      for (const [cmd, arg] of group.items) {
        const btn = el('button', 'cmd-btn');
        btn.dataset.cmd = cmd;
        btn.appendChild(el('span', null, cmd));
        if (arg) btn.appendChild(el('span', 'arg', arg));
        btn.addEventListener('click', () => {
          if (arg) {
            inputEl.value = cmd + ' ';
            inputEl.focus();
            autosize();
          } else {
            submit(cmd);
          }
        });
        nav.appendChild(btn);
      }
    }
  }

  function markActive(cmd) {
    document.querySelectorAll('.cmd-btn').forEach((b) => b.classList.toggle('active', b.dataset.cmd === cmd));
  }

  function guessCommand(text) {
    const w = text.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    return COMMAND_GROUPS.some((g) => g.items.some(([c]) => c === w)) ? w : null;
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      if (!streamBubble) return;
      streamBubble.innerHTML =
        window.renderMarkdown(pendingText) +
        (pendingStatus ? `<div class="status-line">⏳ ${pendingStatus.replace(/[<>&]/g, '')}</div>` : '') +
        (pendingSaving ? '<div class="status-line">💾 Saving your progress…</div>' : '');
      streamBubble.classList.add('typing');
      scrollToEnd();
    });
  }

  async function submit(textArg) {
    const text = (textArg != null ? textArg : inputEl.value).trim();
    if (!text || busy) return;
    if (textArg == null) {
      inputEl.value = '';
      autosize();
    }

    if (chatEl.querySelector('.welcome')) chatEl.textContent = '';
    addMessage('user', text);
    const cmd = guessCommand(text);
    if (cmd) markActive(cmd);

    setBusy(true);
    pendingText = '';
    streamBubble = addMessage('assistant', '');
    streamBubble.classList.add('typing');
    pendingSaving = false;
    pendingStatus = '';

    let res;
    try {
      res = await window.coach.send(text);
    } catch (err) {
      res = { error: err.message || String(err), restoreText: text };
    }

    const row = streamBubble.parentElement;
    streamBubble.classList.remove('typing');
    streamBubble = null;
    setBusy(false);

    if (res.error) {
      row.remove();
      if (res.error === 'no-key') {
        addMessage('assistant', 'Add your free API key in Settings to start. It takes about a minute.', 'error');
        openSettings();
      } else {
        addMessage('assistant', res.error, 'error');
      }
      if (res.restoreText && !inputEl.value) inputEl.value = res.restoreText;
      autosize();
      return;
    }

    row.querySelector('.bubble').innerHTML = window.renderMarkdown(res.message.content);
    scrollToEnd();
    if (res.modelUsed) {
      appState.models[appState.provider] = res.modelUsed;
      updateEngineLabel();
    }
    if (res.stateSaved) {
      appState.stateExists = true;
      updateStatePill();
    }
    inputEl.focus();
  }

  function autosize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 220) + 'px';
  }

  // Settings modal
  function setStatus(msg, kind) {
    const s = $('settingsStatus');
    s.textContent = msg || '';
    s.className = 'modal-status' + (kind ? ' ' + kind : '');
  }

  function syncSettingsForm() {
    const p = $('providerSelect').value;
    $('modelInput').value = appState.models[p];
    $('keyInput').value = '';
    $('keyStatus').textContent = appState.hasKey[p] ? '(saved)' : '(not set)';
    $('keyHelp').innerHTML = KEY_LINKS[p];
    $('searchRow').classList.toggle('hidden', p !== 'gemini');
  }

  function openSettings() {
    $('providerSelect').value = appState.provider;
    $('searchToggle').checked = !!appState.webSearch;
    syncSettingsForm();
    setStatus('');
    $('settingsModal').classList.remove('hidden');
  }

  function closeSettings() {
    $('settingsModal').classList.add('hidden');
  }

  async function saveSettings() {
    const provider = $('providerSelect').value;
    const key = $('keyInput').value.trim();
    const res = await window.coach.saveSettings({
      provider,
      models: { [provider]: $('modelInput').value },
      webSearch: $('searchToggle').checked,
      apiKey: key || undefined,
      apiKeyProvider: key ? provider : undefined,
    });
    if (res.error) return setStatus(res.error, 'err');
    appState.provider = provider;
    appState.models[provider] = $('modelInput').value.trim() || appState.models[provider];
    appState.webSearch = $('searchToggle').checked;
    appState.hasKey = res.hasKey;
    updateEngineLabel();
    syncSettingsForm();
    setStatus('Saved.', 'ok');
  }

  async function testConnection() {
    const provider = $('providerSelect').value;
    setStatus('Testing…');
    const res = await window.coach.testKey({
      provider,
      model: $('modelInput').value,
      apiKey: $('keyInput').value,
    });
    if (res.ok && res.model && res.model !== $('modelInput').value.trim()) {
      $('modelInput').value = res.model;
      setStatus(`Connection works with ${res.model}. Click Save to keep it.`, 'ok');
    } else {
      setStatus(res.ok ? 'Connection works.' : res.error, res.ok ? 'ok' : 'err');
    }
  }


  // Resume & JD documents
  function fmtChars(n) {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k chars` : `${n} chars`;
  }

  function docMsg(id, msg, kind) {
    const e = $(id);
    e.textContent = msg || '';
    e.className = 'doc-status' + (kind ? ' ' + kind : '');
  }

  function renderDocs() {
    const d = appState.docs;
    const r = d.resume;
    $('resumeStatus').textContent = r ? `saved · ${r.name} · ${fmtChars(r.chars)}${r.summarized ? ' · condensed' : ''}` : 'not added';
    $('resumeRemoveBtn').classList.toggle('hidden', !r);
    const list = $('jdList');
    list.textContent = '';
    for (const j of d.jds) {
      const row = el('div', 'jd-item');
      const left = el('div');
      left.appendChild(el('div', null, j.company));
      left.appendChild(el('div', 'meta', `${fmtChars(j.chars)}${j.summarized ? ' · condensed' : ''}`));
      const btn = el('button', null, 'Remove');
      btn.addEventListener('click', async () => {
        appState.docs = await window.coach.docsRemove({ kind: 'jd', id: j.id });
        renderDocs();
      });
      row.append(left, btn);
      list.appendChild(row);
    }
    const parts = [];
    if (r) parts.push('resume');
    if (d.jds.length) parts.push(`${d.jds.length} JD${d.jds.length > 1 ? 's' : ''}`);
    $('docsBadge').textContent = parts.length ? `· ${parts.join(', ')}` : '';
  }

  function openDocs() {
    renderDocs();
    docMsg('resumeMsg', '');
    docMsg('jdMsg', '');
    $('docsModal').classList.remove('hidden');
  }

  async function pickInto(textId, msgId, nameHolder) {
    const res = await window.coach.docsPick();
    if (res.canceled) return;
    if (res.error) return docMsg(msgId, res.error, 'err');
    $(textId).value = res.text;
    nameHolder.name = res.name;
    docMsg(msgId, `Loaded ${res.name}${res.ocr ? ' (scan read with text recognition, check it for typos)' : ''}${res.truncated ? ' (shortened to fit)' : ''}. Review it, then save.`, 'ok');
  }

  async function saveDoc(kind) {
    const isJd = kind === 'jd';
    const msgId = isJd ? 'jdMsg' : 'resumeMsg';
    const text = $(isJd ? 'jdText' : 'resumeText').value;
    const btn = $(isJd ? 'jdSaveBtn' : 'resumeSaveBtn');
    btn.disabled = true;
    docMsg(msgId, 'Saving and condensing… (up to a minute on the free tier)');
    const company = isJd ? $('jdCompany').value : '';
    const res = await window.coach.docsSave({ kind, text, company, name: (isJd ? jdFile : resumeFile).name || 'Pasted text' });
    btn.disabled = false;
    if (res.error) return docMsg(msgId, res.error, 'err');
    appState.docs = res.summary;
    renderDocs();
    docMsg(msgId, res.warning || (res.summarized ? 'Saved.' : 'Saved.'), res.warning ? 'err' : 'ok');
    if (isJd) {
      $('jdText').value = '';
      $('jdCompany').value = '';
      jdFile.name = '';
      closeDocs();
      inputEl.value = `prep ${res.company}`;
      autosize();
      inputEl.focus();
      if (chatEl.querySelector('.welcome')) chatEl.textContent = '';
      addMessage('assistant', `Saved the job description for **${res.company}**. Press Enter to run \`prep ${res.company}\`, or edit the command first.`);
    } else {
      $('resumeText').value = '';
      resumeFile.name = '';
      closeDocs();
      if (appState.stateExists) {
        submit('resume');
      } else {
        if (chatEl.querySelector('.welcome')) chatEl.textContent = '';
        addMessage('assistant', 'Resume saved. Type `kickoff` to finish setup; I will use it to suggest stories and tailor your questions.');
      }
    }
  }

  function closeDocs() {
    $('docsModal').classList.add('hidden');
  }

  const resumeFile = { name: '' };
  const jdFile = { name: '' };

  function wire() {
    sendBtn.addEventListener('click', () => submit());
    stopBtn.addEventListener('click', () => window.coach.stop());
    inputEl.addEventListener('input', autosize);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        submit();
      }
    });

    $('newChatBtn').addEventListener('click', async () => {
      await window.coach.newChat();
      appState.messages = [];
      markActive(null);
      showWelcome();
    });
    $('settingsBtn').addEventListener('click', openSettings);
    $('closeSettingsBtn').addEventListener('click', closeSettings);
    $('settingsModal').addEventListener('click', (e) => {
      if (e.target.id === 'settingsModal') closeSettings();
    });
    $('providerSelect').addEventListener('change', () => {
      syncSettingsForm();
      setStatus('');
    });
    $('saveSettingsBtn').addEventListener('click', saveSettings);
    $('testBtn').addEventListener('click', testConnection);
    $('clearKeyBtn').addEventListener('click', async () => {
      const res = await window.coach.clearKey($('providerSelect').value);
      appState.hasKey = res.hasKey;
      syncSettingsForm();
      setStatus('Key removed.', 'ok');
    });
    $('docsBtn').addEventListener('click', openDocs);
    $('closeDocsBtn').addEventListener('click', closeDocs);
    $('docsModal').addEventListener('click', (e) => {
      if (e.target.id === 'docsModal') closeDocs();
    });
    $('resumePickBtn').addEventListener('click', () => pickInto('resumeText', 'resumeMsg', resumeFile));
    $('jdPickBtn').addEventListener('click', () => pickInto('jdText', 'jdMsg', jdFile));
    $('resumeSaveBtn').addEventListener('click', () => saveDoc('resume'));
    $('jdSaveBtn').addEventListener('click', () => saveDoc('jd'));
    $('resumeRemoveBtn').addEventListener('click', async () => {
      appState.docs = await window.coach.docsRemove({ kind: 'resume' });
      renderDocs();
      docMsg('resumeMsg', 'Resume removed.', 'ok');
    });
    $('revealBtn').addEventListener('click', () => window.coach.revealState());
    $('exportBtn').addEventListener('click', async () => {
      const res = await window.coach.exportState();
      if (res.error) setStatus(res.error, 'err');
      else if (res.ok) setStatus('Exported.', 'ok');
    });
    $('resetBtn').addEventListener('click', async () => {
      const res = await window.coach.resetState();
      if (res.ok) {
        appState.stateExists = false;
        appState.messages = [];
        updateStatePill();
        markActive(null);
        showWelcome();
        closeSettings();
      }
    });

    window.coach.onDelta((payload) => {
      if (!streamBubble) return;
      pendingText = payload.text;
      pendingSaving = !!payload.saving;
      pendingStatus = payload.status || '';
      scheduleRender();
    });
  }

  async function start() {
    buildSidebar();
    wire();
    appState = await window.coach.init();
    updateEngineLabel();
    updateStatePill();
    renderDocs();
    renderHistory(appState.messages);
    markActive(appState.activeCommand);
    if (!appState.hasKey[appState.provider]) {
      if (!appState.messages.length) openSettings();
    }
    inputEl.focus();
  }

  start();
})();
