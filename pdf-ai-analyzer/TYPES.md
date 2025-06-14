# TypeScript Types & Interfaces - PDF AI Analyzer Educational Platform

## 📝 Global Type Definitions

```typescript
// ============================================
// Common Types
// ============================================

export type ID = string;
export type Timestamp = number;
export type ISODateString = string;

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id: ID;
  email: string;
  name: string;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  studyReminders: boolean;
  defaultQuizLength: number;
  difficultyPreference: DifficultyLevel | 'adaptive';
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
}

export interface UserStats {
  totalStudyTime: number;
  documentsProcessed: number;
  flashcardsReviewed: number;
  quizzesTaken: number;
  averageScore: number;
  streak: number;
  lastActiveDate: Timestamp;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// ============================================
// Document Types
// ============================================

export interface PDFDocument extends BaseEntity {
  fileName: string;
  fileSize: number;
  fileHash: string;
  uploadDate: Timestamp;
  lastModified: Timestamp;
  pdfData: Blob | ArrayBuffer;
  extractedText: string;
  metadata: PDFMetadata;
  analysis: DocumentAnalysis;
  tags: string[];
  category: string;
  isArchived: boolean;
  isFavorite: boolean;
  readingProgress: number;
  notes: string;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  pageCount: number;
  language?: string;
}

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  concepts: Concept[];
  topics: Topic[];
  difficulty: DifficultyLevel;
  readingTime: number;
  questions: GeneratedQuestion[];
  entities: ExtractedEntity[];
  sentiment?: SentimentAnalysis;
  language: string;
  analysisVersion: string;
  completedAt: Timestamp;
}

export interface Concept {
  id: ID;
  term: string;
  definition: string;
  importance: number; // 0-1
  frequency: number;
  relatedConcepts: ID[];
  examples: string[];
  documentIds: ID[];
  category?: string;
}

export interface Topic {
  id: ID;
  name: string;
  weight: number; // 0-1
  subtopics: Topic[];
  relatedDocuments: ID[];
  keyTerms: string[];
}

export interface ExtractedEntity {
  text: string;
  type: 'person' | 'location' | 'date' | 'organization' | 'concept';
  confidence: number;
  context: string;
  position: TextPosition;
}

export interface TextPosition {
  page: number;
  start: number;
  end: number;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
}

// ============================================
// Study Types
// ============================================

export interface StudyGuide extends BaseEntity {
  title: string;
  description: string;
  documentIds: ID[];
  outline: StudyOutline;
  summaries: Summary[];
  concepts: ID[]; // References to Concept IDs
  estimatedStudyTime: number;
  difficulty: DifficultyLevel;
  tags: string[];
  isPublic: boolean;
  sharedWith: ID[]; // User IDs
}

export interface StudyOutline {
  sections: OutlineSection[];
  learningObjectives: string[];
  prerequisites: string[];
}

export interface OutlineSection {
  id: ID;
  title: string;
  content: string;
  subsections: OutlineSection[];
  concepts: ID[];
  estimatedTime: number;
  completed: boolean;
}

export interface Summary {
  id: ID;
  type: 'chapter' | 'section' | 'document' | 'concept';
  title: string;
  content: string;
  bulletPoints: string[];
  sourceReferences: SourceReference[];
}

export interface SourceReference {
  documentId: ID;
  page?: number;
  position?: TextPosition;
  text: string;
}

export interface StudySession extends BaseEntity {
  duration: number;
  activities: StudyActivity[];
  documentsStudied: ID[];
  conceptsReviewed: ID[];
  questionsAnswered: number;
  correctAnswers: number;
  notes: string;
  mood?: 'focused' | 'distracted' | 'tired' | 'energetic';
  breaks: Break[];
}

export interface StudyActivity {
  type: 'reading' | 'flashcards' | 'quiz' | 'notes' | 'summary';
  startTime: Timestamp;
  endTime: Timestamp;
  targetId: ID; // Document, Flashcard Deck, or Quiz ID
  progress: number;
  performance?: number;
}

export interface Break {
  startTime: Timestamp;
  duration: number;
  type: 'short' | 'long' | 'exercise' | 'meal';
}

// ============================================
// Flashcard Types
// ============================================

export interface FlashcardDeck extends BaseEntity {
  name: string;
  description: string;
  cards: Flashcard[];
  tags: string[];
  sourceDocuments: ID[];
  isPublic: boolean;
  difficulty: DifficultyLevel;
  category: string;
  settings: DeckSettings;
  stats: DeckStats;
}

export interface Flashcard extends BaseEntity {
  deckId: ID;
  front: FlashcardContent;
  back: FlashcardContent;
  type: FlashcardType;
  documentId?: ID;
  conceptId?: ID;
  difficulty: number; // 0-1
  tags: string[];
  // Spaced Repetition fields
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  nextReview: Timestamp;
  lastReview?: Timestamp;
  reviewHistory: ReviewRecord[];
  isLeeched: boolean;
  notes?: string;
}

export type FlashcardType = 
  | 'basic'
  | 'basic-reversed'
  | 'cloze'
  | 'image-occlusion'
  | 'type-answer'
  | 'multiple-choice';

export interface FlashcardContent {
  text?: string;
  image?: string;
  audio?: string;
  latex?: string;
  code?: {
    language: string;
    content: string;
  };
  diagram?: DiagramContent;
}

export interface DiagramContent {
  type: 'flowchart' | 'mindmap' | 'sequence' | 'graph';
  data: any; // Specific to diagram type
}

export interface ReviewRecord {
  timestamp: Timestamp;
  rating: 1 | 2 | 3 | 4 | 5; // Again, Hard, Good, Easy, Perfect
  timeSpent: number; // seconds
  hintsUsed: number;
}

export interface DeckSettings {
  newCardsPerDay: number;
  reviewsPerDay: number;
  graduatingInterval: number;
  easyInterval: number;
  startingEase: number;
  minimumInterval: number;
  leechThreshold: number;
  leechAction: 'suspend' | 'tag';
}

export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  averageEase: number;
  averageInterval: number;
  studyStreak: number;
  retention: number;
}

// ============================================
// Quiz & Assessment Types
// ============================================

export interface Quiz extends BaseEntity {
  title: string;
  description: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  sourceDocuments: ID[];
  tags: string[];
  category: string;
  attempts: QuizAttempt[];
  averageScore: number;
  difficulty: DifficultyLevel;
  timeLimit?: number; // minutes
  passingScore?: number; // percentage
  certificateTemplate?: string;
}

export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'long-answer'
  | 'matching'
  | 'ordering'
  | 'fill-blank'
  | 'image-based'
  | 'diagram-label'
  | 'code-completion'
  | 'mathematical';

export interface QuizQuestion {
  id: ID;
  type: QuestionType;
  question: QuestionContent;
  answers: Answer[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: DifficultyLevel;
  tags: string[];
  hint?: string;
  media?: MediaContent[];
  sourceReference?: SourceReference;
  timeLimitSeconds?: number;
  rubric?: GradingRubric;
}

export interface QuestionContent {
  text: string;
  latex?: string;
  code?: CodeContent;
  image?: string;
  audio?: string;
  context?: string;
}

export interface Answer {
  id: string;
  text: string;
  image?: string;
  isCorrect?: boolean;
  feedback?: string;
  matchingPair?: string; // For matching questions
  order?: number; // For ordering questions
}

export interface MediaContent {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  caption?: string;
  timestamp?: number; // For video/audio
}

export interface CodeContent {
  language: string;
  code: string;
  highlightLines?: number[];
  readOnly?: boolean;
}

export interface GradingRubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  score: number;
  description: string;
  examples?: string[];
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showFeedback: 'immediate' | 'after-submission' | 'never';
  allowRetakes: boolean;
  maxRetakes?: number;
  showCorrectAnswers: boolean;
  requireAllAnswers: boolean;
  preventGoingBack: boolean;
  enableCalculator: boolean;
  enableScratchPad: boolean;
}

export interface QuizAttempt extends BaseEntity {
  quizId: ID;
  userId: ID;
  responses: QuizResponse[];
  score: number;
  percentage: number;
  timeSpent: number; // seconds
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Timestamp;
  completedAt?: Timestamp;
  ipAddress?: string;
  deviceInfo?: DeviceInfo;
}

export interface QuizResponse {
  questionId: ID;
  answer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
  hintsUsed: string[];
  attempts: number;
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: string;
  browser: string;
  screenSize: string;
}

// ============================================
// Question Generation & Prediction Types
// ============================================

export interface GeneratedQuestion extends QuizQuestion {
  generationMethod: 'ai' | 'template' | 'extracted';
  confidence: number;
  sourceContext: string;
  alternativeQuestions?: QuizQuestion[];
}

export interface QuestionPrediction {
  question: GeneratedQuestion;
  likelihood: number; // 0-1
  reasoning: string;
  historicalFrequency?: number;
  topicCoverage: number;
  lastSeen?: Timestamp;
  similarQuestions: ID[];
}

export interface ExamPattern {
  id: ID;
  examType: string; // SAT, GRE, etc.
  questionDistribution: {
    [key in QuestionType]?: number;
  };
  topicDistribution: {
    [topic: string]: number;
  };
  difficultyProgression: DifficultyLevel[];
  averageDuration: number;
  commonFormats: QuestionType[];
}

// ============================================
// Import & OCR Types
// ============================================

export interface ImportJob extends BaseEntity {
  fileName: string;
  fileType: 'pdf' | 'image' | 'docx' | 'txt';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: ImportResult;
  error?: string;
  settings: ImportSettings;
}

export interface ImportSettings {
  detectQuestions: boolean;
  extractImages: boolean;
  preserveFormatting: boolean;
  language: string;
  questionDelimiter?: string;
  answerDelimiter?: string;
}

export interface ImportResult {
  documentId?: ID;
  extractedQuestions: ExtractedQuestion[];
  extractedImages: ExtractedImage[];
  metadata: any;
  warnings: string[];
}

export interface ExtractedQuestion {
  rawText: string;
  parsedQuestion: Partial<QuizQuestion>;
  confidence: number;
  needsReview: boolean;
  suggestedType: QuestionType;
  page?: number;
  position?: TextPosition;
}

export interface ExtractedImage {
  url: string;
  caption?: string;
  page: number;
  dimensions: {
    width: number;
    height: number;
  };
  type: 'diagram' | 'chart' | 'photo' | 'equation';
}

// ============================================
// Analytics Types
// ============================================

export interface StudyAnalytics {
  userId: ID;
  period: AnalyticsPeriod;
  metrics: StudyMetrics;
  insights: StudyInsight[];
  comparisons: PeerComparison[];
  recommendations: Recommendation[];
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year' | 'all-time';

export interface StudyMetrics {
  totalTime: number;
  averageSessionLength: number;
  documentsRead: number;
  pagesRead: number;
  flashcardsReviewed: number;
  quizzesTaken: number;
  averageScore: number;
  improvement: number;
  consistency: number; // 0-1
  topicsStudied: TopicMetric[];
  peakHours: HourlyMetric[];
  streakDays: number;
}

export interface TopicMetric {
  topic: string;
  timeSpent: number;
  mastery: number; // 0-1
  questionsAnswered: number;
  accuracy: number;
  lastStudied: Timestamp;
}

export interface HourlyMetric {
  hour: number; // 0-23
  productivity: number; // 0-1
  focusScore: number; // 0-1
  sessionsCount: number;
}

export interface StudyInsight {
  type: InsightType;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  importance: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
  relatedMetrics: string[];
}

export type InsightType = 
  | 'performance-trend'
  | 'study-pattern'
  | 'weakness-identified'
  | 'strength-identified'
  | 'efficiency-tip'
  | 'retention-analysis'
  | 'prediction-accuracy';

export interface PeerComparison {
  metric: string;
  userValue: number;
  peerAverage: number;
  percentile: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface Recommendation {
  id: ID;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetId?: ID; // Document, Quiz, or Flashcard Deck ID
  estimatedImpact: number; // 0-1
  estimatedTime: number; // minutes
  reason: string;
}

export type RecommendationType = 
  | 'study-material'
  | 'review-needed'
  | 'practice-quiz'
  | 'break-suggested'
  | 'topic-focus'
  | 'method-change'
  | 'goal-setting';

// ============================================
// AI Service Types
// ============================================

export interface AIRequest {
  prompt: string;
  context?: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json' | 'markdown';
}

export type AIModel = 
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'local-llm';

export interface AIResponse {
  content: string;
  model: AIModel;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
  };
  metadata?: any;
}

export interface RAGContext {
  query: string;
  documents: ID[];
  maxChunks: number;
  similarityThreshold: number;
  includeMetadata: boolean;
}

export interface RAGResult {
  chunks: ContextChunk[];
  relevanceScores: number[];
  metadata: any;
}

export interface ContextChunk {
  text: string;
  documentId: ID;
  position: TextPosition;
  similarity: number;
  metadata?: any;
}

// ============================================
// Storage Types
// ============================================

export interface StorageStats {
  totalSize: number;
  documentCount: number;
  flashcardCount: number;
  quizCount: number;
  lastCleanup: Timestamp;
  compressionRatio: number;
}

export interface BackupData {
  version: string;
  createdAt: Timestamp;
  documents: PDFDocument[];
  flashcardDecks: FlashcardDeck[];
  quizzes: Quiz[];
  studySessions: StudySession[];
  userPreferences: UserPreferences;
}

export interface SyncStatus {
  lastSync: Timestamp;
  pendingChanges: number;
  conflicts: SyncConflict[];
  isOnline: boolean;
}

export interface SyncConflict {
  id: ID;
  type: 'document' | 'flashcard' | 'quiz';
  localVersion: any;
  remoteVersion: any;
  resolution?: 'local' | 'remote' | 'merge';
}

// ============================================
// Error Types
// ============================================

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Timestamp;
  stack?: string;
  userMessage?: string;
}

export type ErrorCode = 
  | 'PDF_PARSE_ERROR'
  | 'AI_SERVICE_ERROR'
  | 'STORAGE_FULL'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'QUOTA_EXCEEDED';

// ============================================
// Event Types
// ============================================

export interface AppEvent {
  type: EventType;
  payload: any;
  timestamp: Timestamp;
  userId?: ID;
  sessionId: string;
}

export type EventType = 
  | 'document.uploaded'
  | 'document.analyzed'
  | 'flashcard.reviewed'
  | 'quiz.completed'
  | 'study.session.started'
  | 'study.session.ended'
  | 'achievement.unlocked'
  | 'error.occurred';
```

