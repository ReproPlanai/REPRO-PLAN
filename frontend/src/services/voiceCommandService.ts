// Voice Command Service for Motor Accessibility
// This service handles voice commands for users with motor disabilities

export interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  description: string;
  category: 'navigation' | 'quiz' | 'general' | 'emergency';
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  command?: VoiceCommand;
}

class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private commands: VoiceCommand[] = [];
  private onCommandCallback?: (command: VoiceCommand) => void;
  private onErrorCallback?: (error: string) => void;

  constructor() {
    this.initializeCommands();
    this.initializeSpeechRecognition();
  }

  private initializeCommands() {
    this.commands = [
      // Navigation Commands
      { id: '1', phrase: 'go home', action: 'navigate', description: 'Navigate to home page', category: 'navigation' },
      { id: '2', phrase: 'go to quiz', action: 'navigate', description: 'Navigate to quiz page', category: 'navigation' },
      { id: '3', phrase: 'go to clinics', action: 'navigate', description: 'Navigate to clinics page', category: 'navigation' },
      { id: '4', phrase: 'go to emergency', action: 'navigate', description: 'Navigate to emergency page', category: 'navigation' },
      { id: '5', phrase: 'go to settings', action: 'navigate', description: 'Navigate to settings page', category: 'navigation' },
      { id: '6', phrase: 'go back', action: 'navigate', description: 'Go back to previous page', category: 'navigation' },
      
      // Quiz Commands
      { id: '7', phrase: 'start quiz', action: 'quiz', description: 'Start a new quiz', category: 'quiz' },
      { id: '8', phrase: 'next question', action: 'quiz', description: 'Go to next question', category: 'quiz' },
      { id: '9', phrase: 'previous question', action: 'quiz', description: 'Go to previous question', category: 'quiz' },
      { id: '10', phrase: 'submit answer', action: 'quiz', description: 'Submit current answer', category: 'quiz' },
      { id: '11', phrase: 'select option a', action: 'quiz', description: 'Select option A', category: 'quiz' },
      { id: '12', phrase: 'select option b', action: 'quiz', description: 'Select option B', category: 'quiz' },
      { id: '13', phrase: 'select option c', action: 'quiz', description: 'Select option C', category: 'quiz' },
      { id: '14', phrase: 'select option d', action: 'quiz', description: 'Select option D', category: 'quiz' },
      { id: '15', phrase: 'read question', action: 'quiz', description: 'Read current question aloud', category: 'quiz' },
      { id: '16', phrase: 'read explanation', action: 'quiz', description: 'Read explanation aloud', category: 'quiz' },
      
      // General Commands
      { id: '17', phrase: 'help', action: 'general', description: 'Show help information', category: 'general' },
      { id: '18', phrase: 'repeat', action: 'general', description: 'Repeat last action', category: 'general' },
      { id: '19', phrase: 'stop listening', action: 'general', description: 'Stop voice recognition', category: 'general' },
      { id: '20', phrase: 'start listening', action: 'general', description: 'Start voice recognition', category: 'general' },
      { id: '21', phrase: 'accessibility settings', action: 'general', description: 'Open accessibility settings', category: 'general' },
      { id: '22', phrase: 'increase font size', action: 'general', description: 'Increase font size', category: 'general' },
      { id: '23', phrase: 'decrease font size', action: 'general', description: 'Decrease font size', category: 'general' },
      { id: '24', phrase: 'high contrast mode', action: 'general', description: 'Toggle high contrast mode', category: 'general' },
      
      // Emergency Commands
      { id: '25', phrase: 'emergency', action: 'emergency', description: 'Access emergency services', category: 'emergency' },
      { id: '26', phrase: 'call emergency', action: 'emergency', description: 'Call emergency services', category: 'emergency' },
      { id: '27', phrase: 'report abuse', action: 'emergency', description: 'Report abuse or violence', category: 'emergency' },
    ];
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          this.processVoiceInput(result[0].transcript.toLowerCase().trim());
        }
      };
      
      this.recognition.onerror = (event) => {
        this.onErrorCallback?.(event.error);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  private processVoiceInput(transcript: string) {
    // Find matching command
    const command = this.commands.find(cmd => 
      transcript.includes(cmd.phrase) || cmd.phrase.includes(transcript)
    );
    
    if (command) {
      this.onCommandCallback?.(command);
    } else {
      // Try to find partial matches
      const partialMatch = this.commands.find(cmd => 
        transcript.split(' ').some(word => cmd.phrase.includes(word))
      );
      
      if (partialMatch) {
        this.onCommandCallback?.(partialMatch);
      }
    }
  }

  // Start listening for voice commands
  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }
      
      if (this.isListening) {
        resolve();
        return;
      }
      
      try {
        this.recognition.start();
        this.isListening = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stop listening for voice commands
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Set callback for when a command is recognized
  onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallback = callback;
  }

  // Set callback for when an error occurs
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  // Get all available commands
  getCommands(): VoiceCommand[] {
    return this.commands;
  }

  // Get commands by category
  getCommandsByCategory(category: string): VoiceCommand[] {
    return this.commands.filter(cmd => cmd.category === category);
  }

  // Check if speech recognition is supported
  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Speak text aloud
  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  }

  // Stop speaking
  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

export const voiceCommandService = new VoiceCommandService();
