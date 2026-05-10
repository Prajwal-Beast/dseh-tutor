import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;

const DBLSLASH_MARK = '\x01\x02\x03';

function fixEscapes(s: string): string {
  // Protect valid \\ pairs, double remaining lone \, restore \\
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
      const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, prompt, 8192);

      const parsed = extractJSON(raw);
      if (!Array.isArray(parsed?.questions)) {
        throw new Error(`[${subject}] No questions array. Parsed keys: ${Object.keys(parsed || {}).join(', ')}. Raw: ${raw.slice(0, 200)}`);
      }
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
