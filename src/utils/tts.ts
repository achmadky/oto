import { TTSSettings } from '../types';

export class TTSManager {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentText: string = '';
  private currentPosition: number = 0;
  private onPositionChange?: (position: number) => void;
  private onEnd?: () => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  speak(text: string, settings: TTSSettings, startPosition: number = 0): void {
    this.stop();
    
    this.currentText = text;
    this.currentPosition = startPosition;
    
    // Split text into sentences for better position tracking
    const sentences = this.splitIntoSentences(text);
    const textToSpeak = sentences.slice(startPosition).join(' ');
    
    this.utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.utterance.rate = settings.rate;
    this.utterance.pitch = settings.pitch;
    this.utterance.volume = settings.volume;
    
    if (settings.voice) {
      this.utterance.voice = settings.voice;
    }

    this.utterance.onboundary = (event) => {
      if (event.name === 'sentence') {
        this.currentPosition += 1;
        this.onPositionChange?.(this.currentPosition);
      }
    };

    this.utterance.onend = () => {
      this.onEnd?.();
    };

    this.synthesis.speak(this.utterance);
  }

  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  stop(): void {
    this.synthesis.cancel();
    this.utterance = null;
  }

  isPlaying(): boolean {
    return this.synthesis.speaking && !this.synthesis.paused;
  }

  isPaused(): boolean {
    return this.synthesis.paused;
  }

  setPositionChangeCallback(callback: (position: number) => void): void {
    this.onPositionChange = callback;
  }

  setEndCallback(callback: () => void): void {
    this.onEnd = callback;
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  getCurrentPosition(): number {
    return this.currentPosition;
  }

  jumpToPosition(position: number): void {
    if (this.currentText && position >= 0) {
      this.currentPosition = position;
      if (this.isPlaying()) {
        const settings = {
          rate: this.utterance?.rate || 1,
          pitch: this.utterance?.pitch || 1,
          volume: this.utterance?.volume || 0.8,
          voice: this.utterance?.voice || undefined,
        };
        this.speak(this.currentText, settings, position);
      }
    }
  }
}