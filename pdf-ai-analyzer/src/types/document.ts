// Standardized document structure for all PDFs
export interface StandardizedDocument {
  // Document metadata
  id: string;
  uploadedAt: string;
  filename: string;
  fileSize: number;
  pageCount: number;
  
  // Extracted metadata
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creationDate?: string;
    documentType: DocumentType;
    academicLevel?: AcademicLevel;
    language: string;
  };
  
  // Standardized content structure
  content: {
    fullText: string;
    sections: DocumentSection[];
    concepts: Concept[];
    definitions: Definition[];
    examples: Example[];
    formulas?: Formula[];
    figures?: Figure[];
    tables?: Table[];
  };
  
  // AI-generated analysis
  analysis: {
    summary: string;
    mainTopics: string[];
    keyPoints: string[];
    learningObjectives: string[];
    difficulty: DifficultyLevel;
    estimatedReadingTime: number; // minutes
    contentDensity: 'low' | 'medium' | 'high';
  };
  
  // Educational content
  educational: {
    potentialQuestions: QuestionBank[];
    flashcards: Flashcard[];
    conceptMap: ConceptRelation[];
    examRelevance: ExamRelevance[];
  };
  
  // Processing status
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    completedSteps: ProcessingStep[];
    errors?: string[];
  };
}

export interface DocumentSection {
  id: string;
  title: string;
  level: number; // 1 = main heading, 2 = subheading, etc.
  content: string;
  pageStart: number;
  pageEnd: number;
  concepts: string[]; // IDs of related concepts
}

export interface Concept {
  id: string;
  name: string;
  definition: string;
  category: string;
  importance: 'core' | 'supporting' | 'supplementary';
  relatedConcepts: string[]; // IDs
  pageReferences: number[];
}

export interface Definition {
  id: string;
  term: string;
  definition: string;
  context: string;
  source: string; // section ID where found
  confidence: number; // 0-1
}

export interface Example {
  id: string;
  conceptId: string;
  description: string;
  code?: string;
  explanation: string;
}

export interface Formula {
  id: string;
  name: string;
  latex: string;
  variables: { symbol: string; meaning: string }[];
  context: string;
}

export interface Figure {
  id: string;
  caption: string;
  pageNumber: number;
  description: string; // AI-generated
  relevantConcepts: string[];
}

export interface Table {
  id: string;
  caption: string;
  headers: string[];
  data: string[][];
  summary: string; // AI-generated
}

export interface QuestionBank {
  id: string;
  conceptId: string;
  question: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel; // Bloom's taxonomy
  examProbability: number; // 0-1
  previouslyAsked?: boolean;
}

export interface Flashcard {
  id: string;
  conceptId: string;
  front: string;
  back: string;
  type: 'definition' | 'concept' | 'formula' | 'example' | 'comparison';
  difficulty: DifficultyLevel;
  tags: string[];
}

export interface ConceptRelation {
  sourceId: string;
  targetId: string;
  relationType: 'prerequisite' | 'related' | 'example' | 'application' | 'contrast';
  strength: number; // 0-1
}

export interface ExamRelevance {
  topic: string;
  probability: number; // 0-1
  historicalFrequency?: number;
  suggestedFocusLevel: 'high' | 'medium' | 'low';
  rationale: string;
}

export type DocumentType = 
  | 'textbook'
  | 'lecture_notes'
  | 'research_paper'
  | 'tutorial'
  | 'exam_paper'
  | 'assignment'
  | 'presentation'
  | 'other';

export type AcademicLevel = 
  | 'elementary'
  | 'middle_school'
  | 'high_school'
  | 'undergraduate'
  | 'graduate'
  | 'professional';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type QuestionType = 
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'calculation'
  | 'code'
  | 'diagram';

export type CognitiveLevel = 
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export interface ProcessingStep {
  step: string;
  status: 'completed' | 'failed';
  timestamp: string;
  details?: any;
}