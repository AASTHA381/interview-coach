// Groq's free tier allows roughly 8K tokens per minute (input + output) per request budget.
const LIMITS = {
  groq: { inputTokens: 5600, maxOutputTokens: 2000 },
  gemini: { inputTokens: 200000, maxOutputTokens: 0 },
};
const CHARS_PER_TOKEN = 3.5;

const estimateTokens = (text) => Math.ceil(text.length / CHARS_PER_TOKEN);

// Drops the oldest turns until the request fits the provider's input budget.
function fitToBudget(system, messages, provider) {
  const budget = LIMITS[provider].inputTokens;
  const trimmed = [...messages];
  const total = () => estimateTokens(system) + trimmed.reduce((n, m) => n + estimateTokens(m.content), 0);
  while (trimmed.length > 1 && total() > budget) trimmed.shift();
  while (trimmed.length > 1 && trimmed[0].role !== 'user') trimmed.shift();
  const used = total();
  return { messages: trimmed, tooLarge: used > budget, used, budget };
}

module.exports = { LIMITS, CHARS_PER_TOKEN, estimateTokens, fitToBudget };
