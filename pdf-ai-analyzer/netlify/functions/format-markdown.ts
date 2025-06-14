import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { content, type = 'general' } = JSON.parse(event.body || '{}');

    if (!content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No content provided' }),
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
    
    switch (type) {
      case 'key-points':
        prompt = `Take this poorly formatted key points output and transform it into clean, professional markdown. 

Requirements:
1. Use proper markdown headers (##, ###) to organize sections
2. Fix all LaTeX math expressions to use proper syntax
3. Group related questions under clear category headers
4. Use bold for question text
5. Format multiple choice options as clean bullet lists
6. Add visual indicators like emojis for sections (📝, 📐, 🧮, etc.)
7. Clean up any OCR errors or corrupted symbols
8. Ensure all math formulas are in proper LaTeX with $ or $$ delimiters
9. Add helpful notes like *(OCR error)* where text is clearly corrupted
10. Make it scannable and easy to read
11. IMPORTANT: Add confidence indicators:
    - 🟢 [High confidence] for content that was clear and unambiguous
    - 🟡 [Medium confidence] for content where minor corrections were made
    - 🔴 [Low confidence - needs review] for heavily corrupted or unclear content
    - Add notes like *(interpreted as X, could be Y)* when you made assumptions
12. For mathematical formulas you had to interpret, show alternatives in parentheses
    Example: $x^2$ *(or possibly x₂)*

Here's the content to format:
${content}`;
        break;
        
      case 'questions':
        prompt = `Format these extracted questions into clean, professional markdown.

Requirements:
1. Number all questions clearly
2. Use proper LaTeX for ALL mathematical expressions
3. Format multiple choice with lettered options (A, B, C, D)
4. Bold the question text
5. Add section headers to group similar question types
6. Fix obvious OCR errors in math formulas
7. Use consistent formatting throughout
8. Add a summary at the top with total question count

Content to format:
${content}`;
        break;
        
      default:
        prompt = `Format this content as clean, professional markdown. Fix any formatting issues, ensure proper LaTeX syntax for math, and make it easy to read:

${content}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at formatting mathematical documents into clean, readable markdown. Always preserve mathematical accuracy while improving readability.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const formattedContent = data.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        formatted: formattedContent,
        original: content,
      }),
    };
  } catch (error) {
    console.error('Error formatting markdown:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to format content',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };