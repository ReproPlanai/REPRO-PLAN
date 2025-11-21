// SMS/USSD Integration for REPRO PLAN
// This module handles SMS and USSD interactions for offline/rural users

export interface SMSMessage {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
}

export interface USSDCode {
  code: string;
  description: string;
  action: string;
  parameters?: string[];
}

export class SMSIntegration {
  private static instance: SMSIntegration;
  private smsMessages: SMSMessage[] = [];
  private ussdCodes: USSDCode[] = [];

  constructor() {
    if (!SMSIntegration.instance) {
      SMSIntegration.instance = this;
      this.initializeUSSDCodes();
    }
    return SMSIntegration.instance;
  }

  static getInstance(): SMSIntegration {
    if (!SMSIntegration.instance) {
      SMSIntegration.instance = new SMSIntegration();
    }
    return SMSIntegration.instance;
  }

  private initializeUSSDCodes() {
    this.ussdCodes = [
      {
        code: '*123#',
        description: 'REPRO PLAN Main Menu',
        action: 'show_main_menu'
      },
      {
        code: '*123*1#',
        description: 'SRHR Information',
        action: 'show_srhr_info'
      },
      {
        code: '*123*2#',
        description: 'Find Clinics',
        action: 'find_clinics'
      },
      {
        code: '*123*3#',
        description: 'Emergency Help',
        action: 'emergency_help'
      },
      {
        code: '*123*4#',
        description: 'Health Tracker',
        action: 'health_tracker'
      },
      {
        code: '*123*5#',
        description: 'Mentorship',
        action: 'mentorship'
      }
    ];
  }

  // SMS Functions
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with SMS gateway APIs
      // like Twilio, Africa's Talking, or local telecom providers
      
      const smsMessage: SMSMessage = {
        id: Date.now().toString(),
        phoneNumber,
        message,
        timestamp: Date.now(),
        type: 'outgoing',
        status: 'sent'
      };

      this.smsMessages.push(smsMessage);
      
      // Simulate SMS sending
      console.log(`SMS sent to ${phoneNumber}: ${message}`);
      
      // In production, this would call the actual SMS API
      // await this.callSMSAPI(phoneNumber, message);
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async receiveSMS(phoneNumber: string, message: string): Promise<void> {
    const smsMessage: SMSMessage = {
      id: Date.now().toString(),
      phoneNumber,
      message,
      timestamp: Date.now(),
      type: 'incoming',
      status: 'delivered'
    };

    this.smsMessages.push(smsMessage);
    
    // Process incoming SMS
    await this.processIncomingSMS(smsMessage);
  }

  private async processIncomingSMS(sms: SMSMessage) {
    const message = sms.message.toLowerCase().trim();
    
    // Handle different SMS commands
    if (message.startsWith('help')) {
      await this.sendSMS(sms.phoneNumber, this.getHelpMessage());
    } else if (message.startsWith('info')) {
      await this.sendSMS(sms.phoneNumber, this.getSRHRInfo());
    } else if (message.startsWith('clinic')) {
      await this.sendSMS(sms.phoneNumber, this.getClinicInfo());
    } else if (message.startsWith('emergency')) {
      await this.sendSMS(sms.phoneNumber, this.getEmergencyInfo());
    } else {
      await this.sendSMS(sms.phoneNumber, this.getDefaultResponse());
    }
  }

  // USSD Functions
  async processUSSDCode(code: string, phoneNumber: string): Promise<string> {
    const ussdCode = this.ussdCodes.find(uc => uc.code === code);
    
    if (!ussdCode) {
      return this.getInvalidUSSDResponse();
    }

    switch (ussdCode.action) {
      case 'show_main_menu':
        return this.getMainMenu();
      case 'show_srhr_info':
        return this.getSRHRInfo();
      case 'find_clinics':
        return this.getClinicInfo();
      case 'emergency_help':
        return this.getEmergencyInfo();
      case 'health_tracker':
        return this.getHealthTrackerInfo();
      case 'mentorship':
        return this.getMentorshipInfo();
      default:
        return this.getDefaultResponse();
    }
  }

