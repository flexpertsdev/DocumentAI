import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { images, analysisType = 'summary', pageNumbers = [] } = JSON.parse(event.body || '{}');

    if (!images || images.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No images provided' }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    // Prepare messages with images
    const messages: any[] = [
      {
        role: 'system',
        content: `You are an expert at analyzing mathematical and scientific documents. You can perfectly read mathematical formulas, equations, symbols, and notation from images. Always preserve exact mathematical notation using LaTeX.`
      }
    ];

    // Add user message with images
    const userContent: any[] = [];
    
    // Add analysis prompt
    switch (analysisType) {
      case 'summary':
        userContent.push({
          type: 'text',
          text: `Analyze these document pages and provide a comprehensive summary. Include:
1. Main topics and concepts
2. All mathematical formulas and equations (use LaTeX notation)
3. Key findings and conclusions
4. Important definitions and theorems

Be sure to accurately transcribe ALL mathematical notation.`
        });
        break;
        
      case 'extract-questions':
        userContent.push({
          type: 'text',
          text: `Extract ALL questions, problems, and exercises from these pages. For each question:
1. Transcribe the EXACT text including all mathematical notation
2. Use proper LaTeX for all formulas
3. Include question numbers and any sub-parts
4. Preserve multiple choice options exactly as shown
5. Note any answers or solutions provided

Return as JSON with structure:
{
  "questions": [
    {
      "number": "1",
      "text": "full question with LaTeX",
      "type": "multiple_choice/calculation/proof/etc",
      "options": ["A...", "B...", "C...", "D..."],
      "answer": "if provided",
      "topic": "algebra/calculus/etc"
    }
  ]
}`
        });
        break;
        
      case 'formulas':
        userContent.push({
          type: 'text',
          text: `Extract ALL mathematical formulas, equations, and expressions from these pages. For each:
1. The exact formula in LaTeX notation
2. Context (what it represents)
3. Variables and their meanings
4. Any given values or constraints

Be extremely precise with mathematical notation - superscripts, subscripts, fractions, integrals, etc.`
        });
        break;
    }

    // Add images
    images.forEach((imageDataUrl: string, index: number) => {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: imageDataUrl,
          detail: 'high' // Use high detail for better OCR
        }
      });
    });

    messages.push({
      role: 'user',
      content: userContent
    });

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview', // GPT-4 Vision for image analysis
        messages: messages,
        max_tokens: 4096,
        temperature: 0.2, // Lower temperature for more accurate transcription
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI Vision API error:', error);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let result: any = {
      success: true,
      analysisType,
      pageNumbers,
    };

    // Parse response based on type
    if (analysisType === 'extract-questions') {
      try {
        const parsed = JSON.parse(aiResponse);
        result.questions = parsed.questions || [];
        result.totalQuestions = result.questions.length;
      } catch (e) {
        // If not JSON, return as text
        result.rawText = aiResponse;
        result.error = 'Failed to parse as JSON';
      }
    } else {
      result.content = aiResponse;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in analyze-pdf-vision function:', error);
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