export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export type QuestionType =
  | 'text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'rating'
  | 'date'
  | 'email'
  | 'phone';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  order: number;
}

export interface Form {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  theme: string;
  status: 'draft' | 'published';
  questions: Question[];
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

export interface Answer {
  questionId: string;
  value: any;
}

export interface FormResponse {
  id: string;
  formId: string;
  ownerId: string;
  submittedAt: number;
  answers: Answer[];
}

export interface Analysis {
  summary: string;
  keyInsights: string[];
  commonAnswers: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  recommendations: string[];
}
