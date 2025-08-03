import { useState, useEffect, useRef } from 'react';
import { TTSManager } from '../utils/tts';
import { TTSSettings } from '../types';
import { storage } from '../utils/storage';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [settings, setSettings] = useState<TTSSettings>(() => storage.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const ttsManager = useRef<TTSManager>(new TTSManager());

  useEffect(() => {
    const manager = ttsManager.current;
    
    manager.setPositionChangeCallback((position) => {
      setCurrentPosition(position);
    });

    manager.setEndCallback(() => {
      setIsPlaying(false);
      setIsPaused(false);
    });

    // Load voices
    const loadVoices = () => {
      const availableVoices = manager.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      manager.stop();
    };
  }, []);

  const speak = (text: string, startPosition: number = 0) => {
    ttsManager.current.speak(text, settings, startPosition);
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentPosition(startPosition);
  };

  const pause = () => {
    ttsManager.current.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const resume = () => {
    ttsManager.current.resume();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const stop = () => {
    ttsManager.current.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
  };

  const jumpTo = (position: number) => {
    ttsManager.current.jumpToPosition(position);
    setCurrentPosition(position);
  };

  const updateSettings = (newSettings: Partial<TTSSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    storage.saveSettings(updatedSettings);
  };

  return {
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
  };
};