import { randomUUID } from 'crypto';
import { callLLMOnce } from '../../lib/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT } from '../../lib/prompts.js';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;
const QUESTIONS_PER_SUBJECT = 5;

const SINGLE_Q_PROMPT = `You are an expert exam question author for the University of Milan DSEH background knowledge test.

Return ONLY a valid JSON object with this exact structure:
{"text":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}

Rules:
- Exactly 4 options
- correctIndex is 0-3 (index of the correct option)
- No markdown, no extra text, just the JSON object`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { syllabusTopics = [] } = req.body;

  try {
    const allQuestions: any[] = [];

    for (const subject of SUBJECTS) {
      const syllabusHint = syllabusTopics
        .filter((t: any) => t.subject === subject)
        .map((t: any) => t.content)
        .join('\n\n')
        .slice(0, 1000);

      for (let i = 0; i < QUESTIONS_PER_SUBJECT; i++) {
        const userMsg = syllabusHint
          ? `Generate 1 Medium-difficulty question for: ${subject}.\nSyllabus hint:\n${syllabusHint}`
          : `Generate 1 Medium-difficulty question for: ${subject}. Use standard university-level knowledge.`;

        const raw = await callLLMOnce(SINGLE_Q_PROMPT, userMsg, 2048, true);

        let q: any;
        try { q = JSON.parse(raw); } catch {
          continue; // skip this question if model output is still bad
        }

        if (!q.text || !Array.isArray(q.options) || q.options.length !== 4) continue;

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
