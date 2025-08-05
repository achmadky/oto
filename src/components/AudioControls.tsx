import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Settings 
} from 'lucide-react';
import { TTSSettings } from '../types';

interface AudioControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  settings: TTSSettings;
  voices: SpeechSynthesisVoice[];
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSettingsChange: (settings: Partial<TTSSettings>) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isPaused,
  settings,
  voices,
  onPlay,
  onPause,
  onStop,
  onSkipBack,
  onSkipForward,
  onSettingsChange,
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  // Speed options from 0.5 to 3.0
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 1.75, label: '1.75x' },
    { value: 2, label: '2x' },
    { value: 2.5, label: '2.5x' },
    { value: 3, label: '3x' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={onSkipBack}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            title="Previous sentence"
          >
            <SkipBack className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 mx-2"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onStop}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            title="Stop"
          >
            <Square className="w-4 h-4 text-gray-700" />
          </button>

          <button
            onClick={onSkipForward}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            title="Next sentence"
          >
            <SkipForward className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Volume and Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 mr-3">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onSettingsChange({ volume: parseFloat(e.target.value) })}
              className="flex-1 accent-blue-600 h-1"
            />
            <span className="text-xs text-gray-600 w-8 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              showSettings 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speed
              </label>
              <select
                value={settings.rate}
                onChange={(e) => onSettingsChange({ rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {speedOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={settings.voice?.name || ''}
                onChange={(e) => {
                  const selectedVoice = voices.find(voice => voice.name === e.target.value);
                  if (selectedVoice) {
                    onSettingsChange({ voice: selectedVoice });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {voices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};