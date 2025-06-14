import { useState, useCallback } from 'react';
import { extractTextFromPDF, PDFExtractionResult } from '../utils/pdfParser';
import { convertPDFToImages, PDFImageResult } from '../utils/pdfToImages';
import { ProcessingStatus } from '../types';

export interface ExtractionResult extends PDFExtractionResult {
  images?: PDFImageResult[];
}

export const usePDFExtraction = () => {
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  const extractText = useCallback(async (file: File, useVisionMode: boolean = false) => {
    setError(null);
    setStatus({
      stage: 'extracting',
      progress: 0,
      message: 'Extracting text from PDF...',
    });

    try {
      let result: ExtractionResult;
      
      if (useVisionMode) {
        // Convert PDF to images for vision processing
        setStatus({
          stage: 'extracting',
          progress: 25,
          message: 'Converting PDF to images...',
        });
        
        const images = await convertPDFToImages(file);
        
        // Still extract text for basic metadata
        const textResult = await extractTextFromPDF(file);
        
        result = {
          ...textResult,
          images,
        };
        
        setStatus({
          stage: 'complete',
          progress: 100,
          message: 'PDF converted to images for vision processing',
        });
      } else {
        // Regular text extraction
        result = await extractTextFromPDF(file);
        setStatus({
          stage: 'complete',
          progress: 100,
          message: 'Text extraction complete',
        });
      }
      
      setExtractionResult(result);
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