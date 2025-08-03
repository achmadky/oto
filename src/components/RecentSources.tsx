import React from 'react';
import { Clock, FileText, Camera, Type, Trash2 } from 'lucide-react';
import { TextSource } from '../types';

interface RecentSourcesProps {
  sources: TextSource[];
  onSourceSelect: (source: TextSource) => void;
  onSourceDelete: (id: string) => void;
}

export const RecentSources: React.FC<RecentSourcesProps> = ({
  sources,
  onSourceSelect,
  onSourceDelete,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'manual': return <Type className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'image': return <Camera className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'text-blue-600 bg-blue-100';
      case 'pdf': return 'text-teal-600 bg-teal-100';
      case 'image': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (sources.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Recent Sources</h3>
        </div>
        <p className="text-gray-500 text-center py-8">
          No recent sources. Upload a PDF, scan an image, or input text to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Recent Sources</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className={`p-2 rounded-lg ${getTypeColor(source.type)}`}>
                {getIcon(source.type)}
              </div>
              
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onSourceSelect(source)}
              >
                <h4 className="font-medium text-gray-800 truncate">
                  {source.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatDate(source.timestamp)} • {source.content.length} characters
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSourceDelete(source.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};