// SMS Service for Basic Phone Users
// This service handles SMS-based interactions for users with basic phones

export interface SMSMessage {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface SMSQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SMSUser {
  phoneNumber: string;
  name?: string;
  language: 'en' | 'sw' | 'ha' | 'yo' | 'ig' | 'fr' | 'ar' | 'tw' | 'wo' | 'zu' | 'xh' | 'bassa' | 'kpelle' | 'kru' | 'vai';
  currentQuiz?: string;
  quizScore: number;
  totalQuestions: number;
  lastActivity: Date;
}

class SMSService {
  private users: Map<string, SMSUser> = new Map();
  private messages: SMSMessage[] = [];
  private quizQuestions: SMSQuizQuestion[] = [];

  constructor() {
    this.initializeQuizQuestions();
    this.loadUsers();
  }

  private initializeQuizQuestions() {
    this.quizQuestions = [
      {
        id: '1',
        question: 'What is the most effective way to prevent HIV?',
        options: ['A) Abstinence', 'B) Condoms', 'C) Both A and B', 'D) None of the above'],
        correctAnswer: 2,
        explanation: 'Both abstinence and consistent condom use are effective ways to prevent HIV transmission.'
      },
      {
        id: '2',
        question: 'At what age should girls start getting cervical cancer screening?',
        options: ['A) 18 years', 'B) 21 years', 'C) 25 years', 'D) 30 years'],
        correctAnswer: 1,
        explanation: 'Cervical cancer screening should begin at age 21 for most women.'
      },
      {
        id: '3',
        question: 'What is the recommended age for HPV vaccination?',
        options: ['A) 9-12 years', 'B) 13-15 years', 'C) 16-18 years', 'D) 19-21 years'],
        correctAnswer: 0,
        explanation: 'HPV vaccination is most effective when given between ages 9-12.'
      }
    ];
  }

  private loadUsers() {
    const saved = localStorage.getItem('sms-users');
    if (saved) {
      const userData = JSON.parse(saved);
      this.users = new Map(Object.entries(userData));
    }
  }

  private saveUsers() {
    const userData = Object.fromEntries(this.users);
    localStorage.setItem('sms-users', JSON.stringify(userData));
  }

  // Register a new SMS user
  registerUser(phoneNumber: string, language: 'en' | 'bassa' | 'kpelle' | 'kru' | 'vai' = 'en'): SMSUser {
    const user: SMSUser = {
      phoneNumber,
      language,
      quizScore: 0,
      totalQuestions: 0,
      lastActivity: new Date()
    };
    
    this.users.set(phoneNumber, user);
    this.saveUsers();
    
    // Send welcome message
    this.sendMessage(phoneNumber, this.getWelcomeMessage(language));
    
    return user;
  }

  // Send SMS message
  sendMessage(phoneNumber: string, message: string): SMSMessage {
    const smsMessage: SMSMessage = {
      id: Date.now().toString(),
      phoneNumber,
      message,
      timestamp: new Date(),
      status: 'sent' // In real implementation, this would be sent via SMS gateway
    };
    
    this.messages.push(smsMessage);
    return smsMessage;
  }

  // Process incoming SMS
  processIncomingSMS(phoneNumber: string, message: string): string {
    const user = this.users.get(phoneNumber);
    if (!user) {
      return this.getRegistrationMessage();
    }

    user.lastActivity = new Date();
    this.saveUsers();

    const command = message.trim().toUpperCase();

    switch (command) {
      case 'START':
      case 'QUIZ':
        return this.startQuiz(user);
      
      case 'HELP':
        return this.getHelpMessage(user.language);
      
      case 'STATS':
        return this.getUserStats(user);
      
      case 'CLINIC':
        return this.getClinicInfo(user.language);
      
      case 'STOP':
        return this.getStopMessage(user.language);
      
      default:
        // Check if it's a quiz answer (A, B, C, D)
        if (['A', 'B', 'C', 'D'].includes(command)) {
          return this.processQuizAnswer(user, command);
        }
        
        return this.getInvalidCommandMessage(user.language);
    }
  }

  private startQuiz(user: SMSUser): string {
    if (this.quizQuestions.length === 0) {
      return this.getErrorMessage(user.language);
    }

    const question = this.quizQuestions[0];
    user.currentQuiz = question.id;
    
    return `QUIZ: ${question.question}\n\nA) ${question.options[0]}\nB) ${question.options[1]}\nC) ${question.options[2]}\nD) ${question.options[3]}\n\nReply with A, B, C, or D`;
  }

