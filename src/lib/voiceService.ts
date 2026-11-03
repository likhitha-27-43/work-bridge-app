// Voice Service: Web Speech API for recognition (Speech-to-Text) and synthesis (Text-to-Speech)
// Designed for rural, low-literacy, and first-time smartphone users.

export interface VoiceRecognitionResult {
  transcript: string;
  isSimulated?: boolean;
}

const SAMPLE_VOICE_QUERIES = [
  'Mason work near me',
  'Plumber job for tomorrow',
  'House painter in Hyderabad',
  'Electrician daily wage work',
  'Cleaning job near metro station',
  'Gardener for 2 days',
  'Construction helper work',
];

export class VoiceService {
  private static recognition: any = null;
  private static isListening = false;

  static isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  static startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (err: string) => void,
    language: string = 'en-IN'
  ): () => void {
    if (!this.isSpeechRecognitionSupported()) {
      // High-quality simulated fallback for environments without microphone permissions
      const randomQuery = SAMPLE_VOICE_QUERIES[Math.floor(Math.random() * SAMPLE_VOICE_QUERIES.length)];
      const timer = setTimeout(() => {
        onResult({ transcript: randomQuery, isSimulated: true });
      }, 1500);
      return () => clearTimeout(timer);
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult({ transcript, isSimulated: false });
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition fallback:', event.error);
        // Fallback gracefully to simulated query so the user experience never blocks
        const randomQuery = SAMPLE_VOICE_QUERIES[Math.floor(Math.random() * SAMPLE_VOICE_QUERIES.length)];
        onResult({ transcript: randomQuery, isSimulated: true });
      };

      rec.start();
      return () => {
        try {
          rec.stop();
        } catch (_) {}
      };
    } catch (e) {
      const randomQuery = SAMPLE_VOICE_QUERIES[Math.floor(Math.random() * SAMPLE_VOICE_QUERIES.length)];
      const timer = setTimeout(() => {
        onResult({ transcript: randomQuery, isSimulated: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }

  static speak(text: string, langCode: string = 'en'): void {
    if (!this.isSpeechSynthesisSupported()) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, clearer tempo for comprehension
      utterance.pitch = 1.0;

      // Select voice if available
      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes(langCode));
      if (inVoice) {
        utterance.voice = inVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  static stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}
