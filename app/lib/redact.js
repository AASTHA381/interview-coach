// Detects and masks API keys so they are never shown, stored in chat history, or sent to a model.
const KEY_PATTERNS = [
  /gsk_[A-Za-z0-9]{16,}/g, // Groq
  /AIza[0-9A-Za-z_-]{20,}/g, // Google
  /sk-[A-Za-z0-9_-]{20,}/g, // OpenAI / Anthropic style
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/g, // GitHub
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{10,}/g, // Slack
];

function containsApiKey(text) {
  const s = String(text || '');
  return KEY_PATTERNS.some((re) => {
    re.lastIndex = 0;
    return re.test(s);
  });
}

// Masks key-like strings and any exact secrets supplied (for example the key the user just saved).
function redactSecrets(text, exact = []) {
  let out = String(text == null ? '' : text);
  for (const secret of exact) {
    if (secret && String(secret).length >= 8) out = out.split(String(secret)).join('[hidden key]');
  }
  for (const re of KEY_PATTERNS) out = out.replace(re, '[hidden key]');
  return out.replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]{16,}/gi, '$1[hidden key]');
}

const KEY_IN_CHAT_MESSAGE =
  'That looks like an API key, so I did not send or save it. Add keys only in **Settings**, where they are stored encrypted and never shown.';

module.exports = { containsApiKey, redactSecrets, KEY_IN_CHAT_MESSAGE };
