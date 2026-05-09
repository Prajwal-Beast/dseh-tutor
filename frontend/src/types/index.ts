export type Subject = 'Economics' | 'Statistics' | 'Mathematics' | 'Computer Science';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SyllabusTopic {
  id: string;
  subject: Subject;
  title: string;
  subtopic?: string;
  sourceName?: string;
  content: string;
  createdAt: string;
}

export interface Question {
  id: string;
  subject: Subject;
  subtopic?: string;
  text: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0..3
  explanation: string;
  difficulty: Difficulty;
  sourceTopicIds?: string[];
  generatedAt?: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  subject: Subject;
  subtopic?: string;
  chosenIndex: number;
  correct: boolean;
  timestamp: string;
  sessionId: string;
}

export interface SubjectStats {
  subject: Subject;
  total: number;
  correct: number;
  accuracy: number; // 0..1
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ALL_SUBJECTS: Subject[] = [
  'Economics',
  'Statistics',
  'Mathematics',
  'Computer Science',
];

export const SUBJECT_COLORS: Record<Subject, { bg: string; text: string; border: string; ring: string }> = {
  Economics: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    ring: 'ring-blue-500',
  },
  Statistics: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    ring: 'ring-green-500',
  },
  Mathematics: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    ring: 'ring-purple-500',
  },
  'Computer Science': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    ring: 'ring-orange-500',
  },
};

export const SUBJECT_BAR_COLORS: Record<Subject, string> = {
  Economics: 'bg-blue-500',
  Statistics: 'bg-green-500',
  Mathematics: 'bg-purple-500',
  'Computer Science': 'bg-orange-500',
};
