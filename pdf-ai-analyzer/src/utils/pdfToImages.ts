import * as pdfjsLib from 'pdfjs-dist';

export interface PDFImageResult {
  pageNumber: number;
  imageDataUrl: string;
  width: number;
  height: number;
}

export async function convertPDFToImages(
  file: File,
  scale: number = 2.0 // Higher scale = better quality for OCR
): Promise<PDFImageResult[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: PDFImageResult[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    
    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    
    images.push({
      pageNumber: pageNum,
      imageDataUrl,
      width: viewport.width,
      height: viewport.height,
    });
  }
  
  return images;
}

export function splitImageForAPI(
  imageDataUrl: string,
  maxHeight: number = 2048
): string[] {
  // OpenAI has image size limits, so we might need to split tall pages
  // This is a placeholder - in production you'd actually split the image
  return [imageDataUrl];
}

export async function prepareImagesForOCR(
  images: PDFImageResult[]
): Promise<{ pages: { pageNumber: number; images: string[] }[] }> {
  const preparedPages = images.map(img => ({
    pageNumber: img.pageNumber,
    images: splitImageForAPI(img.imageDataUrl),
  }));
  
  return { pages: preparedPages };
}