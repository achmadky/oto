import React from 'react';
import { Volume2, Headphones } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Readion</h1>
              <p className="text-sm text-gray-600">Text-to-Speech Reader</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Volume2 className="w-4 h-4" />
            <span>Privacy-first • Offline-ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};