  // Response Templates
  private getMainMenu(): string {
    return `REPRO PLAN - SRHR Support
1. SRHR Information
2. Find Clinics
3. Emergency Help
4. Health Tracker
5. Mentorship
Reply with number or *123*X#`;
  }

  private getSRHRInfo(): string {
    return `SRHR Information:
- Contraception options
- STI prevention
- Reproductive rights
- Safe relationships
- Consent education

For specific info, text:
- "contraception" for birth control
- "sti" for STI info
- "rights" for your rights
- "consent" for consent info`;
  }

  private getClinicInfo(): string {
    return `Find Health Services:
Monrovia Health Center
Broad Street, Monrovia
+231-555-0101

Youth Friendly Services
Capitol Hill, Monrovia
+231-555-0102

GBV Support Center
Sinkor, Monrovia
+231-555-0104

Text "clinic [area]" for specific location`;
  }

  private getEmergencyInfo(): string {
    return `EMERGENCY HELP:
Police: +231-555-9999
Medical: +231-555-0300
GBV Support: +231-555-0104
Crisis Counseling: +231-555-0200

If in immediate danger, call emergency services now!`;
  }

  private getHealthTrackerInfo(): string {
    return `Health Tracker:
Track your menstrual cycle, symptoms, and health data.

Text commands:
- "track period" to log period
- "track symptoms" to log symptoms
- "view cycle" to see cycle info

Your data is private and secure.`;
  }

  private getMentorshipInfo(): string {
    return `Peer Mentorship:
Connect with trained mentors for support and guidance.

Available mentors:
- Sarah (Contraception, STI)
- Michael (Men's Health)
- Aisha (Gender Rights)

Text "mentor [topic]" to connect`;
  }

  private getHelpMessage(): string {
    return `REPRO PLAN Help:
- Text "info" for SRHR information
- Text "clinic" for health services
- Text "emergency" for emergency help
- Text "track" for health tracking
- Text "mentor" for mentorship

USSD: *123# for main menu`;
  }

  private getDefaultResponse(): string {
    return `Welcome to REPRO PLAN!
For help, text "help"
For SRHR info, text "info"
For clinics, text "clinic"
For emergency, text "emergency"
USSD: *123#`;
  }

  private getInvalidUSSDResponse(): string {
    return `Invalid code. 
Use *123# for main menu
or text "help" for assistance.`;
  }

  // Utility Functions
  getSMSHistory(): SMSMessage[] {
    return this.smsMessages;
  }

  getUSSDCodes(): USSDCode[] {
    return this.ussdCodes;
  }

  // Integration with web app
  async syncWithWebApp(): Promise<void> {
    // This would sync SMS/USSD data with the web application
    // when the user comes online
    console.log('Syncing SMS/USSD data with web app...');
  }

  // Offline message queue
  async queueOfflineMessage(phoneNumber: string, message: string): Promise<void> {
    // Queue messages to be sent when connection is restored
    const queuedMessage = {
      phoneNumber,
      message,
      timestamp: Date.now()
    };
    
    // Store in local storage for later sending
    const queue = JSON.parse(localStorage.getItem('sms_queue') || '[]');
    queue.push(queuedMessage);
    localStorage.setItem('sms_queue', JSON.stringify(queue));
  }

  async processOfflineQueue(): Promise<void> {
    // Process queued messages when connection is restored
    const queue = JSON.parse(localStorage.getItem('sms_queue') || '[]');
    
    for (const message of queue) {
      await this.sendSMS(message.phoneNumber, message.message);
    }
    
    // Clear the queue
    localStorage.removeItem('sms_queue');
  }
}

export const smsIntegration = SMSIntegration.getInstance();
