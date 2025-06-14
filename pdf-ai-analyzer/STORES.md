# State Management Architecture - PDF AI Analyzer Educational Platform

## 🏗 Overview

State management using Zustand with domain-driven stores, persistence middleware, and optimistic updates. Each store manages a specific domain area with clear separation of concerns.

## 📦 Store Implementations

### Document Store

```typescript
// src/stores/documentStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { PDFDocument, DocumentAnalysis } from '@/types';

interface DocumentState {
  // State
  documents: Map<string, PDFDocument>;
  selectedDocumentId: string | null;
  uploadProgress: Map<string, number>;
  isLoading: boolean;
  error: string | null;
  
  // Filters & Search
  searchQuery: string;
  filters: {
    category: string | null;
    tags: string[];
    dateRange: [Date, Date] | null;
    isArchived: boolean;
    isFavorite: boolean;
  };
  sortBy: 'name' | 'date' | 'size' | 'relevance';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  addDocument: (document: PDFDocument) => void;
  updateDocument: (id: string, updates: Partial<PDFDocument>) => void;
  deleteDocument: (id: string) => void;
  setSelectedDocument: (id: string | null) => void;
  
  // Upload Actions
  setUploadProgress: (id: string, progress: number) => void;
  clearUploadProgress: (id: string) => void;
  
  // Analysis Actions
  updateAnalysis: (id: string, analysis: DocumentAnalysis) => void;
  
  // Filter Actions
  setSearchQuery: (query: string) => void;
  setFilter: (filter: keyof DocumentState['filters'], value: any) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: DocumentState['sortBy']) => void;
  toggleSortOrder: () => void;
  
  // Bulk Actions
  archiveDocuments: (ids: string[]) => void;
  deleteDocuments: (ids: string[]) => void;
  tagDocuments: (ids: string[], tags: string[]) => void;
  
  // Computed
  getFilteredDocuments: () => PDFDocument[];
  getDocumentById: (id: string) => PDFDocument | undefined;
  getAllTags: () => string[];
  getAllCategories: () => string[];
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      documents: new Map(),
      selectedDocumentId: null,
      uploadProgress: new Map(),
      isLoading: false,
      error: null,
      searchQuery: '',
      filters: {
        category: null,
        tags: [],
        dateRange: null,
        isArchived: false,
        isFavorite: false,
      },
      sortBy: 'date',
      sortOrder: 'desc',
      
      // Actions
      addDocument: (document) => set((state) => {
        state.documents.set(document.id, document);
      }),
      
      updateDocument: (id, updates) => set((state) => {
        const doc = state.documents.get(id);
        if (doc) {
          state.documents.set(id, { ...doc, ...updates, updatedAt: Date.now() });
        }
      }),
      
      deleteDocument: (id) => set((state) => {
        state.documents.delete(id);
        if (state.selectedDocumentId === id) {
          state.selectedDocumentId = null;
        }
      }),
      
      setSelectedDocument: (id) => set({ selectedDocumentId: id }),
      
      setUploadProgress: (id, progress) => set((state) => {
        state.uploadProgress.set(id, progress);
      }),
      
      clearUploadProgress: (id) => set((state) => {
        state.uploadProgress.delete(id);
      }),
      
      updateAnalysis: (id, analysis) => set((state) => {
        const doc = state.documents.get(id);
        if (doc) {
          doc.analysis = analysis;
        }
      }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilter: (filter, value) => set((state) => {
        state.filters[filter] = value;
      }),
      
      clearFilters: () => set((state) => {
        state.filters = {
          category: null,
          tags: [],
          dateRange: null,
          isArchived: false,
          isFavorite: false,
        };
        state.searchQuery = '';
      }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      toggleSortOrder: () => set((state) => {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      }),
      
      archiveDocuments: (ids) => set((state) => {
        ids.forEach(id => {
          const doc = state.documents.get(id);
          if (doc) {
            doc.isArchived = true;
            doc.updatedAt = Date.now();
          }
        });
      }),
      
      deleteDocuments: (ids) => set((state) => {
        ids.forEach(id => state.documents.delete(id));
      }),
      
      tagDocuments: (ids, tags) => set((state) => {
        ids.forEach(id => {
          const doc = state.documents.get(id);
          if (doc) {
            doc.tags = [...new Set([...doc.tags, ...tags])];
            doc.updatedAt = Date.now();
          }
        });
      }),
      
      // Computed
      getFilteredDocuments: () => {
        const state = get();
        let docs = Array.from(state.documents.values());
        
        // Apply filters
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          docs = docs.filter(doc => 
            doc.fileName.toLowerCase().includes(query) ||
            doc.metadata.title?.toLowerCase().includes(query) ||
            doc.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        if (state.filters.category) {
          docs = docs.filter(doc => doc.category === state.filters.category);
        }
        
        if (state.filters.tags.length > 0) {
          docs = docs.filter(doc => 
            state.filters.tags.every(tag => doc.tags.includes(tag))
          );
        }
        
        if (state.filters.isArchived !== undefined) {
          docs = docs.filter(doc => doc.isArchived === state.filters.isArchived);
        }
        
        if (state.filters.isFavorite !== undefined) {
          docs = docs.filter(doc => doc.isFavorite === state.filters.isFavorite);
        }
        
        // Apply sorting
        docs.sort((a, b) => {
          let comparison = 0;
          switch (state.sortBy) {
            case 'name':
              comparison = a.fileName.localeCompare(b.fileName);
              break;
            case 'date':
              comparison = a.uploadDate - b.uploadDate;
              break;
            case 'size':
              comparison = a.fileSize - b.fileSize;
              break;
          }
          return state.sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return docs;
      },
      
      getDocumentById: (id) => get().documents.get(id),
      
      getAllTags: () => {
        const tags = new Set<string>();
        get().documents.forEach(doc => {
          doc.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
      },
      
      getAllCategories: () => {
        const categories = new Set<string>();
        get().documents.forEach(doc => {
          if (doc.category) categories.add(doc.category);
        });
        return Array.from(categories).sort();
      },
    })),
    {
      name: 'document-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        documents: Array.from(state.documents.entries()),
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.documents instanceof Array) {
          state.documents = new Map(state.documents);
        }
      },
    }
  )
);
```

