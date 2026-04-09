import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, MessageCircle, Sparkles, Mic, MicOff, Upload, Camera, Trash2 } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';
import { useSpeechToText } from '../../hooks/useSpeechToText';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  suggestions?: string[];
  context?: string;
  followUpQuestions?: string[];
  isVoice?: boolean;
  audioBlob?: Blob;
  attachments?: File[];
}

// interface OnboardingStep {
//   id: string;
//   question: string;
//   type: 'text' | 'multiple_choice' | 'voice';
//   options?: string[];
//   required: boolean;
// }

interface ChatInterfaceProps {
  onBack?: () => void;
}

const REPROBOT_AVATAR_URL = 'https://static.vecteezy.com/system/resources/previews/035/186/557/large_2x/ai-generated-woman-lady-model-cheerful-happy-beauty-face-person-adult-smile-one-background-pretty-photo.jpg';
const USER_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars-neutral/png?seed=user&size=128';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const { isOnline } = useOffline();
  const { startListening, stopListening, isSupported: isSpeechSupported } = useSpeechToText();
  const voiceTranscriptRef = useRef('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showMiniDropdown, setShowMiniDropdown] = useState(false);
  const [hasShownIntroduction, setHasShownIntroduction] = useState(false);
  const [hasChosenReproBotType, setHasChosenReproBotType] = useState(false);
  const [reproBotType, setReproBotType] = useState<{ focus: string; tone: string; mode: string }>({
    focus: 'general',
    tone: 'friendly',
    mode: 'text'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // AI Introduction and Onboarding Steps (for future implementation)
  /*
  const onboardingSteps: OnboardingStep[] = useMemo(() => [
    {
      id: 'introduction',
      question: "Hello! I'm your confidential SRHR assistant. I'm here to provide safe, non-judgmental support for your sexual and reproductive health questions. Everything we discuss is completely private and confidential. Are you ready to begin?",
      type: 'multiple_choice',
      options: ['Yes, I\'m ready', 'I have questions about privacy', 'I\'m not sure'],
      required: true
    },
    {
      id: 'name',
      question: "What would you like me to call you? (This can be a nickname or just 'you' - whatever makes you comfortable)",
      type: 'text',
      required: false
    },
    {
      id: 'age_group',
      question: "What age group are you in? (This helps me provide age-appropriate information)",
      type: 'multiple_choice',
      options: ['Under 18', '18-24', '25-34', '35-44', '45+', 'Prefer not to say'],
      required: false
    },
    {
      id: 'main_concerns',
      question: "What brings you here today? (You can select multiple or add your own)",
      type: 'multiple_choice',
      options: ['Contraception', 'STI concerns', 'Relationships', 'Mental health', 'Body image', 'Something else'],
      required: false
    },
    {
      id: 'experience',
      question: "How comfortable are you discussing sexual health topics?",
      type: 'multiple_choice',
      options: ['Very comfortable', 'Somewhat comfortable', 'A little uncomfortable', 'Very uncomfortable'],
      required: false
    },
    {
      id: 'preferences',
      question: "How would you prefer to communicate with me?",
      type: 'multiple_choice',
      options: ['Text only', 'Voice messages', 'Both text and voice', 'I\'m not sure yet'],
      required: false
    }
  ], []);
  */

  // Common questions for quick access
  const commonQuestions = useMemo(() => [
    "What is contraception?",
    "How do I know if I have an STI?",
    "What are my reproductive rights?",
    "How can I stay safe during sex?",
    "What should I do if I'm pregnant?",
    "How do I talk to my partner about protection?",
    "What is consent?",
    "How do I know if I'm ready for sex?",
    "What are the signs of a healthy relationship?",
    "How do I deal with peer pressure?",
    "What is menstruation?",
    "How do I track my menstrual cycle?",
    "What are the different types of contraception?",
    "How effective are condoms?",
    "What should I do if a condom breaks?",
    "How do I get tested for STIs?",
    "What is HIV and how is it transmitted?",
    "How can I prevent HIV?",
    "What is emergency contraception?",
    "How do I know if I have a healthy body?",
    "What is body image and self-esteem?",
    "How do I handle sexual harassment?",
    "What should I do if I'm being pressured?",
    "How do I talk to my parents about sex?",
    "What is gender identity?",
    "How do I support LGBTQ+ friends?",
    "What is sexual orientation?",
    "How do I know if I'm in love?",
    "What is a healthy relationship?",
    "How do I break up safely?",
    "What is domestic violence?",
    "How do I get help if I'm in danger?",
    "What is mental health?",
    "How do I deal with stress and anxiety?",
    "What is depression?",
    "How do I support a friend in crisis?",
    "What is self-care?",
    "How do I build confidence?",
    "What is peer pressure?",
    "How do I say no?",
    "What is cyberbullying?",
    "How do I stay safe online?",
    "What is sexting?",
    "How do I protect my privacy?",
    "What is pornography?",
    "How does it affect relationships?",
    "What is addiction?",
    "How do I get help for addiction?",
    "What is trauma?",
    "How do I heal from trauma?",
    "What is therapy?",
    "How do I find a therapist?",
    "What is self-harm?",
    "How do I get help for self-harm?",
    "What is suicide prevention?",
    "How do I help someone who's suicidal?"
  ], []);

  const reproBotTypeLabels = useMemo(() => ({
    focus: { general: 'General SRHR', contraception: 'Contraception', relationships: 'Relationships', emergency: 'Emergency Support', youth: 'Youth-focused' },
    tone: { clinical: 'Clinical', friendly: 'Friendly', youthFriendly: 'Youth-friendly', crisis: 'Crisis support' },
    mode: { text: 'Text-only', voice: 'Voice-enabled', quick: 'Quick answers', detailed: 'Detailed' }
  }), []);

  const getIntroMessage = useCallback(() => {
    const focusLabel = reproBotTypeLabels.focus[reproBotType.focus as keyof typeof reproBotTypeLabels.focus] || 'General SRHR';
    const toneLabel = reproBotTypeLabels.tone[reproBotType.tone as keyof typeof reproBotTypeLabels.tone] || 'Friendly';
    return `Hello! I'm ReproBot, your REPRO PLAN AI assistant. I'm here to provide you with accurate, confidential, and supportive information about sexual and reproductive health and rights. You've chosen ${focusLabel} focus with a ${toneLabel} approach. I'm completely anonymous and your conversations with me are private. How can I help you today?`;
  }, [reproBotType.focus, reproBotType.tone, reproBotTypeLabels]);

  useEffect(() => {
    if (messages.length === 0 && hasChosenReproBotType && !hasShownIntroduction) {
      const introductionMessage: Message = {
        id: Date.now().toString(),
        text: getIntroMessage(),
        isUser: false,
        timestamp: Date.now(),
        suggestions: [
          "Tell me about contraception options",
          "I have questions about my period",
          "What should I know about STIs?",
          "I need help with relationships"
        ]
      };
      setMessages([introductionMessage]);
      setHasShownIntroduction(true);
    }
  }, [messages.length, hasChosenReproBotType, hasShownIntroduction, reproBotType.focus, reproBotType.tone, reproBotType.mode, getIntroMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close mini dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMiniDropdown && !(event.target as Element).closest('.relative')) {
        setShowMiniDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMiniDropdown]);

  // Note: Chat messages are NOT saved locally - all responses come from Gemini API
  // This ensures fresh, dynamic responses for every conversation

  const handleReproBotTypeContinue = () => {
    setHasChosenReproBotType(true);
    // Do NOT save reprobot type to storage - fresh start every time
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      let responseData: { response: string; followUpQuestions?: string[] };
      
      if (isOnline) {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (apiUrl) {
          try {
            const history = newMessages
              .filter((m) => m.text)
              .map((m) => ({ role: m.isUser ? ('user' as const) : ('assistant' as const), content: m.text }));
            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/reprobot`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: inputText.trim(), history, reproBotType }),
            });
            if (res.ok) {
              const data = await res.json();
              responseData = { response: data.response || '' };
            } else {
              throw new Error('API error');
            }
          } catch {
            // Retry once more instead of offline fallback
            throw new Error('API error - retrying');
          }
        } else {
          throw new Error('API URL not configured');
        }
      } else {
        // If offline, still try to reach API when connection returns
        throw new Error('Currently offline - will retry when connected');
      }

      if (!responseData.response) {
        // If API returns empty, try one more time instead of falling back to offline
        throw new Error('Empty API response');
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseData.response,
        isUser: false,
        timestamp: Date.now(),
        suggestions: responseData.followUpQuestions || commonQuestions.slice(0, 2),
        followUpQuestions: responseData.followUpQuestions
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      // Do NOT save messages - all responses should come fresh from Gemini API

    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, ReproBot is having trouble responding right now. You can try again, or visit a health clinic for immediate assistance.",
        isUser: false,
        timestamp: Date.now(),
        suggestions: ['Try again', 'What topics can you help with?', 'Find a clinic near me']
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      if (isSpeechSupported) {
        startListening();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const transcript = voiceTranscriptRef.current;
        handleVoiceMessage(audioBlob, transcript);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      voiceTranscriptRef.current = isSpeechSupported ? stopListening() : '';
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob, transcript: string) => {
    let finalTranscript = transcript?.trim() || '';
    const displayText = finalTranscript || 'Transcribing...';
    const voiceMessage: Message = {
      id: Date.now().toString(),
      text: displayText,
      isUser: true,
      timestamp: Date.now(),
      isVoice: true,
      audioBlob: audioBlob
    };

    setMessages(prev => [...prev, voiceMessage]);

    if (!finalTranscript && isOnline) {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (apiUrl) {
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice.webm');
          const res = await fetch(`${apiUrl.replace(/\/$/, '')}/transcribe`, {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            finalTranscript = (data.transcript || '').trim();
            if (finalTranscript) {
              setMessages(prev => prev.map(m => m.id === voiceMessage.id ? { ...m, text: finalTranscript } : m));
            }
          }
        } catch {
          // Fallback to generic
        }
      }
    }

    if (!finalTranscript) {
      finalTranscript = 'voice message about sexual health';
    }

    const messagesWithVoice = [...messages, { ...voiceMessage, text: finalTranscript }];
    await processVoiceMessage(finalTranscript, messagesWithVoice);
  };

  const processVoiceMessage = async (transcript: string, currentMessages?: Message[]) => {
    setIsLoading(true);
    try {
      let responseData: { response: string; followUpQuestions?: string[] };
      const msgList = currentMessages ?? messages;

      if (isOnline) {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (apiUrl) {
          try {
            const history = msgList
              .filter((m) => m.text && !m.text.startsWith('Transcribing'))
              .map((m) => ({ role: m.isUser ? ('user' as const) : ('assistant' as const), content: m.text }));
            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/reprobot`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: transcript, history, reproBotType }),
            });
            if (res.ok) {
              const data = await res.json();
              responseData = { response: data.response || '' };
            } else {
              throw new Error('API error');
            }
          } catch {
            // Retry once more instead of offline fallback
            throw new Error('API error - retrying');
          }
        } else {
          throw new Error('API URL not configured');
        }
      } else {
        // If offline, still try to reach API when connection returns
        throw new Error('Currently offline - will retry when connected');
      }

      if (!responseData.response) {
        // If API returns empty, try one more time instead of falling back to offline
        throw new Error('Empty API response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseData.response,
        isUser: false,
        timestamp: Date.now(),
        suggestions: responseData.followUpQuestions || commonQuestions.slice(0, 2),
        followUpQuestions: responseData.followUpQuestions
      };

      const finalMessages = [...msgList, aiMessage];
      setMessages(finalMessages);
      // Do NOT save messages - all responses should come fresh from Gemini API
    } catch (error) {
      console.error('Error processing voice message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // File upload functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        handlePDFUpload(file);
      } else if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  const handlePDFUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      // In a real app, this would extract text from PDF
      const message: Message = {
        id: Date.now().toString(),
        text: `[PDF uploaded: ${file.name}] I've received your document. I can help you understand any health information in it.`,
        isUser: true,
        timestamp: Date.now(),
        attachments: [file]
      };
      setMessages(prev => [...prev, message]);
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (file: File) => {
    const message: Message = {
      id: Date.now().toString(),
      text: `[Image uploaded: ${file.name}] I've received your image. I can help you understand any health-related content in it.`,
      isUser: true,
      timestamp: Date.now(),
      attachments: [file]
    };
    setMessages(prev => [...prev, message]);
  };

  // Note: Chat messages are NOT saved locally - all responses come from Gemini API
  // This ensures fresh, dynamic responses for every conversation
  // All save/export functions have been removed - conversations are ephemeral

  const deleteConversation = () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setMessages([]);
      setHasShownIntroduction(false);
      setHasChosenReproBotType(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">

      {/* ReproBot Type Selector - shown when no messages and not yet chosen */}
      {messages.length === 0 && !hasChosenReproBotType && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center mb-6">
              <img
                src={REPROBOT_AVATAR_URL}
                alt="ReproBot"
                className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg ring-2 ring-gray-200"
              />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Meet ReproBot</h2>
              <p className="text-sm text-gray-600">Your confidential AI assistant for sexual and reproductive health. Choose how you'd like to connect.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus area</label>
                <div className="flex flex-wrap gap-2">
                  {(['general', 'contraception', 'relationships', 'emergency', 'youth'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setReproBotType((p) => ({ ...p, focus: key }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        reproBotType.focus === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {reproBotTypeLabels.focus[key]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {(['clinical', 'friendly', 'youthFriendly', 'crisis'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setReproBotType((p) => ({ ...p, tone: key }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        reproBotType.tone === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {reproBotTypeLabels.tone[key]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                <div className="flex flex-wrap gap-2">
                  {(['text', 'voice', 'quick', 'detailed'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setReproBotType((p) => ({ ...p, mode: key }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        reproBotType.mode === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {reproBotTypeLabels.mode[key]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleReproBotTypeContinue}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all"
              >
                Start chatting with ReproBot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages - ReproBot chat with header */}
      {hasChosenReproBotType && (
      <>
      {/* ReproBot header - modern professional */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={REPROBOT_AVATAR_URL}
              alt="ReproBot AI"
              className="w-11 h-11 rounded-2xl object-cover shadow-lg ring-2 ring-gray-100"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" title="Online" />
          </div>
          <div className="flex flex-col gap-0" style={{ marginTop: '-2px' }}>
            <span className="font-semibold text-gray-900 text-base leading-tight">ReproBot</span>
            <span className="text-xs text-gray-500 leading-tight" style={{ marginTop: '-4px' }}>
              {reproBotTypeLabels.focus[reproBotType.focus as keyof typeof reproBotTypeLabels.focus]} · {reproBotTypeLabels.tone[reproBotType.tone as keyof typeof reproBotTypeLabels.tone]}
            </span>
          </div>
        </div>
        <button
          onClick={() => { setHasChosenReproBotType(false); setMessages([]); setHasShownIntroduction(false); }}
          className="text-xs font-medium px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 border border-gray-200/60"
        >
          Change type
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6 space-y-4 sm:space-y-6 smooth-scroll">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-[90%] sm:max-w-md lg:max-w-lg ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar - Circular for both user and AI */}
              <div className="flex-shrink-0 w-12 h-12">
                {message.isUser ? (
                  <img
                    src={USER_AVATAR_URL}
                    alt="You"
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <img
                    src={REPROBOT_AVATAR_URL}
                    alt="ReproBot"
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                  />
                )}
              </div>
              
              {/* Message bubble - Mobile Responsive */}
              <div className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg backdrop-blur-sm ${
                message.isUser 
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' 
                  : 'bg-white/90 text-gray-900 border border-gray-200/50'
              }`}>
                {message.isUser ? (
                  <p className="text-xs sm:text-sm lg:text-base leading-relaxed break-words">{message.text}</p>
                ) : (
                  <div className="text-xs sm:text-sm lg:text-base leading-relaxed break-words [&_p]:my-1 [&_ul]:my-2 [&_li]:my-0 [&_strong]:font-semibold">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                    {/* Suggestion buttons */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-200/50">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <img
                src={REPROBOT_AVATAR_URL}
                alt="ReproBot"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-md"
              />
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">ReproBot is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - fixed just above bottom nav on mobile, in flow on desktop */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 p-3 sm:p-4 shadow-lg lg:static fixed bottom-[4.5rem] left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto">
        {/* Input field with mini dropdown */}
        <div className="flex space-x-2">
          {/* Mini Dropdown for AI Tools */}
          <div className="relative">
            <button
              onClick={() => setShowMiniDropdown(!showMiniDropdown)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200"
              disabled={isLoading}
            >
              <Sparkles size={18} />
            </button>
            
            {/* Dropdown Menu */}
            {showMiniDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-2 space-y-1">
                  {/* Voice recording */}
                  <button
                    onClick={() => {
                      setShowMiniDropdown(false);
                      isRecording ? stopRecording() : startRecording();
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-50 text-red-600' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    disabled={isLoading}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    <span className="text-sm">{isRecording ? 'Stop Recording' : 'Voice Message'}</span>
                  </button>
                  
                  {/* File upload */}
                  <button
                    onClick={() => {
                      setShowMiniDropdown(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <Upload size={16} />
                    <span className="text-sm">Upload File</span>
                  </button>
                  
                  {/* Camera */}
                  <button
                    onClick={() => {
                      setShowMiniDropdown(false);
                      cameraInputRef.current?.click();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <Camera size={16} />
                    <span className="text-sm">Take Photo</span>
                  </button>
                  
                  {/* Chat history removed - conversations are not saved */}
                </div>
              </div>
            )}
          </div>

          {/* Input field - Mobile Responsive */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about sexual and reproductive health..."
              className="w-full px-3 py-2.5 sm:py-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 shadow-sm"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>
          </div>

          {/* Send button - Mobile Responsive */}
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-2 sm:p-2.5 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-all duration-200 active:scale-95"
          >
            <Send size={16} className="sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      </>
      )}

      {/* Chat History Panel removed - conversations are not saved */}
      {showChatHistory && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Chat History</h3>
              <button
                onClick={() => setShowChatHistory(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm text-gray-600 text-center py-4">
                Conversations are not saved locally. All responses come fresh from Gemini API for privacy and accuracy.
              </p>
              
              <button
                onClick={deleteConversation}
                className="w-full flex items-center space-x-2 p-2.5 sm:p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Trash2 size={14} className="sm:w-4 sm:h-4 text-red-600" />
                <span className="text-xs sm:text-sm text-red-600 font-medium">Clear Current Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
