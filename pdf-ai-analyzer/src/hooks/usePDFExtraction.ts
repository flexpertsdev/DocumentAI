import { useState, useCallback } from 'react';
import { extractTextFromPDF, PDFExtractionResult } from '../utils/pdfParser';
import { ProcessingStatus } from '../types';

export const usePDFExtraction = () => {
  const [extractionResult, setExtractionResult] = useState<PDFExtractionResult | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  const extractText = useCallback(async (file: File) => {
    setError(null);
    setStatus({
      stage: 'extracting',
      progress: 0,
      message: 'Extracting text from PDF...',
    });

    try {
      const result = await extractTextFromPDF(file);
      setExtractionResult(result);
      setStatus({
        stage: 'complete',
        progress: 100,
        message: 'Text extraction complete',
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract text from PDF';
      setError(errorMessage);
      setStatus({
        stage: 'error',
        progress: 0,
        message: errorMessage,
      });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setExtractionResult(null);
    setStatus({
      stage: 'idle',
      progress: 0,
      message: '',
    });
    setError(null);
  }, []);

  return {
    extractText,
    extractionResult,
    status,
    error,
    reset,
  };
};