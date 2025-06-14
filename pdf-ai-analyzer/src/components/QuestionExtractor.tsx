import React, { useState } from 'react';
import axios from 'axios';

interface ExtractedQuestion {
  id: string;
  originalText: string;
  question: string;
  questionType: string;
  options?: string[];
  answer?: string;
  topic?: string;
  source: 'extracted' | 'generated';
}

interface QuestionExtractorProps {
  isProcessing?: boolean;
}

export const QuestionExtractor: React.FC<QuestionExtractorProps> = ({ isProcessing = false }) => {
  const [mode, setMode] = useState<'extract' | 'generate' | 'both'>('extract');
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const extractQuestions = async () => {
    const extractedText = localStorage.getItem('lastExtractedText');
    if (!extractedText) {
      setError('Please upload a PDF first');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const response = await axios.post('/.netlify/functions/extract-questions', {
        text: extractedText,
        mode,
      });

      if (response.data.success) {
        const { data } = response.data;
        
        // Store in localStorage for pattern analysis
        const existingData = JSON.parse(localStorage.getItem('questionDatabase') || '[]');
        existingData.push(data);
        localStorage.setItem('questionDatabase', JSON.stringify(existingData));
        
        // Display questions
        setQuestions(data.questions);
        setShowResults(true);
        
        // Show analysis
        if (data.analysis?.examPredictions) {
          console.log('Exam predictions:', data.analysis.examPredictions);
        }
      }
    } catch (err) {
      setError('Failed to extract questions. Please try again.');
      console.error('Question extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const getQuestionsByType = (type: string) => {
    return questions.filter(q => q.questionType === type);
  };

  const getQuestionsBySource = (source: string) => {
    return questions.filter(q => q.source === source);
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>Question Analysis & Generation</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ marginRight: '16px' }}>
          <input
            type="radio"
            value="extract"
            checked={mode === 'extract'}
            onChange={(e) => setMode(e.target.value as any)}
            disabled={isProcessing || isExtracting}
          />
          Extract Existing Questions
        </label>
        <label style={{ marginRight: '16px' }}>
          <input
            type="radio"
            value="generate"
            checked={mode === 'generate'}
            onChange={(e) => setMode(e.target.value as any)}
            disabled={isProcessing || isExtracting}
          />
          Generate New Questions
        </label>
        <label>
          <input
            type="radio"
            value="both"
            checked={mode === 'both'}
            onChange={(e) => setMode(e.target.value as any)}
            disabled={isProcessing || isExtracting}
          />
          Both
        </label>
      </div>
      
      <button
        onClick={extractQuestions}
        disabled={isProcessing || isExtracting}
        style={{
          padding: '12px 24px',
          backgroundColor: '#9c27b0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: isProcessing || isExtracting ? 'not-allowed' : 'pointer',
          opacity: isProcessing || isExtracting ? 0.6 : 1,
        }}
      >
        {mode === 'extract' ? 'Extract Questions' : 
         mode === 'generate' ? 'Generate Questions' : 
         'Extract & Generate'}
      </button>
      
      {isExtracting && (
        <p style={{ marginTop: '16px', color: '#666' }}>
          {mode === 'extract' ? 'Extracting questions from document...' :
           mode === 'generate' ? 'Generating practice questions...' :
           'Extracting and generating questions...'}
        </p>
      )}
      
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          color: '#c62828',
        }}>
          {error}
        </div>
      )}
      
      {showResults && questions.length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <h4>Found {questions.length} Questions</h4>
          
          {mode === 'both' && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{ marginRight: '16px' }}>
                Extracted: {getQuestionsBySource('extracted').length}
              </span>
              <span>
                Generated: {getQuestionsBySource('generated').length}
              </span>
            </div>
          )}
          
          <div style={{ marginTop: '16px' }}>
            <h5>Question Types:</h5>
            <ul>
              {['multiple_choice', 'short_answer', 'essay', 'calculation', 'true_false', 'fill_blank'].map(type => {
                const count = getQuestionsByType(type).length;
                return count > 0 ? (
                  <li key={type}>{type.replace('_', ' ')}: {count}</li>
                ) : null;
              })}
            </ul>
          </div>
          
          <div style={{ marginTop: '20px', maxHeight: '400px', overflow: 'auto' }}>
            {questions.map((q, index) => (
              <div key={q.id} style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: q.source === 'extracted' ? '2px solid #4caf50' : '2px solid #2196f3',
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  {q.source === 'extracted' ? '📋 Extracted' : '✨ Generated'} • {q.questionType}
                  {q.topic && ` • ${q.topic}`}
                </div>
                <h5 style={{ margin: '0 0 8px 0' }}>
                  Q{index + 1}: {q.question}
                </h5>
                {q.originalText && q.originalText !== q.question && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    fontStyle: 'italic',
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                  }}>
                    Original: {q.originalText}
                  </div>
                )}
                {q.options && (
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {q.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                )}
                {q.answer && (
                  <div style={{ fontSize: '14px', color: '#388e3c', marginTop: '8px' }}>
                    Answer: {q.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => {
              const dataStr = JSON.stringify(questions, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = `questions_${new Date().toISOString()}.json`;
              
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Export Questions (JSON)
          </button>
        </div>
      )}
    </div>
  );
};