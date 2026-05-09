import type { SyllabusTopic, Subject } from '../types';

const KEY = 'dseh_syllabus_topics';

function load(): SyllabusTopic[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(topics: SyllabusTopic[]): void {
  localStorage.setItem(KEY, JSON.stringify(topics));
}

export const syllabusRepository = {
  getAll(): SyllabusTopic[] {
    return load();
  },

  getBySubject(subject: Subject): SyllabusTopic[] {
    return load().filter((t) => t.subject === subject);
  },

  getById(id: string): SyllabusTopic | undefined {
    return load().find((t) => t.id === id);
  },

  saveTopic(topic: SyllabusTopic): void {
    const topics = load();
    const idx = topics.findIndex((t) => t.id === topic.id);
    if (idx >= 0) {
      topics[idx] = topic;
    } else {
      topics.push(topic);
    }
    save(topics);
  },

  deleteTopic(id: string): void {
    save(load().filter((t) => t.id !== id));
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
