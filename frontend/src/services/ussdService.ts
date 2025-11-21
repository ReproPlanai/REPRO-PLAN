// USSD Service for Basic Phone Users
// This service handles USSD-based interactions for users with basic phones

export interface USSDMenu {
  id: string;
  title: string;
  options: USSDMenuItem[];
  parentId?: string;
}

export interface USSDMenuItem {
  id: string;
  key: string;
  label: string;
  action: 'menu' | 'action' | 'info';
  targetId?: string;
  handler?: () => string;
}

export interface USSDUser {
  phoneNumber: string;
  currentMenu: string;
  sessionId: string;
  language: 'en' | 'bassa' | 'kpelle' | 'kru' | 'vai';
  lastActivity: Date;
}

class USSDService {
  private users: Map<string, USSDUser> = new Map();
  private menus: Map<string, USSDMenu> = new Map();
  private sessions: Map<string, USSDUser> = new Map();

  constructor() {
    this.initializeMenus();
  }

  private initializeMenus() {
    // Main Menu
    const mainMenu: USSDMenu = {
      id: 'main',
      title: 'REPRO PLAN SRHR',
      options: [
        { id: '1', key: '1', label: 'Health Quiz', action: 'menu', targetId: 'quiz' },
        { id: '2', key: '2', label: 'Find Clinic', action: 'menu', targetId: 'clinic' },
        { id: '3', key: '3', label: 'Health Tips', action: 'menu', targetId: 'tips' },
        { id: '4', key: '4', label: 'Emergency', action: 'menu', targetId: 'emergency' },
        { id: '5', key: '5', label: 'Settings', action: 'menu', targetId: 'settings' },
        { id: '0', key: '0', label: 'Exit', action: 'action', handler: () => 'Thank you for using REPRO PLAN SRHR!' }
      ]
    };

    // Quiz Menu
    const quizMenu: USSDMenu = {
      id: 'quiz',
      title: 'Health Quiz',
      parentId: 'main',
      options: [
        { id: '1', key: '1', label: 'Start New Quiz', action: 'action', handler: () => this.startQuiz() },
        { id: '2', key: '2', label: 'View Progress', action: 'action', handler: () => this.getProgress() },
        { id: '0', key: '0', label: 'Back to Main', action: 'menu', targetId: 'main' }
      ]
    };

    // Clinic Menu
    const clinicMenu: USSDMenu = {
      id: 'clinic',
      title: 'Find Clinic',
      parentId: 'main',
      options: [
        { id: '1', key: '1', label: 'Nearby Clinics', action: 'action', handler: () => this.getNearbyClinics() },
        { id: '2', key: '2', label: 'Emergency Services', action: 'action', handler: () => this.getEmergencyServices() },
        { id: '0', key: '0', label: 'Back to Main', action: 'menu', targetId: 'main' }
      ]
    };

    // Health Tips Menu
    const tipsMenu: USSDMenu = {
      id: 'tips',
      title: 'Health Tips',
      parentId: 'main',
      options: [
        { id: '1', key: '1', label: 'HIV Prevention', action: 'action', handler: () => this.getHIVTips() },
        { id: '2', key: '2', label: 'Family Planning', action: 'action', handler: () => this.getFamilyPlanningTips() },
        { id: '3', key: '3', label: 'Pregnancy Care', action: 'action', handler: () => this.getPregnancyTips() },
        { id: '0', key: '0', label: 'Back to Main', action: 'menu', targetId: 'main' }
      ]
    };

    // Emergency Menu
    const emergencyMenu: USSDMenu = {
      id: 'emergency',
      title: 'Emergency Services',
      parentId: 'main',
      options: [
        { id: '1', key: '1', label: 'Call Emergency', action: 'action', handler: () => this.getEmergencyNumbers() },
        { id: '2', key: '2', label: 'Report Abuse', action: 'action', handler: () => this.getAbuseReportInfo() },
        { id: '0', key: '0', label: 'Back to Main', action: 'menu', targetId: 'main' }
      ]
    };

    // Settings Menu
    const settingsMenu: USSDMenu = {
      id: 'settings',
      title: 'Settings',
      parentId: 'main',
      options: [
        { id: '1', key: '1', label: 'Change Language', action: 'menu', targetId: 'language' },
        { id: '2', key: '2', label: 'Help', action: 'action', handler: () => this.getHelp() },
        { id: '0', key: '0', label: 'Back to Main', action: 'menu', targetId: 'main' }
      ]
    };

    // Language Menu
    const languageMenu: USSDMenu = {
      id: 'language',
      title: 'Select Language',
      parentId: 'settings',
      options: [
        { id: '1', key: '1', label: 'English', action: 'action', handler: () => this.setLanguage('en') },
        { id: '2', key: '2', label: 'Bassa', action: 'action', handler: () => this.setLanguage('bassa') },
        { id: '3', key: '3', label: 'Kpelle', action: 'action', handler: () => this.setLanguage('kpelle') },
        { id: '4', key: '4', label: 'Kru', action: 'action', handler: () => this.setLanguage('kru') },
        { id: '5', key: '5', label: 'Vai', action: 'action', handler: () => this.setLanguage('vai') },
        { id: '0', key: '0', label: 'Back to Settings', action: 'menu', targetId: 'settings' }
      ]
    };

    // Store menus
    this.menus.set('main', mainMenu);
    this.menus.set('quiz', quizMenu);
    this.menus.set('clinic', clinicMenu);
    this.menus.set('tips', tipsMenu);
    this.menus.set('emergency', emergencyMenu);
    this.menus.set('settings', settingsMenu);
    this.menus.set('language', languageMenu);
  }