  private processQuizAnswer(user: SMSUser, answer: string): string {
    if (!user.currentQuiz) {
      return this.getInvalidCommandMessage(user.language);
    }

    const question = this.quizQuestions.find(q => q.id === user.currentQuiz);
    if (!question) {
      return this.getErrorMessage(user.language);
    }

    const answerIndex = ['A', 'B', 'C', 'D'].indexOf(answer);
    const isCorrect = answerIndex === question.correctAnswer;
    
    user.totalQuestions++;
    if (isCorrect) {
      user.quizScore++;
    }
    
    user.currentQuiz = undefined;
    this.saveUsers();

    let response = isCorrect ? '✅ CORRECT!' : '❌ INCORRECT';
    response += `\n\nExplanation: ${question.explanation}`;
    response += `\n\nScore: ${user.quizScore}/${user.totalQuestions}`;
    response += `\n\nReply QUIZ for next question or HELP for more options`;

    return response;
  }

  private getUserStats(user: SMSUser): string {
    const percentage = user.totalQuestions > 0 ? Math.round((user.quizScore / user.totalQuestions) * 100) : 0;
    
    return `YOUR STATS:\n\nQuizzes Taken: ${user.totalQuestions}\nCorrect Answers: ${user.quizScore}\nSuccess Rate: ${percentage}%\n\nReply QUIZ for more questions`;
  }

  private getClinicInfo(language: string): string {
    // In real implementation, this would fetch from a database
    return `NEAREST CLINICS:\n\n1. Accra Health Center\n   📍: Ring Road, Accra, Ghana\n   📞: +233-24-XXX-XXXX\n\n2. Korle Bu Teaching Hospital\n   📍: Korle Bu, Accra, Ghana\n   📞: +233-24-XXX-XXXX\n\nReply CLINIC for more info`;
  }

  private getWelcomeMessage(language: string): string {
    const messages = {
      en: 'Welcome to REPRO PLAN SRHR! Reply HELP for options, QUIZ to start learning, or CLINIC for health centers.',
      bassa: 'Bɛnɛ REPRO PLAN SRHR! Reply HELP for options, QUIZ to start learning, or CLINIC for health centers.',
      kpelle: 'Kɛɛ REPRO PLAN SRHR! Reply HELP for options, QUIZ to start learning, or CLINIC for health centers.',
      kru: 'Kɛɛ REPRO PLAN SRHR! Reply HELP for options, QUIZ to start learning, or CLINIC for health centers.',
      vai: 'Kɛɛ REPRO PLAN SRHR! Reply HELP for options, QUIZ to start learning, or CLINIC for health centers.'
    };
    
    return messages[language as keyof typeof messages] || messages.en;
  }

  private getHelpMessage(language: string): string {
    const messages = {
      en: 'REPRO PLAN COMMANDS:\n\nQUIZ - Start health quiz\nSTATS - View your progress\nCLINIC - Find health centers\nHELP - Show this message\nSTOP - Unsubscribe',
      bassa: 'REPRO PLAN COMMANDS:\n\nQUIZ - Start health quiz\nSTATS - View your progress\nCLINIC - Find health centers\nHELP - Show this message\nSTOP - Unsubscribe',
      kpelle: 'REPRO PLAN COMMANDS:\n\nQUIZ - Start health quiz\nSTATS - View your progress\nCLINIC - Find health centers\nHELP - Show this message\nSTOP - Unsubscribe',
      kru: 'REPRO PLAN COMMANDS:\n\nQUIZ - Start health quiz\nSTATS - View your progress\nCLINIC - Find health centers\nHELP - Show this message\nSTOP - Unsubscribe',
      vai: 'REPRO PLAN COMMANDS:\n\nQUIZ - Start health quiz\nSTATS - View your progress\nCLINIC - Find health centers\nHELP - Show this message\nSTOP - Unsubscribe'
    };
    
    return messages[language as keyof typeof messages] || messages.en;
  }

  private getRegistrationMessage(): string {
    return 'Welcome! To use REPRO PLAN SRHR via SMS, please register at repro-plan.netlify.app or reply with your preferred language (EN, BASSA, KPELLE, KRU, VAI)';
  }

  private getStopMessage(language: string): string {
    return 'You have been unsubscribed from REPRO PLAN SRHR. Reply START to rejoin anytime.';
  }

  private getInvalidCommandMessage(language: string): string {
    return 'Invalid command. Reply HELP for available options.';
  }

  private getErrorMessage(language: string): string {
    return 'Sorry, there was an error. Please try again later.';
  }

  // Get all users (for admin purposes)
  getAllUsers(): SMSUser[] {
    return Array.from(this.users.values());
  }

  // Get user by phone number
  getUser(phoneNumber: string): SMSUser | undefined {
    return this.users.get(phoneNumber);
  }

  // Get all messages (for admin purposes)
  getAllMessages(): SMSMessage[] {
    return this.messages;
  }
}

export const smsService = new SMSService();
