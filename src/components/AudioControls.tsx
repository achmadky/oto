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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={onSkipBack}
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            title="Skip back 10 seconds"
          >
            <SkipBack className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-4 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>

          <button
            onClick={onStop}
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            title="Stop"
          >
            <Square className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={onSkipForward}
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            title="Skip forward 10 seconds"
          >
            <SkipForward className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => onSettingsChange({ volume: parseFloat(e.target.value) })}
              className="w-20"
            />
            <span className="text-sm text-gray-600">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Settings className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speed: {settings.rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => onSettingsChange({ rate: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pitch: {settings.pitch}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => onSettingsChange({ pitch: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {voices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={settings.voice?.name || ''}
                  onChange={(e) => {
                    const selectedVoice = voices.find(v => v.name === e.target.value);
                    onSettingsChange({ voice: selectedVoice });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Default Voice</option>
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};