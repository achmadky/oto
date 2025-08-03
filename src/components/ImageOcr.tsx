import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { TextSource } from '../types';

interface ImageOcrProps {
  onTextExtracted: (source: TextSource) => void;
  isActive: boolean;
}

export const ImageOcr: React.FC<ImageOcrProps> = ({ onTextExtracted, isActive }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
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
        return;
      }

      const source: TextSource = {
        id: `image-${Date.now()}`,
        type: 'image',
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: extractedText,
        timestamp: Date.now(),
      };

      onTextExtracted(source);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please try another image.');
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
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ${
      isActive ? 'border-orange-500 shadow-orange-100' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Camera className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Image OCR</h3>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 text-orange-600 mx-auto animate-spin" />
              <p className="text-gray-600">
                Extracting text from image... {progress}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Camera className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop an image here, or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  <Upload className="w-4 h-4" />
                  Choose Image
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, GIF, BMP, and TIFF formats
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};