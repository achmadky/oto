import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { TextSource } from '../types';

interface PhotoUploadProps {
  onTextExtracted: (source: TextSource) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onTextExtracted }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const extractedText = result.data.text.trim();
      
      if (!extractedText) {
        alert('No text found in the image. Please try a different image with clearer text.');
        setIsProcessing(false);
        setProgress(0);
        return;
      }

      const source: TextSource = {
        id: `image-${Date.now()}`,
        type: 'image',
        title: file.name.replace(/\.[^/.]+$/, '') || 'Extracted Image Text',
        content: extractedText,
        timestamp: Date.now(),
      };

      // Call the callback to handle the extracted text
      onTextExtracted(source);
      
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please try another image.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-gray-400" />
          )}
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {isProcessing ? `Processing... ${progress}%` : 'Upload Photo'}
            </div>
            <div className="text-sm text-gray-500">
              {isProcessing ? 'Extracting text from image' : 'Extract text from images'}
            </div>
          </div>
        </div>
        {isProcessing && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>
    </>
  );
};