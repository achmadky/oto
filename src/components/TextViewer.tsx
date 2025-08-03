import React, { useEffect, useRef } from 'react';
import { FileText, Calendar } from 'lucide-react';
import { TextSource } from '../types';

interface TextViewerProps {
  source: TextSource;
  currentPosition: number;
  onPositionClick: (position: number) => void;
}

export const TextViewer: React.FC<TextViewerProps> = ({ 
  source, 
  currentPosition, 
  onPositionClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sentences = source.content.split(/[.!?]+/).filter(s => s.trim().length > 0);

  useEffect(() => {
    // Auto-scroll to current sentence
    const currentElement = containerRef.current?.querySelector(`[data-sentence="${currentPosition}"]`);
    if (currentElement) {
      currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentPosition]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'pdf': return 'bg-teal-100 text-teal-800';
      case 'image': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {source.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(source.type)}`}>
                {source.type.toUpperCase()}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(source.timestamp)}
              </div>
            </div>
          </div>
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div 
        ref={containerRef}
        className="p-6 max-h-96 overflow-y-auto prose prose-gray max-w-none"
      >
        {sentences.map((sentence, index) => (
          <span
            key={index}
            data-sentence={index}
            onClick={() => onPositionClick(index)}
            className={`cursor-pointer transition-all duration-200 ${
              index === currentPosition
                ? 'bg-blue-200 text-blue-900 font-medium'
                : 'hover:bg-gray-100'
            } rounded px-1`}
          >
            {sentence.trim()}.{' '}
          </span>
        ))}
      </div>
    </div>
  );
};