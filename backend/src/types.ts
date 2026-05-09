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
  options: string[];   // exactly 4
  correctIndex: number; // 0..3
  explanation: string;
  difficulty: Difficulty;
  sourceTopicIds?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateQuestionsBody {
  subject: Subject;
  subtopic?: string;
  difficulty: Difficulty;
  numQuestions: number;
  syllabusContent?: string;
}

export interface TutorChatBody {
  message: string;
  history: ChatMessage[];
  syllabusTopics?: SyllabusTopic[];
}
