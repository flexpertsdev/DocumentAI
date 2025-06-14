import { Handler } from '@netlify/functions';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text, numberOfQuestions = 5, difficulty = 'medium' } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No text provided' }),
      };
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'AI API key not configured' }),
      };
    }

    // Mock quiz generation for now
    // TODO: Implement actual AI-powered quiz generation
    const mockQuiz: QuizQuestion[] = [
      {
        question: "What is the main topic of the document?",
        options: [
          "Technology",
          "Science",
          "History",
          "Literature"
        ],
        correctAnswer: 0,
        explanation: "Based on the content analysis, the document primarily discusses technology-related topics."
      },
      {
        question: "Which key concept was mentioned in the document?",
        options: [
          "Artificial Intelligence",
          "Quantum Physics",
          "Ancient History",
          "Modern Art"
        ],
        correctAnswer: 0,
        explanation: "The document contains references to AI and machine learning concepts."
      },
    ];

    // Limit to requested number of questions
    const quiz = mockQuiz.slice(0, numberOfQuestions);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        quiz: {
          questions: quiz,
          metadata: {
            totalQuestions: quiz.length,
            difficulty,
            generatedAt: new Date().toISOString(),
            textLength: text.length,
          }
        }
      }),
    };
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };