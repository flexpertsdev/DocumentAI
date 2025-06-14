import React, { useState } from 'react';
import { AnalysisResult, Quiz } from '../types';
import axios from 'axios';

interface AnalysisResultsProps {
  analysis?: AnalysisResult;
  quiz?: Quiz;
  isLoading?: boolean;
  error?: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  quiz,
  isLoading,
  error,
}) => {
  const [formattedContent, setFormattedContent] = useState<string | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showFormatted, setShowFormatted] = useState(false);
  
  const formatContent = async (content: string, type: string) => {
    setIsFormatting(true);
    try {
      const response = await axios.post('/.netlify/functions/format-markdown', {
        content,
        type,
      });
      
      if (response.data.success) {
        setFormattedContent(response.data.formatted);
        setShowFormatted(true);
      }
    } catch (err) {
      console.error('Formatting error:', err);
    } finally {
      setIsFormatting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="results-container" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner" style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ marginTop: '16px', color: '#666' }}>Analyzing your document...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-container" style={{
        padding: '20px',
        backgroundColor: '#fee',
        borderRadius: '8px',
        margin: '20px 0',
      }}>
        <h3 style={{ color: '#c00', margin: '0 0 8px 0' }}>Error</h3>
        <p style={{ margin: '0', color: '#800' }}>{error}</p>
      </div>
    );
  }

  if (!analysis && !quiz) {
    return null;
  }

  return (
    <div className="results-container" style={{
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      margin: '20px 0',
    }}>
      {analysis && (
        <div className="analysis-section" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Analysis Results</h2>
          
          {analysis.summary && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Summary</h3>
              <p style={{ lineHeight: '1.6', color: '#333' }}>{analysis.summary}</p>
            </div>
          )}
          
          {(analysis.keyPointsFormatted || analysis.keyPoints) && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Key Points</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {showFormatted && (
                    <button
                      onClick={() => setShowFormatted(false)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#888',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Show Original
                    </button>
                  )}
                  <button
                    onClick={() => formatContent(analysis.keyPointsFormatted || analysis.keyPoints?.join('\n') || '', 'key-points')}
                    disabled={isFormatting}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#673ab7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: isFormatting ? 'not-allowed' : 'pointer',
                      opacity: isFormatting ? 0.6 : 1,
                    }}
                  >
                    {isFormatting ? 'Formatting...' : '✨ Format with AI'}
                  </button>
                </div>
              </div>
              {showFormatted && formattedContent ? (
                <div 
                  style={{ 
                    lineHeight: '1.8', 
                    color: '#333',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    marginTop: '12px',
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: formattedContent
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/🟢/g, '<span style="color: #22c55e; font-size: 16px;">🟢</span>')
                      .replace(/🟡/g, '<span style="color: #eab308; font-size: 16px;">🟡</span>')
                      .replace(/🔴/g, '<span style="color: #ef4444; font-size: 16px;">🔴</span>')
                      .replace(/\[High confidence\]/g, '<span style="color: #22c55e; font-weight: 600; font-size: 12px;">[High confidence]</span>')
                      .replace(/\[Medium confidence\]/g, '<span style="color: #eab308; font-weight: 600; font-size: 12px;">[Medium confidence]</span>')
                      .replace(/\[Low confidence - needs review\]/g, '<span style="color: #ef4444; font-weight: 600; font-size: 12px;">[Low confidence - needs review]</span>')
                      .replace(/\$\$(.*?)\$\$/g, '<div style="text-align: center; margin: 10px 0;"><code style="background: #f5f5f5; padding: 8px 12px; border-radius: 4px; display: inline-block;">$1</code></div>')
                      .replace(/\$(.*?)\$/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px;">$1</code>')
                      .replace(/^###\s+(.*)$/gm, '<h4 style="margin-top: 20px; margin-bottom: 12px; color: #333;">$1</h4>')
                      .replace(/^##\s+(.*)$/gm, '<h3 style="margin-top: 24px; margin-bottom: 16px; color: #222;">$1</h3>')
                      .replace(/^-\s+(.*)$/gm, '<div style="margin-left: 20px; margin-bottom: 8px;">• $1</div>')
                      .replace(/\n\n/g, '</p><p style="margin-bottom: 12px;">')
                      .replace(/^(.+)$/gm, (match) => {
                        if (!match.startsWith('<') && !match.includes('•')) {
                          return `<p style="margin-bottom: 12px;">${match}</p>`;
                        }
                        return match;
                      })
                  }}
                />
              ) : (
                <>
                  {analysis.keyPointsFormatted ? (
                    <div 
                      style={{ 
                        lineHeight: '1.6', 
                        color: '#333',
                        whiteSpace: 'pre-wrap',
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: analysis.keyPointsFormatted
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\$(.*?)\$/g, '<code>$1</code>')
                          .replace(/^#+\s+(.*)$/gm, '<h4>$1</h4>')
                          .replace(/^-\s+(.*)$/gm, '• $1<br/>')
                      }}
                    />
                  ) : analysis.keyPoints ? (
                    <ul style={{ paddingLeft: '20px' }}>
                      {analysis.keyPoints.map((point: string, index: number) => (
                        <li key={index} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </div>
          )}
          
          {analysis.entities && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Entities Found</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {analysis.entities.people && analysis.entities.people.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>People</h4>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      {analysis.entities.people.map((person, i) => (
                        <li key={i}>{person}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.entities.organizations && analysis.entities.organizations.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Organizations</h4>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      {analysis.entities.organizations.map((org, i) => (
                        <li key={i}>{org}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
            Word count: {analysis.wordCount} | 
            Analyzed at: {new Date(analysis.timestamp).toLocaleString()}
          </div>
        </div>
      )}
      
      {quiz && quiz.questions.length > 0 && (
        <div className="quiz-section">
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Generated Quiz</h2>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            {quiz.metadata.totalQuestions} questions • Difficulty: {quiz.metadata.difficulty}
          </p>
          
          {quiz.questions.map((q, index) => (
            <div key={index} style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}>
              <h4 style={{ marginBottom: '12px' }}>
                Question {index + 1}: {q.question}
              </h4>
              <div style={{ paddingLeft: '16px' }}>
                {q.options.map((option, optIndex) => (
                  <div key={optIndex} style={{ marginBottom: '8px' }}>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optIndex}
                        style={{ marginRight: '8px' }}
                      />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p style={{
                  marginTop: '12px',
                  fontSize: '14px',
                  color: '#666',
                  fontStyle: 'italic',
                }}>
                  Note: {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};