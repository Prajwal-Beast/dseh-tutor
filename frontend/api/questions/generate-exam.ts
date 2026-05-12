import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;
const QUESTIONS_PER_SUBJECT = 5;

const DBLSLASH_MARK = '\x01\x02\x03';

/** Fix lone backslashes from LaTeX (e.g. \frac → \\frac) */
function fixEscapes(s: string): string {
  return s
    .replace(/\\\\/g, DBLSLASH_MARK)
    .replace(/\\/g, '\\\\')
    .replace(new RegExp(DBLSLASH_MARK, 'g'), '\\\\');
}

/**
 * Fix common model formatting errors before JSON.parse:
 *  - "key=[ or key=( → "key": [   (Python/JS-style assignment in JSON)
 *  - Remove markdown fences
 */
function preprocess(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/gm, '')
    .replace(/```\s*$/gm, '')
    .replace(/"?(\w+)"?\s*[=(]\s*\[/g, '"$1": [')
    .trim();
}

function tryParse(s: string): any | null {
  const p = preprocess(s);
  try { return JSON.parse(p); } catch {}
  try { return JSON.parse(fixEscapes(p)); } catch {}
  return null;
}

function extractJSON(text: string): any {
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
    const allQuestions: any[] = [];

    for (const subject of SUBJECTS) {
      const content = (syllabusTopics as any[])
        .filter((t) => t.subject === subject)
        .map((t) => t.content)
        .join('\n\n')
        .slice(0, 2000);

      const prompt = buildQuestionPrompt(subject, QUESTIONS_PER_SUBJECT, 'Medium', undefined, content || undefined);
      const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, prompt, 4096);

      const parsed = extractJSON(raw);
      const qs: any[] = Array.isArray(parsed) ? parsed : parsed?.questions ?? [];
      if (qs.length === 0) continue; // skip subject rather than fail whole exam

      for (const q of qs) {
        if (!q.text || !Array.isArray(q.options)) continue;
        allQuestions.push({
          id: randomUUID(),
          subject,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex ?? 0,
          explanation: q.explanation ?? '',
          difficulty: 'Medium',
        });
      }
    }

    if (allQuestions.length === 0) {
      return res.status(500).json({ error: 'No questions could be generated' });
    }

    res.json({ questions: allQuestions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
