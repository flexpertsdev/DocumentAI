import { Handler } from '@netlify/functions';
import { StandardizedDocument, DocumentType, AcademicLevel, DifficultyLevel } from '../../src/types/document';

const SYSTEM_PROMPT = `You are an expert educational content analyzer. Your task is to process documents and extract structured educational content.

You must ALWAYS respond with valid JSON that matches the exact schema provided. Extract as much relevant information as possible.

Focus on:
1. Identifying key concepts and their relationships
2. Extracting definitions with proper context
3. Finding examples and explanations
4. Identifying potential exam questions
5. Creating effective flashcards
6. Determining document type and academic level
7. Assessing difficulty and exam relevance`;

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { text, metadata, filename } = JSON.parse(event.body || '{}');

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

    // Create document ID
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Step 1: Analyze document structure and type
    const structureAnalysis = await analyzeDocumentStructure(text, apiKey);
    
    // Step 2: Extract concepts and definitions
    const conceptsAndDefs = await extractConceptsAndDefinitions(text, apiKey);
    
    // Step 3: Generate educational content
    const educationalContent = await generateEducationalContent(text, conceptsAndDefs, apiKey);
    
    // Step 4: Assess exam relevance
    const examAnalysis = await analyzeExamRelevance(text, conceptsAndDefs, apiKey);

    // Combine all analyses into standardized format
    const standardizedDoc: StandardizedDocument = {
      id: documentId,
      uploadedAt: new Date().toISOString(),
      filename: filename || 'untitled.pdf',
      fileSize: text.length,
      pageCount: metadata?.pageCount || 1,
      
      metadata: {
        title: metadata?.title || structureAnalysis.suggestedTitle,
        author: metadata?.author,
        subject: metadata?.subject || structureAnalysis.subject,
        keywords: structureAnalysis.keywords,
        creationDate: metadata?.creationDate,
        documentType: structureAnalysis.documentType as DocumentType,
        academicLevel: structureAnalysis.academicLevel as AcademicLevel,
        language: 'en',
      },
      
      content: {
        fullText: text,
        sections: structureAnalysis.sections || [],
        concepts: conceptsAndDefs.concepts || [],
        definitions: conceptsAndDefs.definitions || [],
        examples: conceptsAndDefs.examples || [],
        formulas: conceptsAndDefs.formulas || [],
        figures: [],
        tables: [],
      },
      
      analysis: {
        summary: structureAnalysis.summary,
        mainTopics: structureAnalysis.mainTopics || [],
        keyPoints: structureAnalysis.keyPoints || [],
        learningObjectives: structureAnalysis.learningObjectives || [],
        difficulty: structureAnalysis.difficulty as DifficultyLevel || 'intermediate',
        estimatedReadingTime: Math.ceil(text.split(' ').length / 200), // 200 wpm
        contentDensity: structureAnalysis.contentDensity || 'medium',
      },
      
      educational: {
        potentialQuestions: educationalContent.questions || [],
        flashcards: educationalContent.flashcards || [],
        conceptMap: educationalContent.conceptRelations || [],
        examRelevance: examAnalysis.relevance || [],
      },
      
      processing: {
        status: 'completed',
        completedSteps: [
          { step: 'text_extraction', status: 'completed', timestamp: new Date().toISOString() },
          { step: 'structure_analysis', status: 'completed', timestamp: new Date().toISOString() },
          { step: 'concept_extraction', status: 'completed', timestamp: new Date().toISOString() },
          { step: 'educational_generation', status: 'completed', timestamp: new Date().toISOString() },
          { step: 'exam_analysis', status: 'completed', timestamp: new Date().toISOString() },
        ],
      },
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        document: standardizedDoc,
      }),
    };
  } catch (error) {
    console.error('Error processing document:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function analyzeDocumentStructure(text: string, apiKey: string) {
  const prompt = `Analyze this document and provide:
1. Document type (textbook/lecture_notes/research_paper/tutorial/exam_paper/assignment/presentation/other)
2. Academic level (elementary/middle_school/high_school/undergraduate/graduate/professional)
3. Suggested title if not clear
4. Subject area
5. Main topics (array of strings)
6. Key points (array of strings)
7. Learning objectives (array of strings)
8. Keywords (array of strings)
9. Brief summary (2-3 sentences)
10. Difficulty level (beginner/intermediate/advanced/expert)
11. Content density (low/medium/high)
12. Document sections with titles and hierarchy

Return as JSON with these exact field names.

Text to analyze (first 2000 chars):
${text.substring(0, 2000)}`;

  const response = await callOpenAI(prompt, apiKey, SYSTEM_PROMPT);
  return JSON.parse(response);
}

async function extractConceptsAndDefinitions(text: string, apiKey: string) {
  const prompt = `Extract educational content from this text:

1. Concepts: Array of objects with:
   - id (generate unique)
   - name
   - definition
   - category
   - importance (core/supporting/supplementary)
   
2. Definitions: Array of formal definitions with:
   - id
   - term
   - definition
   - context (surrounding text)
   - confidence (0-1)
   
3. Examples: Array of examples with:
   - id
   - conceptId (if applicable)
   - description
   - explanation
   
4. Formulas: Array of mathematical/scientific formulas with:
   - id
   - name
   - latex
   - variables (array of {symbol, meaning})
   - context

Return as JSON with these exact field names.

Text to analyze:
${text.substring(0, 3000)}`;

  const response = await callOpenAI(prompt, apiKey, SYSTEM_PROMPT);
  return JSON.parse(response);
}

async function generateEducationalContent(text: string, concepts: any, apiKey: string) {
  const prompt = `Generate educational content based on this text and concepts:

1. Questions: Create 10-15 diverse questions with:
   - id
   - conceptId (if applicable)
   - question
   - questionType (multiple_choice/true_false/short_answer/essay/calculation)
   - options (for multiple choice)
   - correctAnswer
   - explanation
   - difficulty (beginner/intermediate/advanced/expert)
   - cognitiveLevel (remember/understand/apply/analyze/evaluate/create)
   - examProbability (0-1)

2. Flashcards: Create 10-15 flashcards with:
   - id
   - conceptId (if applicable)
   - front
   - back
   - type (definition/concept/formula/example/comparison)
   - difficulty
   - tags (array)

3. ConceptRelations: Map relationships between concepts:
   - sourceId
   - targetId
   - relationType (prerequisite/related/example/application/contrast)
   - strength (0-1)

Focus on exam-relevant content and varied question types.

Text excerpt: ${text.substring(0, 2000)}
Concepts: ${JSON.stringify(concepts).substring(0, 1000)}`;

  const response = await callOpenAI(prompt, apiKey, SYSTEM_PROMPT);
  return JSON.parse(response);
}

async function analyzeExamRelevance(text: string, concepts: any, apiKey: string) {
  const prompt = `Analyze exam relevance of topics in this document:

For each major topic, provide:
1. topic (name)
2. probability (0-1) - likelihood of appearing in exams
3. suggestedFocusLevel (high/medium/low)
4. rationale (why this assessment)

Consider:
- Emphasis in the text
- Fundamental vs advanced concepts
- Practical applications
- Common exam patterns

Return as JSON with array called "relevance".

Text excerpt: ${text.substring(0, 2000)}
Concepts: ${JSON.stringify(concepts).substring(0, 1000)}`;

  const response = await callOpenAI(prompt, apiKey, SYSTEM_PROMPT);
  return JSON.parse(response);
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
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export { handler };