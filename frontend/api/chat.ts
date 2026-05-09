import { callLLM } from '../lib/aiClient.js';
import { buildTutorSystemPrompt } from '../lib/prompts.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history = [], syllabusTopics = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

  try {
    const systemPrompt = buildTutorSystemPrompt(syllabusTopics);
    const messages = [
      ...history.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ];
    const reply = await callLLM(systemPrompt, messages, 1024);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
