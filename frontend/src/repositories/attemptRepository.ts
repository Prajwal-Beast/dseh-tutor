import type { QuestionAttempt, Subject, SubjectStats } from '../types';

const KEY = 'dseh_attempts';

function load(): QuestionAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(attempts: QuestionAttempt[]): void {
  localStorage.setItem(KEY, JSON.stringify(attempts));
}

export const attemptRepository = {
  getAll(): QuestionAttempt[] {
    return load();
  },

  saveMany(attempts: QuestionAttempt[]): void {
    save([...load(), ...attempts]);
  },

  getStatsBySubject(): SubjectStats[] {
    const attempts = load();
    const map = new Map<Subject, { total: number; correct: number }>();

    for (const a of attempts) {
      const existing = map.get(a.subject) || { total: 0, correct: 0 };
      existing.total += 1;
      if (a.correct) existing.correct += 1;
      map.set(a.subject, existing);
    }

    return Array.from(map.entries()).map(([subject, s]) => ({
      subject,
      total: s.total,
      correct: s.correct,
      accuracy: s.total > 0 ? s.correct / s.total : 0,
    }));
  },

  getWeakSubtopics(minAttempts = 3): Array<{
    subject: Subject;
    subtopic: string;
    accuracy: number;
    total: number;
  }> {
    const attempts = load().filter((a) => a.subtopic);
    const key = (a: QuestionAttempt) => `${a.subject}||${a.subtopic}`;
    const map = new Map<string, { subject: Subject; subtopic: string; total: number; correct: number }>();

    for (const a of attempts) {
      const k = key(a);
      const existing = map.get(k) || { subject: a.subject, subtopic: a.subtopic!, total: 0, correct: 0 };
      existing.total += 1;
      if (a.correct) existing.correct += 1;
      map.set(k, existing);
    }

    return Array.from(map.values())
      .filter((s) => s.total >= minAttempts)
      .map((s) => ({ ...s, accuracy: s.correct / s.total }))
      .sort((a, b) => a.accuracy - b.accuracy);
  },

  getOverallStats(): { total: number; correct: number; accuracy: number } {
    const attempts = load();
    const correct = attempts.filter((a) => a.correct).length;
    return {
      total: attempts.length,
      correct,
      accuracy: attempts.length > 0 ? correct / attempts.length : 0,
    };
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