### Flashcard Store

```typescript
// src/stores/flashcardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { FlashcardDeck, Flashcard, ReviewRecord } from '@/types';

interface FlashcardState {
  // State
  decks: Map<string, FlashcardDeck>;
  currentDeckId: string | null;
  currentCardIndex: number;
  reviewSession: {
    deckId: string;
    cards: Flashcard[];
    currentIndex: number;
    startTime: number;
    responses: ReviewRecord[];
  } | null;
  
  // Settings
  studySettings: {
    autoPlayAudio: boolean;
    showHints: boolean;
    enableTimer: boolean;
    cardOrder: 'sequential' | 'random' | 'spaced-repetition';
  };
  
  // Actions
  createDeck: (deck: FlashcardDeck) => void;
  updateDeck: (id: string, updates: Partial<FlashcardDeck>) => void;
  deleteDeck: (id: string) => void;
  
  addCard: (deckId: string, card: Flashcard) => void;
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  
  // Review Session
  startReviewSession: (deckId: string) => void;
  submitReview: (rating: 1 | 2 | 3 | 4 | 5) => void;
  skipCard: () => void;
  previousCard: () => void;
  endReviewSession: () => void;
  
  // Spaced Repetition
  getCardsForReview: (deckId: string) => Flashcard[];
  updateCardSchedule: (card: Flashcard, rating: number) => Flashcard;
  
  // Statistics
  getDeckStats: (deckId: string) => DeckStats | null;
  getStudyStreak: () => number;
  
  // Import/Export
  importDeck: (deck: FlashcardDeck) => void;
  exportDeck: (deckId: string) => FlashcardDeck | null;
  
  // Settings
  updateStudySettings: (settings: Partial<FlashcardState['studySettings']>) => void;
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      decks: new Map(),
      currentDeckId: null,
      currentCardIndex: 0,
      reviewSession: null,
      studySettings: {
        autoPlayAudio: false,
        showHints: true,
        enableTimer: false,
        cardOrder: 'spaced-repetition',
      },
      
      // Deck Actions
      createDeck: (deck) => set((state) => {
        state.decks.set(deck.id, deck);
      }),
      
      updateDeck: (id, updates) => set((state) => {
        const deck = state.decks.get(id);
        if (deck) {
          Object.assign(deck, updates);
          deck.updatedAt = Date.now();
        }
      }),
      
      deleteDeck: (id) => set((state) => {
        state.decks.delete(id);
        if (state.currentDeckId === id) {
          state.currentDeckId = null;
        }
      }),
      
      // Card Actions
      addCard: (deckId, card) => set((state) => {
        const deck = state.decks.get(deckId);
        if (deck) {
          deck.cards.push(card);
          deck.updatedAt = Date.now();
        }
      }),
      
      updateCard: (deckId, cardId, updates) => set((state) => {
        const deck = state.decks.get(deckId);
        if (deck) {
          const cardIndex = deck.cards.findIndex(c => c.id === cardId);
          if (cardIndex !== -1) {
            Object.assign(deck.cards[cardIndex], updates);
            deck.cards[cardIndex].updatedAt = Date.now();
          }
        }
      }),
      
      deleteCard: (deckId, cardId) => set((state) => {
        const deck = state.decks.get(deckId);
        if (deck) {
          deck.cards = deck.cards.filter(c => c.id !== cardId);
          deck.updatedAt = Date.now();
        }
      }),
      
      // Review Session Actions
      startReviewSession: (deckId) => {
        const deck = get().decks.get(deckId);
        if (!deck) return;
        
        const cards = get().getCardsForReview(deckId);
        if (cards.length === 0) return;
        
        set({
          reviewSession: {
            deckId,
            cards,
            currentIndex: 0,
            startTime: Date.now(),
            responses: [],
          },
        });
      },
      
      submitReview: (rating) => set((state) => {
        if (!state.reviewSession) return;
        
        const currentCard = state.reviewSession.cards[state.reviewSession.currentIndex];
        const updatedCard = get().updateCardSchedule(currentCard, rating);
        
        // Update card in deck
        const deck = state.decks.get(state.reviewSession.deckId);
        if (deck) {
          const cardIndex = deck.cards.findIndex(c => c.id === currentCard.id);
          if (cardIndex !== -1) {
            deck.cards[cardIndex] = updatedCard;
          }
        }
        
        // Add review record
        state.reviewSession.responses.push({
          timestamp: Date.now(),
          rating,
          timeSpent: Date.now() - state.reviewSession.startTime,
          hintsUsed: 0,
        });
        
        // Move to next card
        if (state.reviewSession.currentIndex < state.reviewSession.cards.length - 1) {
          state.reviewSession.currentIndex++;
        } else {
          // Session complete
          get().endReviewSession();
        }
      }),
      
      skipCard: () => set((state) => {
        if (!state.reviewSession) return;
        
        if (state.reviewSession.currentIndex < state.reviewSession.cards.length - 1) {
          state.reviewSession.currentIndex++;
        }
      }),
      
      previousCard: () => set((state) => {
        if (!state.reviewSession) return;
        
        if (state.reviewSession.currentIndex > 0) {
          state.reviewSession.currentIndex--;
        }
      }),
      
      endReviewSession: () => set({ reviewSession: null }),
      
      // Spaced Repetition Implementation
      getCardsForReview: (deckId) => {
        const deck = get().decks.get(deckId);
        if (!deck) return [];
        
        const now = Date.now();
        const dueCards = deck.cards.filter(card => {
          if (!card.nextReview) return true; // New cards
          return card.nextReview <= now;
        });
        
        // Sort by priority: new cards first, then by interval
        return dueCards.sort((a, b) => {
          if (!a.lastReview && b.lastReview) return -1;
          if (a.lastReview && !b.lastReview) return 1;
          return a.interval - b.interval;
        });
      },
      
      updateCardSchedule: (card, rating) => {
        // SM-2 Algorithm Implementation
        const newCard = { ...card };
        const quality = rating - 1; // Convert 1-5 to 0-4
        
        if (quality < 3) {
          // Failed card, reset
          newCard.repetitions = 0;
          newCard.interval = 1;
        } else {
          newCard.repetitions++;
          
          if (newCard.repetitions === 1) {
            newCard.interval = 1;
          } else if (newCard.repetitions === 2) {
            newCard.interval = 6;
          } else {
            newCard.interval = Math.round(newCard.interval * newCard.easeFactor);
          }
          
          // Update ease factor
          newCard.easeFactor = Math.max(
            1.3,
            newCard.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
          );
        }
        
        newCard.lastReview = Date.now();
        newCard.nextReview = Date.now() + newCard.interval * 24 * 60 * 60 * 1000;
        
        // Add to review history
        if (!newCard.reviewHistory) newCard.reviewHistory = [];
        newCard.reviewHistory.push({
          timestamp: Date.now(),
          rating,
          timeSpent: 0,
          hintsUsed: 0,
        });
        
        return newCard;
      },
      
      // Statistics
      getDeckStats: (deckId) => {
        const deck = get().decks.get(deckId);
        if (!deck) return null;
        
        const now = Date.now();
        const stats = {
          totalCards: deck.cards.length,
          newCards: deck.cards.filter(c => !c.lastReview).length,
          learningCards: deck.cards.filter(c => c.repetitions > 0 && c.repetitions < 3).length,
          reviewCards: deck.cards.filter(c => c.nextReview && c.nextReview <= now).length,
          averageEase: deck.cards.reduce((sum, c) => sum + c.easeFactor, 0) / deck.cards.length,
          averageInterval: deck.cards.reduce((sum, c) => sum + c.interval, 0) / deck.cards.length,
          studyStreak: 0, // Calculate from review history
          retention: 0.85, // Calculate from review history
        };
        
        return stats;
      },
      
      getStudyStreak: () => {
        // Implementation would check review history across all decks
        return 0;
      },
      
      // Import/Export
      importDeck: (deck) => set((state) => {
        state.decks.set(deck.id, deck);
      }),
      
      exportDeck: (deckId) => {
        return get().decks.get(deckId) || null;
      },
      
      // Settings
      updateStudySettings: (settings) => set((state) => {
        Object.assign(state.studySettings, settings);
      }),
    })),
    {
      name: 'flashcard-storage',
      partialize: (state) => ({
        decks: Array.from(state.decks.entries()),
        studySettings: state.studySettings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.decks instanceof Array) {
          state.decks = new Map(state.decks);
        }
      },
    }
  )
);
```

