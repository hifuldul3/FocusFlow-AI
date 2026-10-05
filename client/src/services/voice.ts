export interface VoiceSpeechOptions {
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

class VoiceService {
  private activeRecognition: any = null;
  private isListening: boolean = false;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public async requestMicPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop track immediately to free hardware
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch (e) {
        console.warn('Microphone permission denied or unavailable:', e);
        return false;
      }
    }
    return false;
  }

  public async startListening(options: VoiceSpeechOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      options.onError('Browser Speech Recognition API is not supported in this browser. You can type or use sample voice prompts.');
      options.onEnd();
      return;
    }

    // Stop existing recognition if active
    this.stopListening();

    // Request explicit mic permission first to ensure popup appears
    const hasMicAccess = await this.requestMicPermission();
    if (!hasMicAccess) {
      options.onError('Microphone permission was denied. Click the lock/mic icon in your browser address bar to allow mic access.');
      options.onEnd();
      return;
    }

    try {
      // Create a fresh SpeechRecognition instance every time to avoid InvalidStateError
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      this.activeRecognition = recognition;
      this.isListening = true;

      recognition.onstart = () => {
        this.playChime(600, 0.1);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        if (finalTranscript) {
          options.onResult(finalTranscript, true);
        } else if (interimTranscript) {
          options.onResult(interimTranscript, false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        let msg = `Voice error: ${event.error}`;
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission blocked. Please allow mic access in your browser address bar.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please speak clearly into your mic or click a sample voice prompt.';
        } else if (event.error === 'network') {
          msg = 'Speech recognition network error. Please check connection or use text fallback.';
        }
        options.onError(msg);
      };

      recognition.onend = () => {
        this.isListening = false;
        this.activeRecognition = null;
        options.onEnd();
      };

      recognition.start();
    } catch (e: any) {
      console.error('Failed to initialize speech recognition:', e);
      this.isListening = false;
      this.activeRecognition = null;
      options.onError('Could not start microphone listening. Try refreshing or typing your prompt.');
      options.onEnd();
    }
  }

  public stopListening(): void {
    if (this.activeRecognition && this.isListening) {
      this.isListening = false;
      try {
        this.playChime(400, 0.1);
        this.activeRecognition.stop();
      } catch (e) {}
      this.activeRecognition = null;
    }
  }

  public speakText(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }

  private playChime(freq: number, durationSec: number): void {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + durationSec);

      osc.start(now);
      osc.stop(now + durationSec);
    } catch (e) {}
  }
}

export const voiceService = new VoiceService();
