import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { callLLMOnce } from '../ai/aiClient.js';
import { QUESTION_GENERATOR_SYSTEM_PROMPT, buildQuestionGeneratorPrompt } from '../ai/prompts.js';
import type { GenerateQuestionsBody, Question } from '../types.js';

export const questionsRouter = Router();

function extractJSON(text: string): unknown {
  // Strip markdown fences if the model added them
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.trim());
}

questionsRouter.post('/generate', async (req, res) => {
  const body = req.body as GenerateQuestionsBody;
  const { subject, subtopic, difficulty = 'Medium', numQuestions = 5, syllabusContent } = body;

  if (!subject) {
    res.status(400).json({ error: 'subject is required' });
    return;
  }

  try {
    const userPrompt = buildQuestionGeneratorPrompt(
      subject,
      numQuestions,
      difficulty,
      subtopic,
      syllabusContent
    );

    const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, userPrompt, 4096);

    let parsed: { questions: Array<{
      text: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }> };

    try {
      parsed = extractJSON(raw) as typeof parsed;
    } catch {
      console.error('Failed to parse LLM JSON:\n', raw);
      res.status(502).json({ error: 'AI returned invalid JSON. Try again.' });
      return;
    }

    const questions: Question[] = parsed.questions.map((q) => ({
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Question generation error:', message);
    res.status(500).json({ error: message });
  }
});

/**
 * Generate a full exam set: 10 questions per subject (4 calls).
 * Returns { questions: Question[] } with 40 items.
 */
questionsRouter.post('/generate-exam', async (req, res) => {
  const { syllabusTopics = [] } = req.body as {
    syllabusTopics?: Array<{ subject: string; content: string; subtopic?: string }>;
  };

  const subjects = ['Economics', 'Statistics', 'Mathematics', 'Computer Science'] as const;

  try {
    const allQuestions: Question[] = [];

    for (const subject of subjects) {
      // Find relevant syllabus content for this subject
      const relevantContent = syllabusTopics
        .filter((t) => t.subject === subject)
        .map((t) => t.content)
        .join('\n\n')
        .slice(0, 3000);

      const userPrompt = buildQuestionGeneratorPrompt(
        subject,
        10,
        'Medium',
        undefined,
        relevantContent || undefined
      );

      const raw = await callLLMOnce(QUESTION_GENERATOR_SYSTEM_PROMPT, userPrompt, 4096);

      let parsed: { questions: Array<{
        text: string;
        options: string[];
        correctIndex: number;
        explanation: string;
      }> };

      try {
        const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        parsed = JSON.parse(fenced ? fenced[1].trim() : raw.trim());
      } catch {
        console.error(`Failed to parse JSON for ${subject}`);
        continue;
      }

      const questions: Question[] = parsed.questions.map((q) => ({
        id: uuidv4(),
        subject,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        difficulty: 'Medium' as const,
      }));

      allQuestions.push(...questions);
    }

    res.json({ questions: allQuestions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
