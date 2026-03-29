import { useRef, useCallback } from 'react';

const SpeechRecognition =
  typeof window !== 'undefined' &&
  ((window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition);

export function useSpeechToText() {
  const transcriptRef = useRef('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = !!SpeechRecognition;

  const startListening = useCallback((): void => {
    if (!SpeechRecognition) return;

    transcriptRef.current = '';
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let finalTranscript = '';
      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        transcriptRef.current = (transcriptRef.current + ' ' + finalTranscript).trim();
      }
    };

    try {
      recognition.start();
    } catch {
      // Ignore if already started
    }
  }, []);

  const stopListening = useCallback((): string => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }
    return transcriptRef.current;
  }, []);

  return { startListening, stopListening, isSupported };
}
