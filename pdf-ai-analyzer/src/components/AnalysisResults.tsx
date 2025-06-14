import React from 'react';
import { AnalysisResult, Quiz } from '../types';

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
          
          {analysis.keyPoints && analysis.keyPoints.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Key Points</h3>
              <ul style={{ paddingLeft: '20px' }}>
                {analysis.keyPoints.map((point, index) => (
                  <li key={index} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
                    {point}
                  </li>
                ))}
              </ul>
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