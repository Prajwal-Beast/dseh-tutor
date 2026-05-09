import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey then add it to backend/.env'
    );
  }
  return new GoogleGenerativeAI(key);
}

/**
 * Multi-turn conversation with a system prompt.
 */
export async function callLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  maxTokens = 2048
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: maxTokens },
  });

  // Gemini uses 'model' instead of 'assistant' for role
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

/**
 * Single-turn request (no history).
 */
export async function callLLMOnce(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2048
): Promise<string> {
  return callLLM(systemPrompt, [{ role: 'user', content: userMessage }], maxTokens);
}
