# File Structure - PDF AI Analyzer Educational Platform

## 📁 Complete Project Tree

```
pdf-ai-analyzer/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   └── ISSUE_TEMPLATE/
├── public/
│   ├── icons/
│   ├── fonts/
│   ├── manifest.json
│   ├── robots.txt
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Spinner/
│   │   │   ├── Toast/
│   │   │   ├── Tooltip/
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   ├── MobileNav/
│   │   │   ├── PageLayout/
│   │   │   └── index.ts
│   │   ├── pdf/
│   │   │   ├── PDFUploader/
│   │   │   ├── PDFViewer/
│   │   │   ├── PDFThumbnail/
│   │   │   ├── TextExtractor/
│   │   │   ├── MetadataDisplay/
│   │   │   └── index.ts
│   │   ├── library/
│   │   │   ├── DocumentGrid/
│   │   │   ├── DocumentCard/
│   │   │   ├── SearchBar/
│   │   │   ├── FilterPanel/
│   │   │   ├── CategoryTree/
│   │   │   ├── TagManager/
│   │   │   └── index.ts
│   │   ├── study/
│   │   │   ├── StudyGuide/
│   │   │   ├── OutlineBuilder/
│   │   │   ├── ConceptMap/
│   │   │   ├── SummaryView/
│   │   │   ├── ProgressTracker/
│   │   │   └── index.ts
│   │   ├── flashcards/
│   │   │   ├── FlashcardDeck/
│   │   │   ├── FlashcardCreator/
│   │   │   ├── ReviewSession/
│   │   │   ├── SpacedRepetition/
│   │   │   ├── CardTypes/
│   │   │   │   ├── TextCard/
│   │   │   │   ├── ImageCard/
│   │   │   │   ├── EquationCard/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── quiz/
│   │   │   ├── QuizBuilder/
│   │   │   ├── QuizPlayer/
│   │   │   ├── QuestionTypes/
│   │   │   │   ├── MultipleChoice/
│   │   │   │   ├── ShortAnswer/
│   │   │   │   ├── LongAnswer/
│   │   │   │   ├── TrueFalse/
│   │   │   │   ├── Matching/
│   │   │   │   ├── Ordering/
│   │   │   │   ├── ImageBased/
│   │   │   │   ├── DiagramLabeling/
│   │   │   │   └── index.ts
│   │   │   ├── QuizResults/
│   │   │   ├── QuizTimer/
│   │   │   ├── QuizSettings/
│   │   │   └── index.ts
│   │   ├── analytics/
│   │   │   ├── Dashboard/
│   │   │   ├── ProgressChart/
│   │   │   ├── TopicMastery/
│   │   │   ├── StudyInsights/
│   │   │   ├── PredictionAccuracy/
│   │   │   └── index.ts
│   │   ├── import/
│   │   │   ├── ExamImporter/
│   │   │   ├── QuestionExtractor/
│   │   │   ├── FormatConverter/
│   │   │   ├── OCRProcessor/
│   │   │   └── index.ts
│   │   └── mobile/
│   │       ├── SwipeableCard/
│   │       ├── TouchGestures/
│   │       ├── MobileQuiz/
│   │       ├── OfflineIndicator/
│   │       └── index.ts
│   ├── pages/
│   │   ├── Home/
│   │   ├── Library/
│   │   ├── Upload/
│   │   ├── Study/
│   │   ├── Flashcards/
│   │   ├── Quiz/
│   │   ├── Analytics/
│   │   ├── Settings/
│   │   ├── Profile/
│   │   └── index.ts
│   ├── services/
│   │   ├── pdf/
│   │   │   ├── PDFService.ts
│   │   │   ├── TextExtractionService.ts
│   │   │   ├── MetadataService.ts
│   │   │   └── index.ts
│   │   ├── ai/
│   │   │   ├── AIAnalysisService.ts
│   │   │   ├── OpenAIService.ts
│   │   │   ├── AnthropicService.ts
│   │   │   ├── PromptTemplates.ts
│   │   │   ├── RAGService.ts
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   ├── StorageService.ts
│   │   │   ├── IndexedDBService.ts
│   │   │   ├── LocalStorageService.ts
│   │   │   ├── CompressionService.ts
│   │   │   └── index.ts
│   │   ├── study/
│   │   │   ├── StudyGuideService.ts
│   │   │   ├── ConceptExtractionService.ts
│   │   │   ├── OutlineGenerationService.ts
│   │   │   └── index.ts
│   │   ├── flashcard/
│   │   │   ├── FlashcardService.ts
│   │   │   ├── SpacedRepetitionService.ts
│   │   │   ├── CardGenerationService.ts
│   │   │   └── index.ts
│   │   ├── quiz/
│   │   │   ├── QuizService.ts
│   │   │   ├── QuestionGenerationService.ts
│   │   │   ├── ScoringService.ts
│   │   │   ├── PredictionService.ts
│   │   │   └── index.ts
│   │   ├── analytics/
│   │   │   ├── AnalyticsService.ts
│   │   │   ├── ProgressTrackingService.ts
│   │   │   ├── InsightGenerationService.ts
│   │   │   └── index.ts
│   │   └── import/
│   │       ├── ImportService.ts
│   │       ├── OCRService.ts
│   │       ├── ExamParsingService.ts
│   │       └── index.ts
│   ├── stores/
│   │   ├── documentStore.ts
│   │   ├── libraryStore.ts
│   │   ├── studyStore.ts
│   │   ├── flashcardStore.ts
│   │   ├── quizStore.ts
│   │   ├── analyticsStore.ts
│   │   ├── uiStore.ts
│   │   ├── authStore.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── common/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useOnClickOutside.ts
│   │   │   └── index.ts
│   │   ├── pdf/
│   │   │   ├── usePDFUpload.ts
│   │   │   ├── usePDFViewer.ts
│   │   │   ├── useTextExtraction.ts
│   │   │   └── index.ts
│   │   ├── study/
│   │   │   ├── useStudySession.ts
│   │   │   ├── useConceptExtraction.ts
│   │   │   ├── useStudyGuide.ts
│   │   │   └── index.ts
│   │   ├── flashcard/
│   │   │   ├── useFlashcardReview.ts
│   │   │   ├── useSpacedRepetition.ts
│   │   │   ├── useCardGeneration.ts
│   │   │   └── index.ts
│   │   ├── quiz/
│   │   │   ├── useQuizSession.ts
│   │   │   ├── useQuestionGeneration.ts
│   │   │   ├── useQuizTimer.ts
│   │   │   └── index.ts
│   │   └── analytics/
│   │       ├── useStudyAnalytics.ts
│   │       ├── useProgressTracking.ts
│   │       ├── usePerformanceMetrics.ts
│   │       └── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── document.ts
│   │   ├── study.ts
│   │   ├── flashcard.ts
│   │   ├── quiz.ts
│   │   ├── analytics.ts
│   │   ├── ai.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── pdf/
│   │   │   ├── pdfParser.ts
│   │   │   ├── textCleaner.ts
│   │   │   ├── metadataExtractor.ts
│   │   │   └── index.ts
│   │   ├── ai/
│   │   │   ├── promptBuilder.ts
│   │   │   ├── responseParser.ts
│   │   │   ├── tokenCounter.ts
│   │   │   └── index.ts
│   │   ├── quiz/
│   │   │   ├── questionFormatter.ts
│   │   │   ├── answerValidator.ts
│   │   │   ├── scoreCalculator.ts
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   ├── dataCompressor.ts
│   │   │   ├── encryptionHelper.ts
│   │   │   ├── migrationHelper.ts
│   │   │   └── index.ts
│   │   ├── common/
│   │   │   ├── dateHelpers.ts
│   │   │   ├── stringHelpers.ts
│   │   │   ├── validationHelpers.ts
│   │   │   ├── formatters.ts
│   │   │   └── index.ts
│   │   └── mobile/
│   │       ├── touchHelpers.ts
│   │       ├── gestureDetector.ts
│   │       ├── hapticFeedback.ts
│   │       └── index.ts
│   ├── workers/
│   │   ├── pdf.worker.ts
│   │   ├── ocr.worker.ts
│   │   ├── ai.worker.ts
│   │   └── compression.worker.ts
│   ├── lib/
│   │   ├── algorithms/
│   │   │   ├── spacedRepetition.ts
│   │   │   ├── questionPrediction.ts
│   │   │   ├── topicModeling.ts
│   │   │   └── index.ts
│   │   ├── validators/
│   │   │   ├── documentValidator.ts
│   │   │   ├── quizValidator.ts
│   │   │   ├── inputValidator.ts
│   │   │   └── index.ts
│   │   └── constants/
│   │       ├── questionTypes.ts
│   │       ├── fileTypes.ts
│   │       ├── apiEndpoints.ts
│   │       └── index.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── animations.css
│   │   ├── components/
│   │   └── themes/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── App.tsx
│   ├── main.tsx
│   ├── router.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
├── scripts/
│   ├── build.js
│   ├── analyze.js
│   └── generate-types.js
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── commitlint.config.js
├── index.html
├── netlify.toml
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📝 Key Directory Descriptions

### `/src/components/`
Organized by feature domain with common components separated. Each component has its own directory with the component file, tests, and styles.

### `/src/services/`
Service layer containing all business logic, API integrations, and data processing. Organized by domain with clear separation of concerns.

### `/src/stores/`
Zustand stores for global state management, one store per domain area for better organization and performance.

### `/src/hooks/`
Custom React hooks organized by feature area. Promotes code reuse and separates logic from components.

### `/src/types/`
TypeScript type definitions organized by domain. Provides strong typing throughout the application.

### `/src/utils/`
Utility functions and helpers organized by purpose. Pure functions that can be easily tested.

### `/src/workers/`
Web Workers for heavy processing tasks to keep the main thread responsive.

### `/src/lib/`
Core algorithms and business logic that's framework-agnostic.

## 🔧 Configuration Files

### Core Config
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

### Quality Tools
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting
- `commitlint.config.js` - Commit message linting

### Deployment
- `netlify.toml` - Netlify deployment config
- `.env.example` - Environment variables template

## 📦 Component Structure Example

```typescript
// src/components/quiz/QuestionTypes/MultipleChoice/MultipleChoice.tsx
export interface MultipleChoiceProps {
  question: MultipleChoiceQuestion;
  onAnswer: (answer: string[]) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}

// src/components/quiz/QuestionTypes/MultipleChoice/MultipleChoice.test.tsx
// Unit tests for the component

// src/components/quiz/QuestionTypes/MultipleChoice/index.ts
export { MultipleChoice } from './MultipleChoice';
export type { MultipleChoiceProps } from './MultipleChoice';
```

## 🎯 Naming Conventions

### Files
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` with `use` prefix
- Services: `PascalCase.service.ts`
- Utils: `camelCase.ts`
- Types: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE.ts`

### Directories
- Feature areas: `camelCase/`
- Component groups: `PascalCase/`

---

*This file structure supports a scalable, maintainable architecture for the PDF AI Analyzer educational platform.*