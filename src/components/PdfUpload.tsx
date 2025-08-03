import React, { useState, useRef } from 'react';
import { FileText, Upload, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { TextSource } from '../types';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfUploadProps {
  onTextExtracted: (source: TextSource) => void;
  isActive: boolean;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({ onTextExtracted, isActive }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const extractedText = await extractTextFromPdf(file);
      
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
      alert('Failed to process PDF. Please try another file.');
    } finally {
      setIsProcessing(false);
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
              <p className="text-gray-600">Processing PDF...</p>
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
                Supports PDF files up to 10MB
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