## 📚 Usage Examples

```typescript
// Example: Creating a new document
const newDocument: PDFDocument = {
  id: generateId(),
  fileName: 'biology-textbook.pdf',
  fileSize: 5242880,
  fileHash: 'abc123...',
  uploadDate: Date.now(),
  lastModified: Date.now(),
  pdfData: pdfBlob,
  extractedText: '',
  metadata: {
    title: 'Introduction to Biology',
    author: 'Dr. Smith',
    // ... other metadata
  },
  analysis: {
    summary: '',
    keyPoints: [],
    concepts: [],
    // ... will be filled by AI analysis
  },
  tags: ['biology', 'science'],
  category: 'textbook',
  isArchived: false,
  isFavorite: false,
  readingProgress: 0,
  notes: '',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Example: Creating a quiz question
const multipleChoiceQuestion: QuizQuestion = {
  id: generateId(),
  type: 'multiple-choice',
  question: {
    text: 'What is the powerhouse of the cell?',
    context: 'This organelle is responsible for producing ATP.'
  },
  answers: [
    { id: 'a', text: 'Nucleus', isCorrect: false },
    { id: 'b', text: 'Mitochondria', isCorrect: true },
    { id: 'c', text: 'Ribosome', isCorrect: false },
    { id: 'd', text: 'Golgi apparatus', isCorrect: false }
  ],
  correctAnswer: 'b',
  explanation: 'Mitochondria are known as the powerhouse of the cell...',
  points: 1,
  difficulty: 'easy',
  tags: ['biology', 'cell-structure'],
  hint: 'Think about which organelle is involved in energy production.'
};
```

---

*These type definitions provide a comprehensive foundation for type-safe development of the PDF AI Analyzer educational platform.*