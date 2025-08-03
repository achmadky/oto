export interface TextSource {
  id: string;
  type: 'manual' | 'pdf' | 'image';
  title: string;
  content: string;
  timestamp: number;
}

export interface TTSSettings {
  rate: number;
  pitch: number;
  voice?: SpeechSynthesisVoice;
  volume: number;
}

export interface ReadingProgress {
  sourceId: string;
  position: number;
  timestamp: number;
}

export interface AppState {
  currentSource: TextSource | null;
  isPlaying: boolean;
  currentPosition: number;
  settings: TTSSettings;
}