import { TextSource, TTSSettings, ReadingProgress } from '../types';

const STORAGE_KEYS = {
  SOURCES: 'readion_sources',
  SETTINGS: 'readion_settings',
  PROGRESS: 'readion_progress',
} as const;

export const storage = {
  // Sources management
  getSources(): TextSource[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SOURCES);
    return stored ? JSON.parse(stored) : [];
  },

  saveSource(source: TextSource): void {
    const sources = this.getSources();
    const existingIndex = sources.findIndex(s => s.id === source.id);
    
    if (existingIndex >= 0) {
      sources[existingIndex] = source;
    } else {
      sources.unshift(source);
      // Keep only last 10 sources
      if (sources.length > 10) {
        sources.splice(10);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  },

  deleteSource(id: string): void {
    const sources = this.getSources().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  },

  // Settings management
  getSettings(): TTSSettings {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : {
      rate: 1,
      pitch: 1,
      volume: 0.8,
    };
  },

  saveSettings(settings: TTSSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Progress management
  getProgress(sourceId: string): ReadingProgress | null {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    const allProgress: ReadingProgress[] = stored ? JSON.parse(stored) : [];
    return allProgress.find(p => p.sourceId === sourceId) || null;
  },

  saveProgress(progress: ReadingProgress): void {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    const allProgress: ReadingProgress[] = stored ? JSON.parse(stored) : [];
    const existingIndex = allProgress.findIndex(p => p.sourceId === progress.sourceId);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
      // Keep only last 20 progress entries
      if (allProgress.length > 20) {
        allProgress.splice(0, allProgress.length - 20);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
  },
};