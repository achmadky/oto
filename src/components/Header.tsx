import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {/* New oto logo design */}
            <div className="flex items-center">
              <svg width="48" height="32" viewBox="0 0 120 80" className="text-cyan-400">
                {/* Left circle */}
                <circle cx="20" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="8"/>
                {/* Right circle */}
                <circle cx="100" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="8"/>
                {/* Center wave/pulse */}
                <path d="M36 40 Q50 20 60 40 Q70 60 84 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Text-to-Speech Reader</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};