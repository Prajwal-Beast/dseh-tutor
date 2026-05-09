import type { Question, Subject } from '../types';

const KEY = 'dseh_questions';

function load(): Question[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(questions: Question[]): void {
  localStorage.setItem(KEY, JSON.stringify(questions));
}

export const questionRepository = {
  getAll(): Question[] {
    return load();
  },

  getBySubject(subject: Subject): Question[] {
    return load().filter((q) => q.subject === subject);
  },

  getById(id: string): Question | undefined {
    return load().find((q) => q.id === id);
  },

  saveMany(questions: Question[]): void {
    const existing = load();
    const byId = new Map(existing.map((q) => [q.id, q]));
    for (const q of questions) {
      byId.set(q.id, { ...q, generatedAt: q.generatedAt || new Date().toISOString() });
    }
    save(Array.from(byId.values()));
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
