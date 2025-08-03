import React, { useState, useEffect } from 'react';
import { Headphones } from 'lucide-react';
import { Header } from './components/Header';
import { TextInput } from './components/TextInput';
import { PdfUpload } from './components/PdfUpload';
import { ImageOcr } from './components/ImageOcr';
import { TextViewer } from './components/TextViewer';
import { AudioControls } from './components/AudioControls';
import { RecentSources } from './components/RecentSources';
import { useTTS } from './hooks/useTTS';
import { storage } from './utils/storage';
import { TextSource } from './types';

function App() {
  const [currentSource, setCurrentSource] = useState<TextSource | null>(null);
  const [recentSources, setRecentSources] = useState<TextSource[]>([]);
  const [activeInput, setActiveInput] = useState<'manual' | 'pdf' | 'image'>('manual');
  
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
    storage.saveSource(source);
    setCurrentSource(source);
    setRecentSources(storage.getSources());
    
    // Auto-start reading
    speak(source.content);
  };

  const handleSourceSelect = (source: TextSource) => {
    setCurrentSource(source);
    
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Methods */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveInput('manual')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeInput === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Input
              </button>
              <button
                onClick={() => setActiveInput('pdf')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeInput === 'pdf'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                PDF Upload
              </button>
              <button
                onClick={() => setActiveInput('image')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeInput === 'image'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Image OCR
              </button>
            </div>

            {activeInput === 'manual' && (
              <TextInput 
                onTextSubmit={handleTextSubmit} 
                isActive={activeInput === 'manual'}
              />
            )}
            
            {activeInput === 'pdf' && (
              <PdfUpload 
                onTextExtracted={handleTextSubmit} 
                isActive={activeInput === 'pdf'}
              />
            )}
            
            {activeInput === 'image' && (
              <ImageOcr 
                onTextExtracted={handleTextSubmit} 
                isActive={activeInput === 'image'}
              />
            )}

            {currentSource && (
              <TextViewer
                source={currentSource}
                currentPosition={currentPosition}
                onPositionClick={handlePositionClick}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {currentSource && (
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

            <RecentSources
              sources={recentSources}
              onSourceSelect={handleSourceSelect}
              onSourceDelete={handleSourceDelete}
            />
          </div>
        </div>

        {!currentSource && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Headphones className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to Readion
              </h2>
              <p className="text-gray-600">
                Choose an input method above to start converting text to speech. 
                Your files and settings are stored locally for privacy.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;