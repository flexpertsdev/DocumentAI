// Use the global pdfjsLib loaded from CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const pdfjsLib = window.pdfjsLib;

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const pageTexts: string[] = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      pageTexts.push(pageText);
      fullText += pageText + '\n\n';
    }
    
    // Get metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info as any;
    
    return {
      text: fullText.trim(),
      pageCount: pdf.numPages,
      metadata: info ? {
        title: info.Title,
        author: info.Author,
        subject: info.Subject,
        keywords: info.Keywords,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
      } : undefined,
    };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export function validatePDFFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'File must be a PDF' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }
  
  return { isValid: true };
}