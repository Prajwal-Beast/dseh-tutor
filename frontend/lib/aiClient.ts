import Groq from 'groq-sdk';

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

function getClient() {
  const key = (process.env.GROQ_API_KEY ?? '').trim();
  if (!key) throw new Error('GROQ_API_KEY is not set');
  return new Groq({ apiKey: key });
}

export async function callLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  maxTokens = 2048
): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });
  return completion.choices[0]?.message?.content ?? '';
}

export async function callLLMOnce(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2048
): Promise<string> {
  return callLLM(systemPrompt, [{ role: 'user', content: userMessage }], maxTokens);
}
