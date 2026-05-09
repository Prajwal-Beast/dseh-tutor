import type { Question, Subject, Difficulty, SyllabusTopic, ChatMessage } from '../types';

const BASE = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export async function generateQuestions(params: {
  subject: Subject;
  subtopic?: string;
  difficulty: Difficulty;
  numQuestions: number;
  syllabusContent?: string;
}): Promise<Question[]> {
  const data = await post<{ questions: Question[] }>('/questions/generate', params);
  return data.questions;
}

export async function generateExamQuestions(
  syllabusTopics: SyllabusTopic[]
): Promise<Question[]> {
  const data = await post<{ questions: Question[] }>('/questions/generate-exam', {
    syllabusTopics,
  });
  return data.questions;
}

export async function sendChatMessage(params: {
  message: string;
  history: ChatMessage[];
  syllabusTopics?: SyllabusTopic[];
}): Promise<string> {
  const data = await post<{ reply: string }>('/chat', params);
  return data.reply;
}

export async function checkHealth(): Promise<{ status: string; aiReady: boolean }> {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
