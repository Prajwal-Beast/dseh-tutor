import { v4 as uuidv4 } from 'uuid';
import { callLLMOnce } from '../../lib/aiClient';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionPrompt } from '../../lib/prompts';

function extractJSON(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(fenced ? fenced[1].trim() : text.trim());
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
      id: uuidv4(),
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
