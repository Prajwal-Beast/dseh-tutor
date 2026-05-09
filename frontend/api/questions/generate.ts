import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

function fixEscapes(s: string): string {
  return s.replace(/\\(?!["\\\/bfnrtu]|u[0-9a-fA-F]{4})/g, '\\\\');
}

function extractJSON(text: string) {
  const t = text.trim();
  try { return JSON.parse(t); } catch {}
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (fenced) {
    const inner = fenced[1].trim();
    try { return JSON.parse(inner); } catch {}
    try { return JSON.parse(fixEscapes(inner)); } catch {}
  }
  const obj = t.match(/\{[\s\S]*\}/);
  if (obj) {
    try { return JSON.parse(obj[0]); } catch {}
    return JSON.parse(fixEscapes(obj[0]));
  }
  try { return JSON.parse(fixEscapes(t)); } catch {}
  throw new Error('Could not extract JSON from model response');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { subject, subtopic, difficulty = 'Medium', numQuestions = 5, syllabusContent } = req.body;
  if (!subject) return res.status(400).json({ error: 'subject is required' });

  try {
    const prompt = buildQuestionPrompt(subject, numQuestions, difficulty, subtopic, syllabusContent);
    const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, prompt, 4096);
    const parsed = extractJSON(raw);
    const questions = parsed.questions.map((q: any) => ({
      id: randomUUID(),
      subject,
      subtopic,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty,
    }));
    res.json({ questions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