  // Start a new USSD session
  startSession(phoneNumber: string, language: 'en' | 'bassa' | 'kpelle' | 'kru' | 'vai' = 'en'): string {
    const sessionId = `${phoneNumber}_${Date.now()}`;
    const user: USSDUser = {
      phoneNumber,
      currentMenu: 'main',
      sessionId,
      language,
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, user);
    return this.displayMenu('main', user);
  }

  // Process USSD input
  processInput(sessionId: string, input: string): string {
    const user = this.sessions.get(sessionId);
    if (!user) {
      return 'Session expired. Please start again.';
    }

    user.lastActivity = new Date();
    const menu = this.menus.get(user.currentMenu);
    if (!menu) {
      return 'Invalid menu. Please start again.';
    }

    const option = menu.options.find(opt => opt.key === input);
    if (!option) {
      return 'Invalid option. Please try again.\n\n' + this.displayMenu(user.currentMenu, user);
    }

    switch (option.action) {
      case 'menu':
        if (option.targetId) {
          user.currentMenu = option.targetId;
          return this.displayMenu(option.targetId, user);
        }
        break;
      
      case 'action':
        if (option.handler) {
          return option.handler();
        }
        break;
      
      case 'info':
        return this.getInfo(option.id);
    }

    return 'Invalid action. Please try again.';
  }

  // End USSD session
  endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private displayMenu(menuId: string, user: USSDUser): string {
    const menu = this.menus.get(menuId);
    if (!menu) {
      return 'Menu not found.';
    }

    let display = `${menu.title}\n\n`;
    
    menu.options.forEach(option => {
      display += `${option.key}. ${option.label}\n`;
    });

    display += '\nEnter your choice:';
    return display;
  }

  private startQuiz(): string {
    return 'Starting Health Quiz...\n\nQuestion 1: What is the most effective way to prevent HIV?\n\n1. Abstinence only\n2. Condoms only\n3. Both abstinence and condoms\n4. None of the above\n\nEnter your answer (1-4):';
  }

  private getProgress(): string {
    return 'Your Progress:\n\nQuizzes Taken: 5\nCorrect Answers: 4\nSuccess Rate: 80%\n\nPress 0 to go back.';
  }

  private getNearbyClinics(): string {
    return 'Nearby Clinics:\n\n1. Accra Health Center\n   📍: Ring Road, Accra, Ghana\n   📞: +233-24-XXX-XXXX\n\n2. Korle Bu Teaching Hospital\n   📍: Korle Bu, Accra, Ghana\n   📞: +233-24-XXX-XXXX\n\nPress 0 to go back.';
  }

  private getEmergencyServices(): string {
    return 'Emergency Services:\n\n🚨 Police: 191\n🏥 Korle Bu Hospital: +233-24-XXX-XXXX\n🚑 Ambulance: 193\n\nPress 0 to go back.';
  }

  private getHIVTips(): string {
    return 'HIV Prevention Tips:\n\n1. Use condoms consistently\n2. Get tested regularly\n3. Consider PrEP if at risk\n4. Avoid sharing needles\n\nPress 0 to go back.';
  }

  private getFamilyPlanningTips(): string {
    return 'Family Planning Options:\n\n1. Condoms\n2. Birth control pills\n3. IUD\n4. Implants\n5. Natural methods\n\nPress 0 to go back.';
  }

  private getPregnancyTips(): string {
    return 'Pregnancy Care Tips:\n\n1. Regular prenatal visits\n2. Take prenatal vitamins\n3. Avoid alcohol and smoking\n4. Eat healthy foods\n5. Get enough rest\n\nPress 0 to go back.';
  }

  private getEmergencyNumbers(): string {
    return 'Emergency Numbers:\n\n🚨 Police: 191\n🏥 Hospital: +233-24-XXX-XXXX\n🚑 Ambulance: 193\n👮 Security: +233-24-XXX-XXXX\n\nPress 0 to go back.';
  }

  private getAbuseReportInfo(): string {
    return 'Report Abuse:\n\nIf you are experiencing abuse:\n\n1. Call 911 immediately\n2. Contact a trusted friend\n3. Visit a safe location\n4. Document the incident\n\nPress 0 to go back.';
  }

  private getHelp(): string {
    return 'Help:\n\nREPRO PLAN SRHR provides:\n- Health education\n- Clinic locations\n- Emergency services\n- Anonymous support\n\nPress 0 to go back.';
  }

  private setLanguage(language: string): string {
    return `Language set to ${language}.\n\nPress 0 to go back.`;
  }

  private getInfo(infoId: string): string {
    return `Information for ${infoId}:\n\nPress 0 to go back.`;
  }

  // Get all active sessions (for admin purposes)
  getActiveSessions(): USSDUser[] {
    return Array.from(this.sessions.values());
  }

  // Get menu by ID
  getMenu(menuId: string): USSDMenu | undefined {
    return this.menus.get(menuId);
  }
}

export const ussdService = new USSDService();