### Quiz Store

```typescript
// src/stores/quizStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Quiz, QuizAttempt, QuizResponse, QuizQuestion } from '@/types';

interface QuizState {
  // State
  quizzes: Map<string, Quiz>;
  activeQuiz: {
    quiz: Quiz;
    attempt: QuizAttempt;
    currentQuestionIndex: number;
    timeRemaining: number;
    isPaused: boolean;
  } | null;
  
  // Quiz Builder
  draftQuiz: Partial<Quiz> | null;
  questionBank: QuizQuestion[];
  
  // Actions
  createQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  duplicateQuiz: (id: string) => void;
  
  // Quiz Session
  startQuiz: (quizId: string, userId: string) => void;
  submitAnswer: (response: QuizResponse) => void;
  flagQuestion: (questionId: string) => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  endQuiz: () => void;
  navigateToQuestion: (index: number) => void;
  
  // Timer
  updateTimeRemaining: (seconds: number) => void;
  
  // Quiz Builder
  startDraftQuiz: (base?: Partial<Quiz>) => void;
  updateDraftQuiz: (updates: Partial<Quiz>) => void;
  addQuestionToDraft: (question: QuizQuestion) => void;
  removeQuestionFromDraft: (questionId: string) => void;
  reorderDraftQuestions: (fromIndex: number, toIndex: number) => void;
  saveDraftQuiz: () => void;
  discardDraftQuiz: () => void;
  
  // Question Bank
  addToQuestionBank: (questions: QuizQuestion[]) => void;
  removeFromQuestionBank: (questionIds: string[]) => void;
  
  // Analytics
  getQuizAnalytics: (quizId: string) => QuizAnalytics | null;
  getUserPerformance: (userId: string) => UserQuizPerformance;
  
  // Import/Export
  importQuiz: (quiz: Quiz) => void;
  exportQuiz: (quizId: string) => Quiz | null;
}

interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  averageTime: number;
  questionStats: {
    questionId: string;
    correctRate: number;
    averageTime: number;
    commonWrongAnswers: string[];
  }[];
  completionRate: number;
}

interface UserQuizPerformance {
  totalQuizzesTaken: number;
  averageScore: number;
  improvement: number;
  strongTopics: string[];
  weakTopics: string[];
}

export const useQuizStore = create<QuizState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      quizzes: new Map(),
      activeQuiz: null,
      draftQuiz: null,
      questionBank: [],
      
      // Quiz Management
      createQuiz: (quiz) => set((state) => {
        state.quizzes.set(quiz.id, quiz);
      }),
      
      updateQuiz: (id, updates) => set((state) => {
        const quiz = state.quizzes.get(id);
        if (quiz) {
          Object.assign(quiz, updates);
          quiz.updatedAt = Date.now();
        }
      }),
      
      deleteQuiz: (id) => set((state) => {
        state.quizzes.delete(id);
      }),
      
      duplicateQuiz: (id) => set((state) => {
        const original = state.quizzes.get(id);
        if (original) {
          const duplicate = {
            ...original,
            id: generateId(),
            title: `${original.title} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            attempts: [],
          };
          state.quizzes.set(duplicate.id, duplicate);
        }
      }),
      
      // Quiz Session Management
      startQuiz: (quizId, userId) => {
        const quiz = get().quizzes.get(quizId);
        if (!quiz) return;
        
        const attempt: QuizAttempt = {
          id: generateId(),
          quizId,
          userId,
          responses: [],
          score: 0,
          percentage: 0,
          timeSpent: 0,
          status: 'in-progress',
          startedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set({
          activeQuiz: {
            quiz,
            attempt,
            currentQuestionIndex: 0,
            timeRemaining: quiz.timeLimit ? quiz.timeLimit * 60 : Infinity,
            isPaused: false,
          },
        });
      },
      
      submitAnswer: (response) => set((state) => {
        if (!state.activeQuiz) return;
        
        // Add or update response
        const existingIndex = state.activeQuiz.attempt.responses.findIndex(
          r => r.questionId === response.questionId
        );
        
        if (existingIndex !== -1) {
          state.activeQuiz.attempt.responses[existingIndex] = response;
        } else {
          state.activeQuiz.attempt.responses.push(response);
        }
        
        // Auto-advance if configured
        if (state.activeQuiz.quiz.settings.showFeedback !== 'immediate') {
          if (state.activeQuiz.currentQuestionIndex < state.activeQuiz.quiz.questions.length - 1) {
            state.activeQuiz.currentQuestionIndex++;
          }
        }
      }),
      
      flagQuestion: (questionId) => set((state) => {
        // Implementation for flagging questions for review
      }),
      
      pauseQuiz: () => set((state) => {
        if (state.activeQuiz) {
          state.activeQuiz.isPaused = true;
        }
      }),
      
      resumeQuiz: () => set((state) => {
        if (state.activeQuiz) {
          state.activeQuiz.isPaused = false;
        }
      }),
      
      endQuiz: () => set((state) => {
        if (!state.activeQuiz) return;
        
        // Calculate final score
        const { quiz, attempt } = state.activeQuiz;
        let totalScore = 0;
        let maxScore = 0;
        
        attempt.responses.forEach(response => {
          const question = quiz.questions.find(q => q.id === response.questionId);
          if (question) {
            maxScore += question.points;
            if (response.isCorrect) {
              totalScore += response.pointsEarned;
            }
          }
        });
        
        attempt.score = totalScore;
        attempt.percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        attempt.status = 'completed';
        attempt.completedAt = Date.now();
        attempt.timeSpent = Date.now() - attempt.startedAt;
        
        // Add attempt to quiz
        const storedQuiz = state.quizzes.get(quiz.id);
        if (storedQuiz) {
          storedQuiz.attempts.push(attempt);
          storedQuiz.averageScore = 
            storedQuiz.attempts.reduce((sum, a) => sum + a.percentage, 0) / 
            storedQuiz.attempts.length;
        }
        
        state.activeQuiz = null;
      }),
      
      navigateToQuestion: (index) => set((state) => {
        if (state.activeQuiz && index >= 0 && index < state.activeQuiz.quiz.questions.length) {
          state.activeQuiz.currentQuestionIndex = index;
        }
      }),
      
      updateTimeRemaining: (seconds) => set((state) => {
        if (state.activeQuiz) {
          state.activeQuiz.timeRemaining = seconds;
          if (seconds <= 0) {
            get().endQuiz();
          }
        }
      }),
      
      // Quiz Builder
      startDraftQuiz: (base) => set({
        draftQuiz: base || {
          title: '',
          description: '',
          questions: [],
          settings: {
            shuffleQuestions: false,
            shuffleAnswers: true,
            showFeedback: 'after-submission',
            allowRetakes: true,
            showCorrectAnswers: true,
            requireAllAnswers: false,
            preventGoingBack: false,
            enableCalculator: false,
            enableScratchPad: false,
          },
          tags: [],
          category: '',
          difficulty: 'medium',
        },
      }),
      
      updateDraftQuiz: (updates) => set((state) => {
        if (state.draftQuiz) {
          Object.assign(state.draftQuiz, updates);
        }
      }),
      
      addQuestionToDraft: (question) => set((state) => {
        if (state.draftQuiz) {
          if (!state.draftQuiz.questions) {
            state.draftQuiz.questions = [];
          }
          state.draftQuiz.questions.push(question);
        }
      }),
      
      removeQuestionFromDraft: (questionId) => set((state) => {
        if (state.draftQuiz && state.draftQuiz.questions) {
          state.draftQuiz.questions = state.draftQuiz.questions.filter(
            q => q.id !== questionId
          );
        }
      }),
      
      reorderDraftQuestions: (fromIndex, toIndex) => set((state) => {
        if (state.draftQuiz && state.draftQuiz.questions) {
          const questions = [...state.draftQuiz.questions];
          const [removed] = questions.splice(fromIndex, 1);
          questions.splice(toIndex, 0, removed);
          state.draftQuiz.questions = questions;
        }
      }),
      
      saveDraftQuiz: () => {
        const draft = get().draftQuiz;
        if (!draft || !draft.title || !draft.questions?.length) return;
        
        const quiz: Quiz = {
          id: generateId(),
          title: draft.title,
          description: draft.description || '',
          questions: draft.questions,
          settings: draft.settings!,
          sourceDocuments: draft.sourceDocuments || [],
          tags: draft.tags || [],
          category: draft.category || '',
          attempts: [],
          averageScore: 0,
          difficulty: draft.difficulty || 'medium',
          timeLimit: draft.timeLimit,
          passingScore: draft.passingScore,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        get().createQuiz(quiz);
        set({ draftQuiz: null });
      },
      
      discardDraftQuiz: () => set({ draftQuiz: null }),
      
      // Question Bank
      addToQuestionBank: (questions) => set((state) => {
        state.questionBank.push(...questions);
      }),
      
      removeFromQuestionBank: (questionIds) => set((state) => {
        state.questionBank = state.questionBank.filter(
          q => !questionIds.includes(q.id)
        );
      }),
      
      // Analytics
      getQuizAnalytics: (quizId) => {
        const quiz = get().quizzes.get(quizId);
        if (!quiz || quiz.attempts.length === 0) return null;
        
        const questionStats = quiz.questions.map(question => {
          const responses = quiz.attempts.flatMap(a => 
            a.responses.filter(r => r.questionId === question.id)
          );
          
          const correctRate = responses.filter(r => r.isCorrect).length / responses.length;
          const averageTime = responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length;
          
          return {
            questionId: question.id,
            correctRate,
            averageTime,
            commonWrongAnswers: [], // Would need more complex analysis
          };
        });
        
        return {
          totalAttempts: quiz.attempts.length,
          averageScore: quiz.averageScore,
          averageTime: quiz.attempts.reduce((sum, a) => sum + a.timeSpent, 0) / quiz.attempts.length,
          questionStats,
          completionRate: quiz.attempts.filter(a => a.status === 'completed').length / quiz.attempts.length,
        };
      },
      
      getUserPerformance: (userId) => {
        const quizzes = Array.from(get().quizzes.values());
        const userAttempts = quizzes.flatMap(q => 
          q.attempts.filter(a => a.userId === userId)
        );
        
        if (userAttempts.length === 0) {
          return {
            totalQuizzesTaken: 0,
            averageScore: 0,
            improvement: 0,
            strongTopics: [],
            weakTopics: [],
          };
        }
        
        // Calculate performance metrics
        const averageScore = userAttempts.reduce((sum, a) => sum + a.percentage, 0) / userAttempts.length;
        
        // Would need more complex analysis for topics and improvement
        return {
          totalQuizzesTaken: userAttempts.length,
          averageScore,
          improvement: 0,
          strongTopics: [],
          weakTopics: [],
        };
      },
      
      // Import/Export
      importQuiz: (quiz) => set((state) => {
        state.quizzes.set(quiz.id, quiz);
      }),
      
      exportQuiz: (quizId) => {
        return get().quizzes.get(quizId) || null;
      },
    })),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        quizzes: Array.from(state.quizzes.entries()),
        questionBank: state.questionBank,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.quizzes instanceof Array) {
          state.quizzes = new Map(state.quizzes);
        }
      },
    }
  )
);
```

### UI Store

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Layout
  sidebarOpen: boolean;
  sidebarWidth: number;
  
  // Modals
  modals: {
    upload: boolean;
    settings: boolean;
    help: boolean;
    share: boolean;
  };
  
  // Notifications
  notifications: Notification[];
  
  // View Preferences
  viewMode: 'grid' | 'list';
  density: 'compact' | 'normal' | 'comfortable';
  
  // Mobile
  isMobile: boolean;
  isTablet: boolean;
  
  // Actions
  setTheme: (theme: UIState['theme']) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setViewMode: (mode: UIState['viewMode']) => void;
  setDensity: (density: UIState['density']) => void;
  setDeviceType: (isMobile: boolean, isTablet: boolean) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial State
      theme: 'system',
      sidebarOpen: true,
      sidebarWidth: 280,
      modals: {
        upload: false,
        settings: false,
        help: false,
        share: false,
      },
      notifications: [],
      viewMode: 'grid',
      density: 'normal',
      isMobile: false,
      isTablet: false,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      
      openModal: (modal) => set((state) => ({
        modals: { ...state.modals, [modal]: true }
      })),
      
      closeModal: (modal) => set((state) => ({
        modals: { ...state.modals, [modal]: false }
      })),
      
      addNotification: (notification) => set((state) => {
        const newNotification = {
          ...notification,
          id: generateId(),
        };
        
        // Auto-remove after duration
        if (notification.duration) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter(n => n.id !== newNotification.id)
            }));
          }, notification.duration);
        }
        
        return {
          notifications: [...state.notifications, newNotification]
        };
      }),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setDensity: (density) => set({ density }),
      
      setDeviceType: (isMobile, isTablet) => set({ isMobile, isTablet }),
    }),
    {
      name: 'ui-preferences',
      partialize: (state) => ({
        theme: state.theme,
        sidebarWidth: state.sidebarWidth,
        viewMode: state.viewMode,
        density: state.density,
      }),
    }
  )
);
```

