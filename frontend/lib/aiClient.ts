import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

function getClient() {
  const key = (process.env.GEMINI_API_KEY ?? "").replace(new RegExp("^" + String.fromCharCode(65279)), "").trim();
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenerativeAI(key);
}

export async function callLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  maxTokens = 2048
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const last = messages[messages.length - 1];
  const result = await model.startChat({ history }).sendMessage(last.content);
  return result.response.text();
}

export async function callLLMOnce(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2048
): Promise<string> {
  return callLLM(systemPrompt, [{ role: 'user', content: userMessage }], maxTokens);
}
