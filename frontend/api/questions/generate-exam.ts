import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;

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

  const { syllabusTopics = [] } = req.body;

  try {
    const results: any[][] = [];

    for (const subject of SUBJECTS) {
      const content = syllabusTopics
        .filter((t: any) => t.subject === subject)
        .map((t: any) => t.content)
        .join('\n\n')
        .slice(0, 3000);

      const prompt = buildQuestionPrompt(subject, 10, 'Medium', undefined, content || undefined);
      const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, prompt, 4096);

      const parsed = extractJSON(raw);
      results.push(
        parsed.questions.map((q: any) => ({
          id: randomUUID(),
          subject,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: 'Medium',
        }))
      );
    }

    res.json({ questions: results.flat() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
