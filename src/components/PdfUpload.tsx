import React, { useState, useRef } from 'react';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { TextSource } from '../types';

// Dynamic import for PDF.js to avoid build issues
const loadPdfJs = async () => {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source using a more reliable approach
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  
  return pdfjsLib;
};

interface PdfUploadProps {
  onTextExtracted: (source: TextSource) => void;
  isActive: boolean;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({ onTextExtracted, isActive }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      const totalPages = pdf.numPages;
      
      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text with better formatting
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str.trim())
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText) {
          fullText += pageText + '\n\n';
        }
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size too large. Please select a PDF file smaller than 50MB.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const extractedText = await extractTextFromPdf(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        alert('No text found in the PDF. The file might contain only images or be password-protected.');
        return;
      }

      const source: TextSource = {
        id: `pdf-${Date.now()}`,
        type: 'pdf',
        title: file.name.replace('.pdf', ''),
        content: extractedText,
        timestamp: Date.now(),
      };

      onTextExtracted(source);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to process PDF. Please try another file.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ${
      isActive ? 'border-teal-500 shadow-teal-100' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">PDF Upload</h3>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 text-teal-600 mx-auto animate-spin" />
              <p className="text-gray-600">
                Processing PDF... {progress}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop a PDF file here, or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Supports PDF files up to 50MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};