## 🎯 Store Usage Examples

### Using Document Store

```typescript
// In a component
import { useDocumentStore } from '@/stores/documentStore';

function DocumentLibrary() {
  const {
    documents,
    searchQuery,
    setSearchQuery,
    getFilteredDocuments,
    deleteDocument,
  } = useDocumentStore();
  
  const filteredDocs = getFilteredDocuments();
  
  return (
    <div>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
      />
      
      <DocumentGrid
        documents={filteredDocs}
        onDelete={deleteDocument}
      />
    </div>
  );
}
```

### Using Multiple Stores

```typescript
// Creating a quiz from documents
import { useDocumentStore } from '@/stores/documentStore';
import { useQuizStore } from '@/stores/quizStore';

function CreateQuizFromDocuments() {
  const selectedDocuments = useDocumentStore(state => 
    Array.from(state.documents.values()).filter(doc => doc.isSelected)
  );
  
  const { startDraftQuiz, addQuestionToDraft } = useQuizStore();
  
  const handleCreateQuiz = async () => {
    startDraftQuiz({
      title: 'New Quiz',
      sourceDocuments: selectedDocuments.map(d => d.id),
    });
    
    // Generate questions from documents
    for (const doc of selectedDocuments) {
      const questions = await generateQuestionsFromDocument(doc);
      questions.forEach(q => addQuestionToDraft(q));
    }
  };
}
```

## 🔧 Store Patterns

### Computed Values
Use getter functions for derived state instead of storing computed values.

### Optimistic Updates
Update UI immediately, then sync with backend.

### Persistence
Only persist essential data, exclude transient UI state.

### Performance
Use Maps for large collections, implement virtualization for lists.

### Type Safety
Leverage TypeScript for all store interfaces and actions.

---

*This state management architecture provides a scalable foundation for the PDF AI Analyzer educational platform with clear separation of concerns and optimal performance.*