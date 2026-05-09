import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;

function fixEscapes(s: string): string {
  // Replace \X where X is not a valid JSON escape char (\", \\, \/, \b, \f, \n, \r, \t, \uXXXX)
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
