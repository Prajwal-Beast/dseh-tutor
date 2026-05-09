import { v4 as uuidv4 } from 'uuid';
import { callLLMOnce } from '../../lib/aiClient';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;

function extractJSON(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(fenced ? fenced[1].trim() : text.trim());
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { syllabusTopics = [] } = req.body;

  try {
    // Run all 4 subjects in parallel to stay within Vercel's execution time limit
    const results = await Promise.all(
      SUBJECTS.map(async (subject) => {
        const content = syllabusTopics
          .filter((t: any) => t.subject === subject)
          .map((t: any) => t.content)
          .join('\n\n')
          .slice(0, 3000);

        const prompt = buildQuestionPrompt(subject, 10, 'Medium', undefined, content || undefined);
        const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, prompt, 4096);

        try {
          const parsed = extractJSON(raw);
          return parsed.questions.map((q: any) => ({
            id: uuidv4(),
            subject,
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            difficulty: 'Medium',
          }));
        } catch {
          return [];
        }
      })
    );

    res.json({ questions: results.flat() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
