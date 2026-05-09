import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

function extractJSON(text: string) {
  const t = text.trim();
  try { return JSON.parse(t); } catch {}
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (fenced) { try { return JSON.parse(fenced[1].trim()); } catch {} }
  const obj = t.match(/\{[\s\S]*\}/);
  if (obj) return JSON.parse(obj[0]);
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
