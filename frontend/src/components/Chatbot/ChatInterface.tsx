import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, MessageCircle, Sparkles, Mic, MicOff, Upload, Camera, Download, Trash2, Save } from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';
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

interface UserProfile {
  name?: string;
  age?: number;
  gender?: string;
  concerns?: string[];
  experience?: string;
  preferences?: string[];
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

const REHANA_AVATAR_URL = 'https://static.vecteezy.com/system/resources/previews/035/186/557/large_2x/ai-generated-woman-lady-model-cheerful-happy-beauty-face-person-adult-smile-one-background-pretty-photo.jpg';
const USER_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars-neutral/png?seed=user&size=128';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const { isOnline } = useOffline();
  const { startListening, stopListening, isSupported: isSpeechSupported } = useSpeechToText();
  const voiceTranscriptRef = useRef('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<string>('');
  const [userProfile] = useState<UserProfile>({});
  const [isRecording, setIsRecording] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showMiniDropdown, setShowMiniDropdown] = useState(false);
  const [hasShownIntroduction, setHasShownIntroduction] = useState(false);
  const [hasChosenRehanaType, setHasChosenRehanaType] = useState(false);
  const [rehanaType, setRehanaType] = useState<{ focus: string; tone: string; mode: string }>({
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

  // Offline responses for common questions
  const offlineResponses: { [key: string]: string } = {
    "contraception": "Contraception (birth control) helps prevent pregnancy. There are many types including condoms, pills, IUDs, and implants. Each has different effectiveness rates and side effects. Would you like to know about specific types?",
    "sti": "STIs (Sexually Transmitted Infections) can have symptoms like unusual discharge, pain, or sores. However, many STIs show no symptoms. Regular testing is important. If you're concerned, visit a health clinic for testing.",
    "rights": "You have the right to make decisions about your body, relationships, and reproductive health. This includes the right to say no, access healthcare, and receive accurate information. No one can force you into anything you don't want.",
    "safe sex": "Safe sex includes using condoms, getting tested regularly, talking openly with partners, and respecting boundaries. Communication is key to staying safe and healthy.",
    "pregnancy": "If you think you might be pregnant, take a pregnancy test and see a healthcare provider. They can confirm the pregnancy and discuss your options, which may include continuing the pregnancy, adoption, or termination.",
    "partner": "Talking about protection with your partner is important for your health. Be honest about your concerns and needs. A good partner will respect your boundaries and health.",
    "consent": "Consent is clear, enthusiastic agreement to sexual activity. It must be given freely, can be withdrawn at any time, and must be given by someone who is capable of making that decision. Consent is never assumed and must be ongoing.",
    "ready for sex": "Being ready for sex means you feel comfortable, have accurate information, can communicate with your partner, understand consent, and are prepared for the emotional and physical aspects. There's no specific age - it's about maturity and readiness.",
    "healthy relationship": "A healthy relationship is based on respect, trust, communication, and equality. Both partners should feel safe, supported, and valued. You should be able to express your needs and boundaries without fear.",
    "peer pressure": "Peer pressure is when friends or others try to influence your decisions. It's okay to say no to things that don't feel right for you. True friends will respect your boundaries and support your choices.",
    "menstruation": "Menstruation is the monthly shedding of the uterine lining. It's a normal part of the menstrual cycle and typically lasts 3-7 days. It's important to track your cycle and talk to a healthcare provider about any concerns.",
    "track cycle": "You can track your menstrual cycle by noting the first day of your period each month. A typical cycle is 21-35 days. You can use apps, calendars, or journals to track symptoms, mood, and flow.",
    "types contraception": "Contraception types include: barrier methods (condoms, diaphragms), hormonal methods (pills, patches, rings, implants, IUDs), and permanent methods (tubal ligation, vasectomy). Each has different effectiveness and side effects.",
    "condom effectiveness": "Condoms are 98% effective when used correctly every time. They also protect against STIs. It's important to use them from start to finish and check the expiration date.",
    "condom breaks": "If a condom breaks, stop immediately, check for damage, and use emergency contraception if needed. Get tested for STIs and consider using a backup method of contraception.",
    "sti testing": "STI testing is available at health clinics, some pharmacies, and through healthcare providers. Many tests are quick and painless. Regular testing is important for your health and your partner's health.",
    "hiv": "HIV is a virus that attacks the immune system. It's transmitted through blood, semen, vaginal fluids, and breast milk. It cannot be transmitted through casual contact like hugging or sharing food.",
    "prevent hiv": "You can prevent HIV by using condoms consistently, getting tested regularly, not sharing needles, and considering PrEP (pre-exposure prophylaxis) if you're at high risk.",
    "emergency contraception": "Emergency contraception (morning-after pill) can prevent pregnancy if taken within 72 hours of unprotected sex. It's available at pharmacies and health clinics without a prescription in many places.",
    "healthy body": "A healthy body comes in all shapes and sizes. Focus on eating nutritious foods, staying active, getting enough sleep, and taking care of your mental health. Your worth isn't determined by your appearance.",
    "body image": "Body image is how you see and feel about your body. It's normal to have ups and downs. Focus on what your body can do rather than how it looks. Seek support if negative body image affects your daily life.",
    "sexual harassment": "Sexual harassment is unwanted sexual behavior that makes you feel uncomfortable, scared, or intimidated. It can be verbal, physical, or online. You have the right to report it and get help.",
    "being pressured": "If you're being pressured into sexual activity, it's important to trust your instincts. You have the right to say no at any time. Seek support from trusted adults, friends, or helplines.",
    "talk parents": "Talking to parents about sex can be awkward, but they often want to help. Choose a good time, be honest about your questions, and remember they were young once too. If it's too difficult, talk to another trusted adult.",
    "gender identity": "Gender identity is your internal sense of being male, female, both, neither, or something else. It's separate from biological sex and can be fluid. Everyone deserves respect for their identity.",
    "lgbtq support": "Supporting LGBTQ+ friends means listening without judgment, using their preferred pronouns, standing up against discrimination, and being an ally. Everyone deserves love and acceptance.",
    "sexual orientation": "Sexual orientation is who you're attracted to romantically or sexually. It can be heterosexual, homosexual, bisexual, pansexual, asexual, or other identities. All orientations are valid and normal.",
    "in love": "Love is a complex emotion that involves care, respect, and wanting the best for someone. It's different from infatuation or lust. Take time to understand your feelings and don't rush into decisions.",
    "break up safely": "Breaking up safely means being honest but kind, doing it in person if possible, having a support system, and taking time to heal. It's okay to end relationships that aren't healthy for you.",
    "domestic violence": "Domestic violence is any pattern of abusive behavior in a relationship. It can be physical, emotional, sexual, or financial. If you're in danger, reach out to helplines, trusted adults, or emergency services.",
    "get help danger": "If you're in immediate danger, call emergency services. For ongoing support, contact domestic violence hotlines, trusted adults, or support groups. Your safety is the most important thing.",
    "mental health": "Mental health is your emotional, psychological, and social well-being. It affects how you think, feel, and act. Taking care of your mental health is just as important as physical health.",
    "stress anxiety": "Stress and anxiety are normal responses to challenges. Healthy coping includes exercise, deep breathing, talking to someone, and taking breaks. If it's overwhelming, consider talking to a counselor.",
    "depression": "Depression is more than feeling sad - it's a persistent feeling of hopelessness, loss of interest, and other symptoms that affect daily life. It's treatable, and seeking help is a sign of strength.",
    "support friend crisis": "Supporting a friend in crisis means listening without judgment, encouraging them to seek professional help, staying connected, and taking care of yourself too. Don't try to fix everything alone.",
    "self care": "Self-care is taking care of your physical, mental, and emotional needs. It includes getting enough sleep, eating well, exercising, spending time with loved ones, and doing things you enjoy.",
    "build confidence": "Building confidence takes time and practice. Focus on your strengths, set realistic goals, challenge negative self-talk, and surround yourself with supportive people. Remember, everyone has insecurities.",
    "say no": "Saying no is a skill that protects your boundaries and well-being. Be clear, firm, and don't feel guilty. Practice with small things first. You don't owe anyone an explanation for your 'no.'",
    "cyberbullying": "Cyberbullying is harassment or bullying that happens online. It can include spreading rumors, sharing embarrassing photos, or sending threatening messages. Block the person and report the behavior.",
    "stay safe online": "Stay safe online by using strong passwords, being careful about what you share, not meeting strangers alone, and trusting your instincts. Remember, once something is online, it's hard to take back.",
    "sexting": "Sexting is sending sexual messages or images. It can have serious consequences including legal issues, emotional harm, and privacy violations. Think carefully before sending anything you wouldn't want others to see.",
    "protect privacy": "Protect your privacy by being careful about what you share online, using privacy settings, not sharing passwords, and being cautious about who you trust with personal information.",
    "pornography": "Pornography is adult content that may not reflect real relationships or healthy sexuality. It can create unrealistic expectations. Real relationships involve communication, consent, and emotional connection.",
    "affects relationships": "Pornography can affect relationships by creating unrealistic expectations, reducing intimacy, or causing comparison issues. Open communication with your partner about boundaries and expectations is important.",
    "addiction": "Addiction is a compulsive need for something despite negative consequences. It can affect relationships, work, and health. Recovery is possible with support, treatment, and determination.",
    "help addiction": "Getting help for addiction starts with recognizing the problem and reaching out. Support groups, counseling, and treatment programs are available. Recovery is a journey that requires support and commitment.",
    "trauma": "Trauma is a response to a deeply distressing or disturbing event. It can affect your mental health, relationships, and daily life. Healing is possible with time, support, and professional help.",
    "heal trauma": "Healing from trauma takes time and often requires professional help. Self-care, support from loved ones, therapy, and sometimes medication can help. Be patient and kind to yourself.",
    "therapy": "Therapy is talking to a trained professional about your thoughts, feelings, and experiences. It can help with mental health, relationships, trauma, and personal growth. There's no shame in seeking help.",
    "find therapist": "Finding a therapist involves asking for referrals, checking credentials, considering your needs, and finding someone you feel comfortable with. Many therapists offer sliding scale fees.",
    "self harm": "Self-harm is intentionally hurting yourself as a way to cope with emotional pain. It's a sign that you need help. There are healthier ways to cope, and support is available.",
    "help self harm": "If you're self-harming, reach out to a trusted adult, counselor, or helpline. You're not alone, and there are people who want to help. Recovery is possible with support and treatment.",
    "suicide prevention": "Suicide prevention involves recognizing warning signs, listening without judgment, asking directly about suicidal thoughts, and connecting people to professional help. Your support can save a life.",
    "help suicidal": "If someone is suicidal, take it seriously, listen without judgment, ask directly about their thoughts, stay with them, and connect them to professional help immediately. Don't keep it a secret."
  };

  const rehanaTypeLabels = {
    focus: { general: 'General SRHR', contraception: 'Contraception', relationships: 'Relationships', emergency: 'Emergency Support', youth: 'Youth-focused' },
    tone: { clinical: 'Clinical', friendly: 'Friendly', youthFriendly: 'Youth-friendly', crisis: 'Crisis support' },
    mode: { text: 'Text-only', voice: 'Voice-enabled', quick: 'Quick answers', detailed: 'Detailed' }
  };

  const getIntroMessage = () => {
    const focusLabel = rehanaTypeLabels.focus[rehanaType.focus as keyof typeof rehanaTypeLabels.focus] || 'General SRHR';
    const toneLabel = rehanaTypeLabels.tone[rehanaType.tone as keyof typeof rehanaTypeLabels.tone] || 'Friendly';
    return `Hello! I'm Rehana, your REPRO PLAN AI assistant. I'm here to provide you with accurate, confidential, and supportive information about sexual and reproductive health and rights. You've chosen ${focusLabel} focus with a ${toneLabel} approach. I'm completely anonymous and your conversations with me are private. How can I help you today?`;
  };

  useEffect(() => {
    loadPreviousMessages();
  }, []);

  useEffect(() => {
    if (messages.length === 0 && hasChosenRehanaType && !hasShownIntroduction) {
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
  }, [messages.length, hasChosenRehanaType, hasShownIntroduction, rehanaType.focus, rehanaType.tone, rehanaType.mode, getIntroMessage]);

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

  const loadPreviousMessages = async () => {
    try {
      const [chatHistory, savedType] = await Promise.all([
        offlineStorage.getData('chat_history'),
        offlineStorage.getData('rehana_type')
      ]);
      if (chatHistory && chatHistory.messages && Array.isArray(chatHistory.messages) && chatHistory.messages.length > 0) {
        setMessages(chatHistory.messages);
        setHasChosenRehanaType(true);
        setHasShownIntroduction(true);
      }
      if (savedType && typeof savedType === 'object' && savedType.focus && savedType.tone && savedType.mode) {
        setRehanaType(savedType as { focus: string; tone: string; mode: string });
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleRehanaTypeContinue = () => {
    setHasChosenRehanaType(true);
    offlineStorage.storeData('rehana_type', rehanaType).catch(() => {});
  };

  const saveMessages = async (newMessages: Message[]) => {
    try {
      await offlineStorage.storeData('chat_history', { messages: newMessages });
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOfflineResponse = (question: string, context?: string): { response: string; followUpQuestions?: string[] } => {
    const lowerQuestion = question.toLowerCase();
    const hasContext = context && context.trim().length > 0;
    
    // Check for keywords and return appropriate response with follow-up questions
    if (lowerQuestion.includes('contraception') || lowerQuestion.includes('birth control')) {
      const baseResponse = offlineResponses.contraception;
      const contextualResponse = hasContext && context.includes('contraception') 
        ? `I see you're continuing our discussion about contraception. ${baseResponse}` 
        : baseResponse;
      
      return {
        response: contextualResponse,
        followUpQuestions: [
          "What are the different types of contraception?",
          "How effective are condoms?",
          "What is emergency contraception?",
          "How do I choose the right method for me?"
        ]
      };
    } else if (lowerQuestion.includes('sti') || lowerQuestion.includes('std') || lowerQuestion.includes('infection')) {
      return {
        response: offlineResponses.sti,
        followUpQuestions: [
          "How do I get tested for STIs?",
          "What are the symptoms of STIs?",
          "How can I prevent STIs?",
          "What should I do if I think I have an STI?"
        ]
      };
    } else if (lowerQuestion.includes('right') || lowerQuestion.includes('choice')) {
      return {
        response: offlineResponses.rights,
        followUpQuestions: [
          "What are my reproductive rights?",
          "How do I access healthcare?",
          "What if my rights are violated?",
          "Where can I get help with rights issues?"
        ]
      };
    } else if (lowerQuestion.includes('safe') || lowerQuestion.includes('protection') || lowerQuestion.includes('condom')) {
      return {
        response: offlineResponses['safe sex'],
        followUpQuestions: [
          "How do I talk to my partner about protection?",
          "What if a condom breaks?",
          "How effective are different protection methods?",
          "What about consent and communication?"
        ]
      };
    } else if (lowerQuestion.includes('pregnant') || lowerQuestion.includes('pregnancy')) {
      return {
        response: offlineResponses.pregnancy,
        followUpQuestions: [
          "What are my options if I'm pregnant?",
          "How do I get prenatal care?",
          "What should I expect during pregnancy?",
          "Where can I get support?"
        ]
      };
    } else if (lowerQuestion.includes('partner') || lowerQuestion.includes('talk') || lowerQuestion.includes('communication')) {
      return {
        response: offlineResponses.partner,
        followUpQuestions: [
          "How do I start the conversation?",
          "What if my partner doesn't want to talk?",
          "How do I set boundaries?",
          "What if I'm being pressured?"
        ]
      };
    } else if (lowerQuestion.includes('consent')) {
      return {
        response: offlineResponses.consent,
        followUpQuestions: [
          "How do I know if someone consents?",
          "What if I'm not sure about consent?",
          "How do I say no?",
          "What if someone doesn't respect my no?"
        ]
      };
    } else if (lowerQuestion.includes('ready') && lowerQuestion.includes('sex')) {
      return {
        response: offlineResponses['ready for sex'],
        followUpQuestions: [
          "How do I know if I'm emotionally ready?",
          "What about physical readiness?",
          "How do I talk to my partner about this?",
          "What if I'm not ready but feel pressured?"
        ]
      };
    } else if (lowerQuestion.includes('healthy') && lowerQuestion.includes('relationship')) {
      return {
        response: offlineResponses['healthy relationship'],
        followUpQuestions: [
          "What are signs of an unhealthy relationship?",
          "How do I build trust?",
          "What about communication?",
          "How do I know if I should end a relationship?"
        ]
      };
    } else if (lowerQuestion.includes('peer pressure')) {
      return {
        response: offlineResponses['peer pressure'],
        followUpQuestions: [
          "How do I say no to friends?",
          "What if I lose friends by saying no?",
          "How do I support a friend being pressured?",
          "How do I build confidence to resist pressure?"
        ]
      };
    } else if (lowerQuestion.includes('menstruation') || lowerQuestion.includes('period')) {
      return {
        response: offlineResponses.menstruation,
        followUpQuestions: [
          "How do I track my menstrual cycle?",
          "What if my period is irregular?",
          "How do I manage period pain?",
          "What products are safe to use?"
        ]
      };
    } else if (lowerQuestion.includes('mental health')) {
      return {
        response: offlineResponses['mental health'],
        followUpQuestions: [
          "How do I know if I need help?",
          "What are signs of depression?",
          "How do I support a friend in crisis?",
          "Where can I get mental health support?"
        ]
      };
    } else if (lowerQuestion.includes('stress') || lowerQuestion.includes('anxiety')) {
      return {
        response: offlineResponses['stress anxiety'],
        followUpQuestions: [
          "What are healthy ways to cope with stress?",
          "How do I manage anxiety?",
          "When should I seek professional help?",
          "How do I support someone with anxiety?"
        ]
      };
    } else if (lowerQuestion.includes('depression')) {
      return {
        response: offlineResponses.depression,
        followUpQuestions: [
          "How do I know if I'm depressed?",
          "What should I do if I think I'm depressed?",
          "How do I help a friend with depression?",
          "Where can I get help for depression?"
        ]
      };
    } else if (lowerQuestion.includes('self care')) {
      return {
        response: offlineResponses['self care'],
        followUpQuestions: [
          "What are some self-care activities I can do?",
          "How do I make time for self-care?",
          "What if I feel guilty about self-care?",
          "How do I know what self-care I need?"
        ]
      };
    } else if (lowerQuestion.includes('confidence')) {
      return {
        response: offlineResponses['build confidence'],
        followUpQuestions: [
          "How do I overcome self-doubt?",
          "What if I feel insecure about my body?",
          "How do I build confidence in relationships?",
          "What if others try to bring me down?"
        ]
      };
    } else if (lowerQuestion.includes('say no') || lowerQuestion.includes('saying no')) {
      return {
        response: offlineResponses['say no'],
        followUpQuestions: [
          "How do I say no without feeling guilty?",
          "What if someone doesn't accept my no?",
          "How do I practice saying no?",
          "What if I'm afraid of the consequences?"
        ]
      };
    } else if (lowerQuestion.includes('cyberbullying')) {
      return {
        response: offlineResponses.cyberbullying,
        followUpQuestions: [
          "What should I do if I'm being cyberbullied?",
          "How do I report cyberbullying?",
          "How do I support someone being cyberbullied?",
          "How do I stay safe online?"
        ]
      };
    } else if (lowerQuestion.includes('safe online') || lowerQuestion.includes('online safety')) {
      return {
        response: offlineResponses['stay safe online'],
        followUpQuestions: [
          "How do I protect my privacy online?",
          "What about sexting and online relationships?",
          "How do I recognize online predators?",
          "What should I do if someone makes me uncomfortable online?"
        ]
      };
    } else if (lowerQuestion.includes('sexting')) {
      return {
        response: offlineResponses.sexting,
        followUpQuestions: [
          "What are the risks of sexting?",
          "What if someone pressures me to sext?",
          "What if my photos are shared without consent?",
          "How do I talk to my partner about sexting?"
        ]
      };
    } else if (lowerQuestion.includes('privacy')) {
      return {
        response: offlineResponses['protect privacy'],
        followUpQuestions: [
          "How do I keep my health information private?",
          "What about using shared devices?",
          "How do I protect my conversations?",
          "What if someone finds out I use this app?"
        ]
      };
    } else if (lowerQuestion.includes('pornography') || lowerQuestion.includes('porn')) {
      return {
        response: offlineResponses.pornography,
        followUpQuestions: [
          "How does pornography affect relationships?",
          "What if I'm addicted to pornography?",
          "How do I talk to my partner about pornography?",
          "What are healthy alternatives to pornography?"
        ]
      };
    } else if (lowerQuestion.includes('addiction')) {
      return {
        response: offlineResponses.addiction,
        followUpQuestions: [
          "How do I know if I have an addiction?",
          "What should I do if I think I'm addicted?",
          "How do I help someone with an addiction?",
          "Where can I get help for addiction?"
        ]
      };
    } else if (lowerQuestion.includes('trauma')) {
      return {
        response: offlineResponses.trauma,
        followUpQuestions: [
          "How do I know if I've experienced trauma?",
          "What should I do if I think I have trauma?",
          "How do I support someone with trauma?",
          "Where can I get help for trauma?"
        ]
      };
    } else if (lowerQuestion.includes('therapy')) {
      return {
        response: offlineResponses.therapy,
        followUpQuestions: [
          "How do I find a therapist?",
          "What if I can't afford therapy?",
          "What should I expect in therapy?",
          "How do I know if therapy is working?"
        ]
      };
    } else if (lowerQuestion.includes('self harm')) {
      return {
        response: offlineResponses['self harm'],
        followUpQuestions: [
          "What should I do if I'm self-harming?",
          "How do I help someone who's self-harming?",
          "What are alternatives to self-harm?",
          "Where can I get immediate help?"
        ]
      };
    } else if (lowerQuestion.includes('suicide prevention')) {
      return {
        response: offlineResponses['suicide prevention'],
        followUpQuestions: [
          "What are warning signs of suicide?",
          "How do I help someone who's suicidal?",
          "What should I do if I'm having suicidal thoughts?",
          "Where can I get immediate help?"
        ]
      };
    } else if (lowerQuestion.includes('suicidal')) {
      return {
        response: offlineResponses['help suicidal'],
        followUpQuestions: [
          "What should I do right now if I'm suicidal?",
          "How do I get immediate help?",
          "What if I'm afraid to tell anyone?",
          "How do I stay safe right now?"
        ]
      };
    } else if (lowerQuestion.includes('not sure') || lowerQuestion.includes('help me') || lowerQuestion.includes('what to ask')) {
      return {
        response: "That's completely okay! Many people feel unsure about what to ask when it comes to sexual and reproductive health. I'm here to help guide you. You can start with something as simple as 'I want to learn about...' or 'I'm worried about...' or even just tell me what's on your mind. There are no silly questions, and everything we discuss is completely confidential.",
        followUpQuestions: [
          "I want to learn about contraception",
          "I'm worried about my health",
          "I have questions about relationships",
          "I need help with something personal"
        ]
      };
    } else {
      return {
        response: "I understand you're asking about an important topic. While I have some general information available offline, for the most accurate and up-to-date information, I'd recommend visiting a health clinic or speaking with a healthcare provider. Is there anything specific I can help you with from my available knowledge?",
        followUpQuestions: [
          "What topics can you help me with?",
          "How do I find a healthcare provider?",
          "What if I need immediate help?",
          "How do I stay safe and healthy?"
        ]
      };
    }
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
            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/rehana`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: inputText.trim(), history, rehanaType }),
            });
            if (res.ok) {
              const data = await res.json();
              responseData = { response: data.response || '' };
            } else {
              throw new Error('API error');
            }
          } catch {
            responseData = getOfflineResponse(inputText, conversationContext);
          }
        } else {
          responseData = getOfflineResponse(inputText, conversationContext);
        }
      } else {
        responseData = getOfflineResponse(inputText, conversationContext);
      }

      if (!responseData.response) {
        responseData = getOfflineResponse(inputText, conversationContext);
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
      await saveMessages(finalMessages);
      
      // Update conversation context
      updateConversationContext(inputText, responseData.response);

    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, Rehana is having trouble responding right now. You can try again, or visit a health clinic for immediate assistance.",
        isUser: false,
        timestamp: Date.now(),
        suggestions: ['Try again', 'What topics can you help with?', 'Find a clinic near me']
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const updateConversationContext = (userMessage: string, aiResponse: string) => {
    // Update context with recent conversation topics
    const recentContext = `${userMessage.toLowerCase()} ${aiResponse.toLowerCase()}`;
    setConversationContext(prev => {
      const combined = `${prev} ${recentContext}`.trim();
      // Keep only the last 200 characters to maintain context without overwhelming
      return combined.slice(-200);
    });
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
            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/rehana`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: transcript, history, rehanaType }),
            });
            if (res.ok) {
              const data = await res.json();
              responseData = { response: data.response || '' };
            } else {
              throw new Error('API error');
            }
          } catch {
            responseData = getOfflineResponse(transcript, conversationContext);
          }
        } else {
          responseData = getOfflineResponse(transcript, conversationContext);
        }
      } else {
        responseData = getOfflineResponse(transcript, conversationContext);
      }

      if (!responseData.response) {
        responseData = getOfflineResponse(transcript, conversationContext);
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
      await saveMessages(finalMessages);
      updateConversationContext(transcript, responseData.response);
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

  // Chat history functions
  const saveConversation = () => {
    const conversation = {
      id: Date.now().toString(),
      messages: messages,
      timestamp: Date.now(),
      userProfile: userProfile
    };
    
    const savedConversations = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    savedConversations.push(conversation);
    localStorage.setItem('chatHistory', JSON.stringify(savedConversations));
    
    alert('Conversation saved successfully!');
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.isUser ? 'You' : 'AI'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteConversation = () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setMessages([]);
      setConversationContext('');
      setHasShownIntroduction(false);
      setHasChosenRehanaType(false);
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

      {/* Rehana Type Selector - shown when no messages and not yet chosen */}
      {messages.length === 0 && !hasChosenRehanaType && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center mb-6">
              <img
                src={REHANA_AVATAR_URL}
                alt="Rehana"
                className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg ring-2 ring-gray-200"
              />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Meet Rehana</h2>
              <p className="text-sm text-gray-600">Your confidential AI assistant for sexual and reproductive health. Choose how you'd like to connect.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus area</label>
                <div className="flex flex-wrap gap-2">
                  {(['general', 'contraception', 'relationships', 'emergency', 'youth'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setRehanaType((p) => ({ ...p, focus: key }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        rehanaType.focus === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rehanaTypeLabels.focus[key]}
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
                      onClick={() => setRehanaType((p) => ({ ...p, tone: key }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        rehanaType.tone === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rehanaTypeLabels.tone[key]}
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
                      onClick={() => setRehanaType((p) => ({ ...p, mode: key }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        rehanaType.mode === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rehanaTypeLabels.mode[key]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRehanaTypeContinue}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all"
              >
                Start chatting with Rehana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages - Rehana chat with header */}
      {hasChosenRehanaType && (
      <>
      {/* Rehana header - modern professional */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={REHANA_AVATAR_URL}
              alt="Rehana AI"
              className="w-11 h-11 rounded-2xl object-cover shadow-lg ring-2 ring-gray-100"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" title="Online" />
          </div>
          <div className="flex flex-col gap-0" style={{ marginTop: '-2px' }}>
            <span className="font-semibold text-gray-900 text-base leading-tight">Rehana</span>
            <span className="text-xs text-gray-500 leading-tight" style={{ marginTop: '-4px' }}>
              {rehanaTypeLabels.focus[rehanaType.focus as keyof typeof rehanaTypeLabels.focus]} · {rehanaTypeLabels.tone[rehanaType.tone as keyof typeof rehanaTypeLabels.tone]}
            </span>
          </div>
        </div>
        <button
          onClick={() => { setHasChosenRehanaType(false); setMessages([]); setHasShownIntroduction(false); }}
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
                    src={REHANA_AVATAR_URL}
                    alt="Rehana"
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
                src={REHANA_AVATAR_URL}
                alt="Rehana"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-md"
              />
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Rehana is thinking...</span>
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
                  
                  {/* Chat history */}
                  <button
                    onClick={() => {
                      setShowMiniDropdown(false);
                      setShowChatHistory(!showChatHistory);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-200"
                  >
                    <Save size={16} />
                    <span className="text-sm">Chat History</span>
                  </button>
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

      {/* Chat History Panel - Mobile Responsive */}
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
              <button
                onClick={saveConversation}
                className="w-full flex items-center space-x-2 p-2.5 sm:p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <Save size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                <span className="text-xs sm:text-sm text-blue-600 font-medium">Save Conversation</span>
              </button>
              
              <button
                onClick={exportConversation}
                className="w-full flex items-center space-x-2 p-2.5 sm:p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
              >
                <Download size={14} className="sm:w-4 sm:h-4 text-green-600" />
                <span className="text-xs sm:text-sm text-green-600 font-medium">Export Conversation</span>
              </button>
              
              <button
                onClick={deleteConversation}
                className="w-full flex items-center space-x-2 p-2.5 sm:p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Trash2 size={14} className="sm:w-4 sm:h-4 text-red-600" />
                <span className="text-xs sm:text-sm text-red-600 font-medium">Delete Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
