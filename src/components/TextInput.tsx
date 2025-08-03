import React, { useState } from 'react';
import { Type, Copy, X } from 'lucide-react';
import { TextSource } from '../types';

interface TextInputProps {
  onTextSubmit: (source: TextSource) => void;
  isActive: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onTextSubmit, isActive }) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;

    const source: TextSource = {
      id: `manual-${Date.now()}`,
      type: 'manual',
      title: title.trim() || 'Manual Text',
      content: text.trim(),
      timestamp: Date.now(),
    };

    onTextSubmit(source);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const clearText = () => {
    setText('');
    setTitle('');
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ${
      isActive ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Type className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Manual Text Input</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Copy className="w-4 h-4" />
              Paste
            </button>
            
            {text && (
              <button
                onClick={clearText}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Start Reading
          </button>
        </div>
      </div>
    </div>
  );
};