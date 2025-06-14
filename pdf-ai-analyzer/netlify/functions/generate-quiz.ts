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
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    // Truncate text if too long (to avoid token limits)
    const maxTextLength = 2500;
    const truncatedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + '...' 
      : text;

    const prompt = `Based on the following text, generate ${numberOfQuestions} multiple-choice questions at ${difficulty} difficulty level.

IMPORTANT: The text may contain math formulas in LaTeX format like $formula$ or $$formula$$. Preserve these in your questions.
    
Format the response as a JSON object with a "questions" array where each question has:
- question: the question text
- options: array of 4 possible answers
- correctAnswer: index (0-3) of the correct answer
- explanation: brief explanation of why the answer is correct

Text to analyze:
${truncatedText}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert quiz generator. Always respond with valid JSON arrays containing quiz questions in the exact format requested. Ensure questions test comprehension of the provided text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let questions: QuizQuestion[] = [];
    
    try {
      // Try to parse the AI response as JSON
      const parsed = JSON.parse(aiResponse);
      questions = parsed.questions || parsed;
      
      // Validate the structure
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure each question has the required fields
      questions = questions.map((q: any) => ({
        question: q.question || 'Question not available',
        options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || 'No explanation provided',
      }));
      
    } catch (parseError) {
      // Fallback: Create a basic quiz if parsing fails
      console.error('Failed to parse quiz questions:', parseError);
      questions = [{
        question: "What is the main topic discussed in the document?",
        options: [
          "Unable to generate options - please try again",
          "Option B",
          "Option C", 
          "Option D"
        ],
        correctAnswer: 0,
        explanation: "Quiz generation encountered an error. Please try again."
      }];
    }

    // Limit to requested number of questions
    questions = questions.slice(0, numberOfQuestions);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        quiz: {
          questions,
          metadata: {
            totalQuestions: questions.length,
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
      body: JSON.stringify({ 
        error: 'Failed to generate quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };