import React, { useState } from 'react';
import './App.css';
import { PDFUploader } from './components/PDFUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { usePDFExtraction } from './hooks/usePDFExtraction';
import { AnalysisResult, Quiz, AnalysisType } from './types';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'quiz'>('analysis');
  
  const { extractText, status: extractionStatus, error: extractionError } = usePDFExtraction();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setQuiz(null);
    setAnalysisError(null);
    
    try {
      const extractionResult = await extractText(file);
      
      if (extractionResult && extractionResult.text) {
        // Store extracted text in localStorage for now
        localStorage.setItem('lastExtractedText', extractionResult.text);
        localStorage.setItem('lastExtractedMetadata', JSON.stringify({
          fileName: file.name,
          pageCount: extractionResult.pageCount,
          extractedAt: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error('Extraction failed:', err);
    }
  };

  const analyzeDocument = async (analysisType: AnalysisType) => {
    const extractedText = localStorage.getItem('lastExtractedText');
    if (!extractedText) {
      setAnalysisError('Please upload a PDF first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await axios.post('/.netlify/functions/analyze-pdf', {
        text: extractedText,
        analysisType,
      });

      if (response.data.success) {
        setAnalysisResult(response.data.analysis);
      }
    } catch (err) {
      setAnalysisError('Failed to analyze document. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateQuiz = async () => {
    const extractedText = localStorage.getItem('lastExtractedText');
    if (!extractedText) {
      setAnalysisError('Please upload a PDF first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await axios.post('/.netlify/functions/generate-quiz', {
        text: extractedText,
        numberOfQuestions: 5,
        difficulty: 'medium',
      });

      if (response.data.success) {
        setQuiz(response.data.quiz);
      }
    } catch (err) {
      setAnalysisError('Failed to generate quiz. Please try again.');
      console.error('Quiz generation error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isProcessing = extractionStatus.stage === 'extracting' || isAnalyzing;

  return (
    <div className="App">
      <header className="App-header" style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        marginBottom: '40px',
      }}>
        <h1 style={{ margin: '0', fontSize: '32px' }}>PDF AI Analyzer</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.8 }}>
          Upload a PDF to analyze content and generate quizzes
        </p>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <PDFUploader 
          onFileSelect={handleFileSelect}
          isProcessing={isProcessing}
        />

        {selectedFile && extractionStatus.stage === 'complete' && (
          <div style={{ marginTop: '32px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#e8f5e9',
              borderRadius: '8px',
              marginBottom: '24px',
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>
                ✓ PDF Uploaded Successfully
              </h3>
              <p style={{ margin: '0', color: '#1b5e20' }}>
                {selectedFile.name} • {localStorage.getItem('lastExtractedMetadata') && 
                  `${JSON.parse(localStorage.getItem('lastExtractedMetadata')!).pageCount} pages`
                }
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                borderBottom: '2px solid #e0e0e0',
              }}>
                <button
                  onClick={() => setActiveTab('analysis')}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'analysis' ? '2px solid #1976d2' : 'none',
                    color: activeTab === 'analysis' ? '#1976d2' : '#666',
                    marginBottom: '-2px',
                  }}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'quiz' ? '2px solid #1976d2' : 'none',
                    color: activeTab === 'quiz' ? '#1976d2' : '#666',
                    marginBottom: '-2px',
                  }}
                >
                  Quiz Generator
                </button>
              </div>

              {activeTab === 'analysis' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => analyzeDocument('summary')}
                    disabled={isProcessing}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    Generate Summary
                  </button>
                  <button
                    onClick={() => analyzeDocument('key-points')}
                    disabled={isProcessing}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#388e3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    Extract Key Points
                  </button>
                  <button
                    onClick={() => analyzeDocument('entities')}
                    disabled={isProcessing}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#7b1fa2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    Find Entities
                  </button>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div>
                  <button
                    onClick={generateQuiz}
                    disabled={isProcessing}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f57c00',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    Generate Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {(extractionError || analysisError) && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            color: '#c62828',
          }}>
            {extractionError || analysisError}
          </div>
        )}

        <AnalysisResults
          analysis={activeTab === 'analysis' ? analysisResult || undefined : undefined}
          quiz={activeTab === 'quiz' ? quiz || undefined : undefined}
          isLoading={isAnalyzing}
          error={analysisError || undefined}
        />
      </main>
    </div>
  );
}

export default App;
