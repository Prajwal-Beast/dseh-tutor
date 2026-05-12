import { randomUUID } from 'crypto';
import Groq from 'groq-sdk';

const SUBJECTS = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;
const QUESTIONS_PER_SUBJECT = 5;

// qwen3-32b produces clean JSON with proper "options":[] formatting
const EXAM_MODEL = 'qwen/qwen3-32b';

const SINGLE_Q_SYSTEM = `You are an exam question author. Output ONLY a JSON object. No markdown. No explanation outside JSON.
Required format:
{"text":"question here","options":["A","B","C","D"],"correctIndex":0,"explanation":"why A is correct"}
- options must be a JSON array with exactly 4 string items
- correctIndex is an integer 0-3`;

function getGroqClient() {
  const key = (process.env.GROQ_API_KEY ?? '').trim();
  if (!key) throw new Error('GROQ_API_KEY is not set');
  return new Groq({ apiKey: key });
}

async function generateOneQuestion(subject: string, syllabusHint: string): Promise<any | null> {
  const userMsg = syllabusHint
    ? `Generate 1 Medium-difficulty question for ${subject}.\nSyllabus context:\n${syllabusHint}`
    : `Generate 1 Medium-difficulty ${subject} question using standard university-level knowledge.`;

  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model: EXAM_MODEL,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SINGLE_Q_SYSTEM },
      { role: 'user', content: userMsg },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  try {
    const q = JSON.parse(raw);
    if (!q.text || !Array.isArray(q.options) || q.options.length !== 4) return null;
    return q;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { syllabusTopics = [] } = req.body;

  try {
    const allQuestions: any[] = [];

    for (const subject of SUBJECTS) {
      const syllabusHint = (syllabusTopics as any[])
        .filter((t) => t.subject === subject)
        .map((t) => t.content)
        .join('\n\n')
        .slice(0, 800);

      for (let i = 0; i < QUESTIONS_PER_SUBJECT; i++) {
        const q = await generateOneQuestion(subject, syllabusHint);
        if (!q) continue;
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
