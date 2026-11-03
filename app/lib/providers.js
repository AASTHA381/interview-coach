const DEFAULT_MODELS = {
  gemini: 'gemini-3.6-flash',
  groq: 'openai/gpt-oss-120b',
};

// Tried in order when the configured Gemini model is not available to the user's key.
const GEMINI_FALLBACKS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

// Retired or restricted models; saved settings pointing at them are migrated to the default.
// gemini-2.5-flash is limited to accounts that already used it, so new keys fail on it.
const DEPRECATED_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]);

const MAX_RETRY_WAIT_SECONDS = 70;
const MAX_RETRIES = 2;

class ProviderError extends Error {
  constructor(message, status, retryAfter) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function parseRetryAfter(res) {
  const raw = res.headers && res.headers.get && res.headers.get('retry-after');
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function errorFromResponse(res, provider) {
  let detail = '';
  try {
    const data = await res.json();
    detail = (data && data.error && (data.error.message || data.error)) || '';
    if (typeof detail !== 'string') detail = JSON.stringify(detail);
  } catch (_) {}
  const name = provider === 'gemini' ? 'Gemini' : 'Groq';
  if (res.status === 429) {
    const daily = /per day|\bTPD\b|\bRPD\b/i.test(detail);
    return new ProviderError(
      daily
        ? `${name} daily free limit reached. It resets within 24 hours, or switch engine in Settings.`
        : `${name} rate limit reached (free tier). Wait a minute and try again.`,
      429,
      daily ? null : parseRetryAfter(res)
    );
  }
  const keyInvalid = res.status === 401 || /API key not valid|API_KEY_INVALID|invalid api key|invalid_api_key/i.test(detail);
  if (keyInvalid) {
    return new ProviderError(`${name} rejected the API key. Check that you copied it completely in Settings.`, res.status);
  }
  const modelGone =
    res.status === 404 ||
    /(model|models\/\S+).*(not found|no longer available|not supported|deprecated|not available|does not exist|decommissioned)/i.test(detail) ||
    /no longer available to new users/i.test(detail);
  if (modelGone) {
    const err = new ProviderError(`${name} does not offer this model to your key. Pick another model in Settings.`, res.status);
    err.modelUnavailable = true;
    return err;
  }
  if (res.status === 403) {
    const region = /location is not supported|not supported in your/i.test(detail);
    return new ProviderError(
      region
        ? `${name} is not available in your region for this key.`
        : `${name} refused the request (403)${detail ? ': ' + detail.slice(0, 220) : ''}. Check that the key is for the Gemini API and not restricted.`,
      403
    );
  }
  if (res.status === 413) {
    return new ProviderError(`${name} says the request is too large for the free plan. Send a shorter message or start a new chat.`, 413);
  }
  return new ProviderError(`${name} error ${res.status}${detail ? ': ' + detail.slice(0, 300) : ''}`, res.status);
}

// Reads a server-sent-events body and calls onData for each JSON payload.
async function readSse(res, signal, onData) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const abort = () => reader.cancel().catch(() => {});
  signal.addEventListener('abort', abort, { once: true });
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          onData(JSON.parse(payload));
        } catch (_) {}
      }
    }
  } finally {
    signal.removeEventListener('abort', abort);
  }
}

async function streamGeminiOnce({ apiKey, model, system, messages, useSearch, signal, onDelta }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  };
  if (useSearch) body.tools = [{ google_search: {} }];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    // Search grounding may be unavailable for some models/plans; retry once without it.
    if (useSearch && res.status === 400) {
      return streamGeminiOnce({ apiKey, model, system, messages, useSearch: false, signal, onDelta });
    }
    throw await errorFromResponse(res, 'gemini');
  }

  let text = '';
  const sources = new Map();
  await readSse(res, signal, (data) => {
    const cand = data.candidates && data.candidates[0];
    if (!cand) return;
    const parts = (cand.content && cand.content.parts) || [];
    for (const p of parts) {
      if (p.text && !p.thought) {
        text += p.text;
        onDelta(text);
      }
    }
    const chunks = cand.groundingMetadata && cand.groundingMetadata.groundingChunks;
    if (chunks) {
      for (const c of chunks) {
        if (c.web && c.web.uri) sources.set(c.web.uri, c.web.title || c.web.uri);
      }
    }
  });
  return { text, sources: [...sources].map(([uri, title]) => ({ uri, title })), searched: !!useSearch, model };
}

async function streamGemini(opts) {
  const candidates = [opts.model, ...GEMINI_FALLBACKS.filter((m) => m !== opts.model)];
  let firstError = null;
  for (const model of candidates) {
    try {
      return await streamGeminiOnce({ ...opts, model });
    } catch (err) {
      if (!err.modelUnavailable || opts.signal.aborted) throw firstError || err;
      firstError = firstError || err;
      if (opts.onStatus) opts.onStatus(`Model ${model} is not available to your key. Trying another…`);
    }
  }
  throw firstError;
}

function groqExtras(model) {
  // gpt-oss models spend completion tokens on hidden reasoning; keep it short on the free tier.
  return /gpt-oss/i.test(model) ? { reasoning_effort: 'low' } : {};
}

async function streamGroqOnce({ apiKey, model, system, messages, signal, onDelta, maxTokens, extras }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.7,
      ...(maxTokens ? { max_completion_tokens: maxTokens } : {}),
      ...extras,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    signal,
  });
  if (!res.ok) {
    const err = await errorFromResponse(res, 'groq');
    err.extrasRejected = res.status === 400 && Object.keys(extras).length > 0;
    throw err;
  }

  let text = '';
  await readSse(res, signal, (data) => {
    const delta = data.choices && data.choices[0] && data.choices[0].delta;
    if (delta && delta.content) {
      text += delta.content;
      onDelta(text);
    }
  });
  return { text, sources: [], searched: false, model };
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')); }, { once: true });
  });
}

async function streamGroq(opts) {
  let extras = groqExtras(opts.model);
  for (let attempt = 0; ; attempt++) {
    try {
      return await streamGroqOnce({ ...opts, extras });
    } catch (err) {
      if (opts.signal.aborted) throw err;
      if (err.extrasRejected) {
        extras = {};
        continue;
      }
      if (err.status === 429 && err.retryAfter != null && err.retryAfter <= MAX_RETRY_WAIT_SECONDS && attempt < MAX_RETRIES) {
        const wait = Math.max(1, Math.ceil(err.retryAfter));
        if (opts.onStatus) opts.onStatus(`Free-tier rate limit hit. Retrying in ${wait}s…`);
        await sleep(wait * 1000 + 300, opts.signal);
        if (opts.onStatus) opts.onStatus('');
        continue;
      }
      throw err;
    }
  }
}

function streamChat(provider, opts) {
  if (provider === 'groq') return streamGroq(opts);
  return streamGemini(opts);
}

async function testKey(provider, apiKey, model) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const out = await streamChat(provider, {
      apiKey,
      model,
      system: 'Reply with the single word: ok',
      messages: [{ role: 'user', content: 'ping' }],
      useSearch: false,
      signal: controller.signal,
      onDelta: () => {},
    });
    return { ok: out.text.length > 0, model: out.model };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { DEFAULT_MODELS, DEPRECATED_MODELS, GEMINI_FALLBACKS, ProviderError, streamChat, testKey };
