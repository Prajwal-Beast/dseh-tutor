import { Router } from 'express';
import { callLLM } from '../ai/aiClient.js';
import { buildTutorSystemPrompt } from '../ai/prompts.js';
import type { TutorChatBody } from '../types.js';

export const chatRouter = Router();

chatRouter.post('/', async (req, res) => {
  const body = req.body as TutorChatBody;
  const { message, history = [], syllabusTopics = [] } = body;

  if (!message?.trim()) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  try {
    const systemPrompt = buildTutorSystemPrompt(syllabusTopics);

    // Build messages: existing history + new user message
    const messages = [
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    const reply = await callLLM(systemPrompt, messages, 1024);

    res.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Tutor chat error:', message);
    res.status(500).json({ error: message });
  }
});
