export type Subject = 'Economics' | 'Statistics' | 'Mathematics' | 'Computer Science';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SyllabusTopic {
  id: string;
  subject: Subject;
  title: string;
  subtopic?: string;
  sourceName?: string;
  content: string;
}

export interface Question {
  id: string;
  subject: Subject;
  subtopic?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  sourceTopicIds?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
