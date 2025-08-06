import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Header } from './components/Header';
import { TextInputModal } from './components/TextInputModal';
import { PhotoUpload } from './components/PhotoUpload';
import { TextViewer } from './components/TextViewer';
import { AudioControls } from './components/AudioControls';
import { RecentSources } from './components/RecentSources';
import { useTTS } from './hooks/useTTS';
import { storage } from './utils/storage';
import { TextSource } from './types';

function App() {
  const [currentSource, setCurrentSource] = useState<TextSource | null>(null);
  const [recentSources, setRecentSources] = useState<TextSource[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'reading'>('home');
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  
  const {
    isPlaying,
    isPaused,
    currentPosition,
    settings,
    voices,
    speak,
    pause,
    resume,
    stop,
    jumpTo,
    updateSettings,
  } = useTTS();

  useEffect(() => {
    setRecentSources(storage.getSources());
  }, []);

  const handleTextSubmit = (source: TextSource) => {
    // Close dropdown first
    setShowUploadOptions(false);
    
    // Save and set source
    storage.saveSource(source);
    setCurrentSource(source);
    setRecentSources(storage.getSources());
    
    // Switch to reading view
    setCurrentView('reading');
    
    // Auto-start reading
    speak(source.content);
  };

  const handleSourceSelect = (source: TextSource) => {
    setCurrentSource(source);
    setCurrentView('reading');
    
    // Load saved progress
    const progress = storage.getProgress(source.id);
    if (progress) {
      jumpTo(progress.position);
    }
  };

  const handleSourceDelete = (id: string) => {
    storage.deleteSource(id);
    setRecentSources(storage.getSources());
    
    if (currentSource?.id === id) {
      setCurrentSource(null);
      stop();
      setCurrentView('home');
    }
  };

  const handlePlay = () => {
    if (currentSource) {
      if (isPaused) {
        resume();
      } else {
        speak(currentSource.content, currentPosition);
      }
    }
  };

  const handlePositionClick = (position: number) => {
    jumpTo(position);
    if (currentSource) {
      storage.saveProgress({
        sourceId: currentSource.id,
        position,
        timestamp: Date.now(),
      });
    }
  };

  const handleSkipBack = () => {
    const newPosition = Math.max(0, currentPosition - 1);
    jumpTo(newPosition);
  };

  const handleSkipForward = () => {
    if (currentSource) {
      const sentences = currentSource.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const newPosition = Math.min(sentences.length - 1, currentPosition + 1);
      jumpTo(newPosition);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentSource(null);
    stop();
  };

  // Save progress periodically
  useEffect(() => {
    if (currentSource && isPlaying) {
      const interval = setInterval(() => {
        storage.saveProgress({
          sourceId: currentSource.id,
          position: currentPosition,
          timestamp: Date.now(),
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentSource, isPlaying, currentPosition]);

  // Home View
  const renderHomeView = () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Welcome Message - Only show when no recent sources */}
        {recentSources.length === 0 && (
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to oto
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Transform your text and images into natural speech
            </p>
          </div>
        )}

        {/* Single Add Content Button */}
        <div className="relative mb-8">
          <button
            onClick={() => setShowUploadOptions(!showUploadOptions)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold text-lg">Add Content</span>
          </button>

          {/* Upload Options Dropdown */}
          {showUploadOptions && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10">
              <button
                onClick={() => {
                  setIsTextModalOpen(true);
                  setShowUploadOptions(false);
                }}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="font-medium text-gray-900">Type or Paste Text</div>
                <div className="text-sm text-gray-500">Add text manually</div>
              </button>
              
              <PhotoUpload onTextExtracted={handleTextSubmit} />
            </div>
          )}
        </div>

        {/* Recent Sources - Compact List with Delete */}
        {recentSources.length > 0 && (
          <div className="w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent</h3>
            <div className="space-y-3">
              {recentSources.slice(0, 5).map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <button
                    onClick={() => handleSourceSelect(source)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="font-medium text-gray-900 truncate">{source.title}</div>
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {source.content.split(' ').slice(0, 3).join(' ')}...
                    </div>
                  </button>
                  <button
                    onClick={() => handleSourceDelete(source.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showUploadOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowUploadOptions(false)}
        />
      )}
    </div>
  );

  // Reading View
  const renderReadingView = () => (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <button 
          onClick={handleBackToHome}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
      
      {currentSource && (
        <TextViewer
          source={currentSource}
          currentPosition={currentPosition}
          onPositionClick={handlePositionClick}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="transition-all duration-300 ease-in-out">
        {currentView === 'home' ? renderHomeView() : renderReadingView()}
      </main>

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onTextSubmit={handleTextSubmit}
      />

      {/* Sticky Audio Controls - Only show when reading */}
      {currentView === 'reading' && currentSource && (
        <AudioControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          settings={settings}
          voices={voices}
          onPlay={handlePlay}
          onPause={pause}
          onStop={stop}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          onSettingsChange={updateSettings}
        />
      )}
    </div>
  );
}

export default App;