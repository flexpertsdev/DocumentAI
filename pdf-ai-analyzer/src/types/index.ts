export interface AnalysisResult {
  summary?: string;
  keyPoints?: string[];
  keyPointsFormatted?: string;
  entities?: {
    people?: string[];
    organizations?: string[];
    locations?: string[];
    dates?: string[];
    concepts?: string[];
    terms?: string[];
  };
  analysisType: string;
  wordCount: number;
  timestamp: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  metadata: {
    totalQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
    generatedAt: string;
    textLength: number;
  };
}

export type AnalysisType = 'summary' | 'key-points' | 'entities' | 'custom';

export interface ProcessingStatus {
  stage: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
}