import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text, analysisType = 'summary' } = JSON.parse(event.body || '{}');

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

    let prompt = '';
    let systemPrompt = 'You are a helpful assistant that analyzes documents precisely and concisely.';
    
    switch (analysisType) {
      case 'summary':
        prompt = `Please provide a concise summary of the following text in 3-5 sentences:\n\n${text}`;
        break;
      case 'key-points':
        prompt = `Extract the 5-7 most important key points from the following text. Format as a JSON array of strings:\n\n${text}`;
        systemPrompt = 'You are a helpful assistant that extracts key points from documents. Always respond with a valid JSON array of strings.';
        break;
      case 'entities':
        prompt = `Identify and categorize the main entities mentioned in this text. Return as JSON with arrays for: people, organizations, locations, and dates:\n\n${text}`;
        systemPrompt = 'You are a helpful assistant that extracts entities from documents. Always respond with valid JSON containing arrays for people, organizations, locations, and dates.';
        break;
      default:
        prompt = `Analyze the following text and provide insights:\n\n${text}`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse response based on analysis type
    let analysisResult: any = {
      analysisType,
      wordCount: text.split(' ').length,
      timestamp: new Date().toISOString(),
    };

    if (analysisType === 'summary') {
      analysisResult.summary = aiResponse;
    } else if (analysisType === 'key-points') {
      try {
        analysisResult.keyPoints = JSON.parse(aiResponse);
      } catch {
        // Fallback if JSON parsing fails
        analysisResult.keyPoints = aiResponse.split('\n').filter((line: string) => line.trim());
      }
    } else if (analysisType === 'entities') {
      try {
        const entities = JSON.parse(aiResponse);
        analysisResult.entities = entities;
      } catch {
        // Fallback structure
        analysisResult.entities = {
          people: [],
          organizations: [],
          locations: [],
          dates: [],
        };
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        analysis: analysisResult,
      }),
    };
  } catch (error) {
    console.error('Error in analyze-pdf function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to analyze document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };