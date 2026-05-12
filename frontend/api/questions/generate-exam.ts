import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts.js';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;
const QUESTIONS_PER_SUBJECT = 5; // 5 per subject = 20 total, reliable with JSON mode

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

      const prompt = buildQuestionPrompt(subject, QUESTIONS_PER_SUBJECT, 'Medium', undefined, content || undefined);
      const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, prompt, 4096, true);

      let parsed: any;
      try { parsed = JSON.parse(raw); } catch {
        throw new Error(`Invalid JSON for ${subject}: ${raw.slice(0, 100)}`);
      }

      // Model may return {questions:[...]} or just [...]
      const qs: any[] = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(qs) || qs.length === 0) {
        throw new Error(`No questions returned for ${subject}`);
      }

      results.push(
        qs.map((q: any) => ({
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
