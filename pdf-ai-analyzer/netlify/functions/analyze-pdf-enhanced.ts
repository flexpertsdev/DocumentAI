import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text, analysisType = 'summary', formulas = [] } = JSON.parse(event.body || '{}');

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

    let prompt = '';
    let systemPrompt = 'You are a helpful assistant that analyzes documents precisely. Pay special attention to mathematical formulas and scientific notation.';
    
    // Include formula context if available
    const formulaContext = formulas.length > 0 
      ? `\n\nNote: The document contains ${formulas.length} mathematical formulas that were extracted. Common parsing errors include:
- x2 should be x²
- # or $ often represent division or special operators
- Corrupted integrals and limits
Please interpret mathematical content intelligently based on context.`
      : '';
    
    switch (analysisType) {
      case 'summary':
        prompt = `Provide a comprehensive summary of this document in 2-3 paragraphs. Include:
- Main topic and purpose
- Key concepts and findings
- Important formulas or equations (use LaTeX notation like $formula$)
- Practical applications or conclusions

${formulaContext}

Text to analyze:
${text}`;
        break;
        
      case 'key-points':
        prompt = `Extract the key points from this document. Format your response as a well-structured list with:
- Main categories or topics as headers
- Bullet points under each category
- Include important formulas using LaTeX notation ($formula$)
- Highlight critical concepts in **bold**

Return as a properly formatted markdown string, NOT as a JSON array.

${formulaContext}

Text to analyze:
${text}`;
        systemPrompt = 'You are a helpful assistant that extracts and formats key points from documents. Always return properly formatted markdown text with headers and bullet points.';
        break;
        
      case 'entities':
        prompt = `Identify and categorize entities in this document. Include:
- People (researchers, authors, historical figures)
- Organizations (universities, companies, institutions)
- Locations (cities, countries, regions)
- Dates and time periods
- Mathematical concepts and theorems
- Scientific terms and definitions

Return as JSON with arrays for each category.

${formulaContext}

Text to analyze:
${text}`;
        systemPrompt = 'You are a helpful assistant that extracts entities from documents. Always respond with valid JSON containing categorized arrays.';
        break;
        
      default:
        prompt = `Analyze this document and provide comprehensive insights.
${formulaContext}

Text to analyze:
${text}`;
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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'OpenAI API error',
          details: errorText,
          status: response.status
        }),
      };
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
      // Return the formatted markdown directly
      analysisResult.keyPointsFormatted = aiResponse;
      // Also try to extract as array for backward compatibility
      const lines = aiResponse.split('\n').filter(line => line.trim());
      const points = lines.filter(line => line.startsWith('-') || line.startsWith('•'));
      analysisResult.keyPoints = points.map(p => p.replace(/^[-•]\s*/, '').trim());
    } else if (analysisType === 'entities') {
      try {
        const entities = JSON.parse(aiResponse);
        analysisResult.entities = entities;
      } catch {
        analysisResult.entities = {
          people: [],
          organizations: [],
          locations: [],
          dates: [],
          concepts: [],
          terms: [],
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