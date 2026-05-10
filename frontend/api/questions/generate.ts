import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

const DBLSLASH_MARK = '\x01\x02\x03';

function fixEscapes(s: string): string {
  return s
    .replace(/\\\\/g, DBLSLASH_MARK)
    .replace(/\\/g, '\\\\')
    .replace(new RegExp(DBLSLASH_MARK, 'g'), '\\\\');
}

function tryParse(s: string): any | null {
  try { return JSON.parse(s); } catch {}
  try { return JSON.parse(fixEscapes(s)); } catch {}
  return null;
}

function extractJSON(text: string) {
  const t = text.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (fenced) {
    const r = tryParse(fenced[1].trim());
    if (r) return r;
  }
  const r1 = tryParse(t);
  if (r1) return r1;
  const obj = t.match(/\{[\s\S]*\}/s);
  if (obj) {
    const r2 = tryParse(obj[0]);
    if (r2) return r2;
  }
  throw new Error('Could not extract JSON. Raw: ' + text.slice(0, 300));
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
