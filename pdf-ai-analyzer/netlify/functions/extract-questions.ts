import { Handler } from '@netlify/functions';

interface ExtractedQuestion {
  id: string;
  originalText: string;
  questionType: 'multiple_choice' | 'short_answer' | 'essay' | 'calculation' | 'true_false' | 'fill_blank';
  question: string;
  options?: string[];
  answer?: string;
  points?: number;
  topic?: string;
  pageNumber?: number;
  difficulty?: string;
  source: 'extracted' | 'generated';
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text, mode = 'extract' } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No text provided' }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    let result;
    if (mode === 'extract') {
      // Extract existing questions from the document
      result = await extractExistingQuestions(text, apiKey);
    } else if (mode === 'generate') {
      // Generate new questions based on content
      result = await generateNewQuestions(text, apiKey);
    } else if (mode === 'both') {
      // Extract existing and generate new
      const extracted = await extractExistingQuestions(text, apiKey);
      const generated = await generateNewQuestions(text, apiKey);
      result = {
        extracted: extracted.questions,
        generated: generated.questions,
        totalQuestions: extracted.questions.length + generated.questions.length,
        analysis: {
          topicsFound: [...new Set([...extracted.topics || [], ...generated.topics || []])],
          questionPatterns: extracted.patterns,
          examPredictions: extracted.examPredictions
        }
      };
    }

    // Store in localStorage structure
    const storageData = {
      documentId: `doc_${Date.now()}`,
      extractedAt: new Date().toISOString(),
      questions: result.questions || [...(result.extracted || []), ...(result.generated || [])],
      analysis: result.analysis || {},
      metadata: {
        totalQuestions: result.questions?.length || result.totalQuestions || 0,
        mode,
        textLength: text.length
      }
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: storageData
      }),
    };
  } catch (error) {
    console.error('Error extracting questions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to extract questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function extractExistingQuestions(text: string, apiKey: string) {
  const prompt = `Analyze this document and extract ALL existing questions, problems, exercises, and examples exactly as they appear. This is critical for building a question database.

IMPORTANT: Extract questions VERBATIM - preserve exact wording, formatting, and structure.

For each question found, provide:
1. originalText: The EXACT text of the question as it appears
2. questionType: multiple_choice/short_answer/essay/calculation/true_false/fill_blank
3. question: Cleaned version (remove question numbers, but keep content identical)
4. options: For multiple choice, list all options exactly
5. answer: If answer is provided in the text
6. points: If point value is mentioned
7. topic: What topic/chapter this relates to
8. pageNumber: Approximate location in document

Also identify:
- Question patterns (how questions are typically structured)
- Common topics that appear in questions
- Exam predictions based on emphasis and repetition

Focus on finding:
- Numbered questions (1., 2., Q1, Question 1, etc.)
- Problem sets
- Exercises
- Sample exam questions
- Practice problems
- Review questions
- "Example:" sections with questions

Return as JSON with structure:
{
  "questions": [...],
  "patterns": ["pattern1", "pattern2"],
  "topics": ["topic1", "topic2"],
  "examPredictions": [
    {"topic": "...", "probability": 0.8, "reasoning": "..."}
  ]
}

Text to analyze:
${text}`;

  const response = await callOpenAI(prompt, apiKey, 
    'You are an expert at extracting educational questions from documents. Extract questions EXACTLY as they appear for database storage and pattern analysis.'
  );
  
  const result = JSON.parse(response);
  
  // Add source field to all questions
  result.questions = result.questions.map((q: any, index: number) => ({
    ...q,
    id: `extracted_${Date.now()}_${index}`,
    source: 'extracted'
  }));
  
  return result;
}

async function generateNewQuestions(text: string, apiKey: string) {
  const prompt = `Based on this document content, generate NEW practice questions that would help students prepare for exams. Create variations of concepts found in the text.

Generate 15-20 questions with:
1. question: Clear, well-formulated question
2. questionType: multiple_choice/short_answer/essay/calculation/true_false
3. options: For multiple choice (4 options)
4. answer: Correct answer with explanation
5. difficulty: easy/medium/hard
6. topic: Related concept from the document
7. cognitiveLevel: remember/understand/apply/analyze/evaluate/create

Mix question types and difficulty levels. Focus on:
- Key concepts that are emphasized in the text
- Practical applications
- Common exam topics
- Different ways to test the same concept

Return as JSON with structure:
{
  "questions": [...],
  "topics": ["topic1", "topic2"]
}

Text to analyze (first 3000 chars):
${text.substring(0, 3000)}`;

  const response = await callOpenAI(prompt, apiKey,
    'You are an expert educational content creator. Generate high-quality practice questions based on document content.'
  );
  
  const result = JSON.parse(response);
  
  // Add metadata to generated questions
  result.questions = result.questions.map((q: any, index: number) => ({
    ...q,
    id: `generated_${Date.now()}_${index}`,
    source: 'generated',
    originalText: null
  }));
  
  return result;
}

async function callOpenAI(prompt: string, apiKey: string, systemPrompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    // Fallback to GPT-3.5 if GPT-4 fails
    const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt.substring(0, 2000) } // Shorter for GPT-3.5
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });
    
    if (!fallbackResponse.ok) {
      throw new Error(`OpenAI API error: ${fallbackResponse.statusText}`);
    }
    
    const fallbackData = await fallbackResponse.json();
    return fallbackData.choices[0].message.content;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export { handler };