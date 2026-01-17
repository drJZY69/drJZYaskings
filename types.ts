
export type Difficulty = 'سهل' | 'متوسط' | 'صعب';

export interface Question {
  id: number;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface UserResponse {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  responses: UserResponse[];
}
