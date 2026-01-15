import localforage from 'localforage';

// Configure localforage for offline storage
localforage.config({
  name: 'REPRO PLAN',
  storeName: 'repro-plan_data',
  description: 'REPRO PLAN offline data storage'
});

export interface OfflineData {
  id: string;
  type: 'chat' | 'tracker' | 'emergency' | 'mentorship';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorage {
  private static instance: OfflineStorage;
  private db: LocalForage;

  constructor() {
    this.db = localforage;
  }

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  // Store data offline
  async storeData(key: string, data: any): Promise<void> {
    try {
      if (Array.isArray(data)) {
        await this.db.setItem(key, data);
        return;
      }
      await this.db.setItem(key, {
        ...data,
        timestamp: Date.now(),
        synced: false
      });
    } catch (error) {
      console.error('Failed to store data offline:', error);
    }
  }

  // Retrieve data from offline storage
  async getData(key: string): Promise<any> {
    try {
      return await this.db.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  // Get all offline data
  async getAllData(): Promise<OfflineData[]> {
    try {
      const keys = await this.db.keys();
      const data: OfflineData[] = [];
      
      for (const key of keys) {
        const item = await this.db.getItem(key);
        if (item) {
          data.push(item as OfflineData);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get all data:', error);
      return [];
    }
  }

  // Remove data from offline storage
  async removeData(key: string): Promise<void> {
    try {
      await this.db.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  }

  // Clear all offline data
  async clearAll(): Promise<void> {
    try {
      await this.db.clear();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Get unsynced data
  async getUnsyncedData(): Promise<OfflineData[]> {
    try {
      const allData = await this.getAllData();
      return allData.filter(item => !item.synced);
    } catch (error) {
      console.error('Failed to get unsynced data:', error);
      return [];
    }
  }

  // Mark data as synced
  async markAsSynced(key: string): Promise<void> {
    try {
      const data = await this.getData(key);
      if (data) {
        data.synced = true;
        await this.db.setItem(key, data);
      }
    } catch (error) {
      console.error('Failed to mark data as synced:', error);
    }
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ used: number; available: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0
        };
      }
      return { used: 0, available: 0 };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0 };
    }
  }

  // Seed mock data for testing (only if missing)
  async seedMockData(): Promise<void> {
    const now = Date.now();
    const tomorrow = new Date(now + 1000 * 60 * 60 * 24).toISOString();
    const nextWeek = new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString();
    const lastWeek = new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString();

    const seeds: Record<string, any> = {
      srhr_alerts: [
        {
          id: 'alert-1',
          type: 'contraception',
          title: 'Weekly Pill Reminder',
          message: 'Time to take your weekly contraceptive.',
          phoneNumber: '+231-555-0101',
          frequency: 'weekly',
          nextReminder: nextWeek,
          isActive: true,
          lastSent: lastWeek,
          timesSent: 4
        },
        {
          id: 'alert-2',
          type: 'sti_testing',
          title: 'STI Testing Check-in',
          message: 'Schedule your routine STI screening this month.',
          phoneNumber: '+231-555-0102',
          frequency: 'monthly',
          nextReminder: nextWeek,
          isActive: true,
          timesSent: 2
        },
        {
          id: 'alert-3',
          type: 'clinic_visit',
          title: 'Clinic Visit Reminder',
          message: 'Reminder: upcoming clinic appointment tomorrow.',
          phoneNumber: '+231-555-0103',
          frequency: 'custom',
          customDays: 3,
          nextReminder: tomorrow,
          isActive: true,
          timesSent: 1
        },
        {
          id: 'alert-4',
          type: 'period_reminder',
          title: 'Period Tracker',
          message: 'Your next cycle is expected soon.',
          phoneNumber: '+231-555-0104',
          frequency: 'monthly',
          nextReminder: nextWeek,
          isActive: false,
          lastSent: lastWeek,
          timesSent: 6
        },
        {
          id: 'alert-5',
          type: 'vaccination',
          title: 'HPV Vaccination',
          message: 'Reminder: HPV vaccination follow-up due.',
          phoneNumber: '+231-555-0105',
          frequency: 'custom',
          customDays: 14,
          nextReminder: nextWeek,
          isActive: true,
          timesSent: 1
        }
      ],
      chat_history: {
        messages: [
          {
            id: 'msg-1',
            text: 'Hi! I can help you with SRHR questions and resources.',
            isUser: false,
            timestamp: now - 1000 * 60 * 10,
            followUpQuestions: [
              'Tell me about contraception options.',
              'How can I get STI testing?',
              'What are my rights?'
            ]
          },
          {
            id: 'msg-2',
            text: 'Can you tell me about contraception?',
            isUser: true,
            timestamp: now - 1000 * 60 * 8
          }
        ]
      },
      quiz_stats: [
        {
          score: 8,
          totalQuestions: 10,
          correctAnswers: 8,
          timeSpent: 120,
          category: 'Consent',
          completedAt: now - 1000 * 60 * 60 * 24
        },
        {
          score: 6,
          totalQuestions: 10,
          correctAnswers: 6,
          timeSpent: 150,
          category: 'STI Prevention',
          completedAt: now - 1000 * 60 * 60 * 12
        }
      ],
      consent_game_stats: {
        totalGames: 3,
        totalScore: 24,
        bestScore: 10,
        scenariosCompleted: 12,
        correctAnswers: 9,
        totalAnswers: 12,
        achievements: ['first_game', 'communication_master'],
        lastPlayed: new Date(now - 1000 * 60 * 60 * 6).toISOString()
      },
      cycle_data: {
        entries: [
          {
            id: 'cycle-1',
            date: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
            flow: 'medium',
            symptoms: ['cramps', 'fatigue'],
            mood: 'neutral',
            isPeriod: true
          },
          {
            id: 'cycle-2',
            date: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
            flow: 'light',
            symptoms: ['headache'],
            mood: 'anxious',
            isPeriod: true
          }
        ],
        cycleLength: 28,
        periodLength: 5,
        lastPeriod: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
        predictions: {
          nextPeriod: nextWeek,
          ovulation: new Date(now + 1000 * 60 * 60 * 24 * 10).toISOString(),
          fertileWindow: {
            start: new Date(now + 1000 * 60 * 60 * 24 * 8).toISOString(),
            end: new Date(now + 1000 * 60 * 60 * 24 * 12).toISOString()
          }
        }
      },
      mentorship_requests: [
        {
          id: 'req-1',
          mentorId: '1',
          menteeId: 'current_user',
          topic: 'Contraception options',
          message: 'Looking for guidance on safe contraceptive methods.',
          status: 'pending',
          createdAt: now - 1000 * 60 * 60 * 5
        },
        {
          id: 'req-2',
          mentorId: '2',
          menteeId: 'current_user',
          topic: 'Mental health support',
          message: 'Seeking advice on anxiety and stress management.',
          status: 'accepted',
          createdAt: now - 1000 * 60 * 60 * 24,
          scheduledAt: now + 1000 * 60 * 60 * 2,
          notes: 'Call scheduled for tomorrow.'
        }
      ],
      chat_messages: [
        {
          id: 'chat-1',
          senderId: '1',
          receiverId: 'current_user',
          message: 'Hi! I can help with contraception questions.',
          timestamp: now - 1000 * 60 * 20,
          isRead: false
        },
        {
          id: 'chat-2',
          senderId: 'current_user',
          receiverId: '1',
          message: 'Thanks! I would like to know about long-term options.',
          timestamp: now - 1000 * 60 * 15,
          isRead: true
        }
      ],
      safe_spaces: [
        {
          id: 'ss-1',
          name: 'Monrovia Crisis Center',
          type: 'crisis_center',
          address: 'Broad Street, Monrovia',
          phone: '+231-77-555-1001',
          hours: '24/7 Support',
          services: ['Crisis Counseling', 'Emergency Shelter', 'Safety Planning'],
          rating: 4.7,
          distance: 1.2,
          coordinates: { lat: 6.3103, lng: -10.8006 },
          isOpen: true,
          isAnonymous: true,
          is24Hours: true,
          languages: ['English', 'Kpelle'],
          specialFeatures: ['Anonymous Intake', 'Safe Transport'],
          description: 'Immediate crisis response and safe shelter services.',
          isVerified: true,
          lastUpdated: new Date(now - 1000 * 60 * 60 * 12).toISOString()
        },
        {
          id: 'ss-2',
          name: 'Paynesville Safe House',
          type: 'shelter',
          address: 'Paynesville, Monrovia',
          phone: '+231-77-555-1002',
          hours: 'Mon - Sun: 8:00 AM - 8:00 PM',
          services: ['Temporary Housing', 'Meals', 'Case Management'],
          rating: 4.5,
          distance: 3.4,
          coordinates: { lat: 6.2881, lng: -10.7475 },
          isOpen: true,
          isAnonymous: true,
          is24Hours: false,
          languages: ['English'],
          specialFeatures: ['Family Rooms', 'Child Care'],
          description: 'Secure housing for survivors and families.',
          isVerified: true,
          lastUpdated: new Date(now - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: 'ss-3',
          name: 'Liberia Legal Aid Desk',
          type: 'legal_aid',
          address: 'Tubman Blvd, Monrovia',
          phone: '+231-77-555-1003',
          hours: 'Mon - Fri: 9:00 AM - 5:00 PM',
          services: ['Legal Advice', 'Court Support', 'Documentation'],
          rating: 4.3,
          distance: 2.1,
          coordinates: { lat: 6.3156, lng: -10.8074 },
          isOpen: false,
          isAnonymous: false,
          is24Hours: false,
          languages: ['English', 'Bassa'],
          specialFeatures: ['Free Services', 'Confidential Intake'],
          description: 'Legal support and survivor advocacy services.',
          isVerified: true,
          lastUpdated: new Date(now - 1000 * 60 * 60 * 48).toISOString()
        }
      ],
      emergency_contacts: [
        {
          id: 'ec-1',
          name: 'Liberia National Police',
          phone: '+231-886-551-357',
          type: 'police',
          available: true
        },
        {
          id: 'ec-2',
          name: 'Ministry of Health Emergency',
          phone: '+231-886-551-356',
          type: 'medical',
          available: true
        },
        {
          id: 'ec-3',
          name: 'GBV Support Services',
          phone: '+231-886-551-358',
          type: 'gbv',
          available: true
        }
      ],
      emergency_logs: [
        {
          id: 'log-1',
          timestamp: now - 1000 * 60 * 30,
          type: 'panic_button',
          action: 'Panic button activated',
          location: { lat: 6.3103, lng: -10.8006 },
          notes: 'User requested immediate assistance'
        },
        {
          id: 'log-2',
          timestamp: now - 1000 * 60 * 120,
          type: 'medical',
          action: 'Location shared with medical services',
          location: { lat: 6.3221, lng: -10.7832 },
          notes: 'Follow-up care requested'
        }
      ],
      inclusive_services: [
        {
          id: 'inc-1',
          name: 'Rainbow Counseling Center',
          type: 'counseling',
          description: 'Inclusive counseling services for LGBTQ+ youth.',
          services: ['Mental Health', 'SRHR Counseling', 'Crisis Support'],
          contact: '+231-555-0401',
          location: 'Sinkor, Monrovia',
          hours: 'Mon - Fri: 9:00 AM - 5:00 PM',
          isAnonymous: true,
          isLGBTQFriendly: true,
          languages: ['English', 'Kpelle'],
          specialFeatures: ['Confidential Intake', 'Sliding Scale'],
          rating: 4.8,
          isVerified: true,
          website: 'https://example.org/rainbow'
        },
        {
          id: 'inc-2',
          name: 'Youth Legal Aid Clinic',
          type: 'legal',
          description: 'Legal support and rights education.',
          services: ['Legal Advice', 'Rights Training', 'Documentation Help'],
          contact: '+231-555-0402',
          location: 'Broad Street, Monrovia',
          hours: 'Mon - Thu: 10:00 AM - 4:00 PM',
          isAnonymous: false,
          isLGBTQFriendly: true,
          languages: ['English'],
          specialFeatures: ['Free Consultations'],
          rating: 4.4,
          isVerified: true
        }
      ],
      inclusive_resources: [
        {
          id: 'res-1',
          title: 'Know Your Rights',
          type: 'guide',
          content: 'A quick guide to youth rights and protections.',
          category: 'rights',
          language: 'English',
          isAgeAppropriate: true,
          tags: ['rights', 'legal', 'support']
        },
        {
          id: 'res-2',
          title: 'Healthy Relationships 101',
          type: 'article',
          content: 'Tips for building respectful relationships.',
          category: 'relationships',
          language: 'English',
          isAgeAppropriate: true,
          tags: ['relationships', 'consent']
        }
      ],
      support_groups: [
        {
          id: 'sg-1',
          name: 'Safe Space Support Circle',
          description: 'Weekly group for peer support and safety planning.',
          meetingSchedule: 'Wednesdays, 5PM-6PM',
          location: 'Community Center, Monrovia',
          isOnline: false,
          isAnonymous: true,
          ageGroup: '18-24',
          focus: ['Safety', 'Peer Support'],
          contact: '+231-555-0410',
          isActive: true
        },
        {
          id: 'sg-2',
          name: 'Wellness Online Group',
          description: 'Online support for mental wellness and resilience.',
          meetingSchedule: 'Saturdays, 7PM-8PM',
          location: 'Zoom',
          isOnline: true,
          isAnonymous: true,
          ageGroup: '25-35',
          focus: ['Mental Health', 'Coping Skills'],
          contact: 'support@example.org',
          isActive: true
        }
      ],
      srhr_stories: [
        {
          id: 'story-1',
          title: 'Finding My Voice',
          content: 'I learned to speak up about my health and safety.',
          type: 'text',
          category: 'empowerment',
          author: 'Anonymous',
          isAnonymous: true,
          tags: ['empowerment', 'health'],
          language: 'English',
          ageGroup: '18-24',
          location: 'Monrovia',
          likes: 12,
          createdAt: now - 1000 * 60 * 60 * 24 * 3
        },
        {
          id: 'story-2',
          title: 'Support Matters',
          content: 'My community helped me access the care I needed.',
          type: 'text',
          category: 'support',
          author: 'Anonymous',
          isAnonymous: true,
          tags: ['support', 'community'],
          language: 'English',
          ageGroup: '25-35',
          location: 'Paynesville',
          likes: 8,
          createdAt: now - 1000 * 60 * 60 * 24 * 5
        }
      ]
    };

    try {
      const keys = Object.keys(seeds);
      for (const key of keys) {
        const existing = await this.db.getItem(key);
        if (!existing) {
          await this.db.setItem(key, seeds[key]);
        }
      }

      const verificationKey = 'repro-plan-verification-history';
      if (!localStorage.getItem(verificationKey)) {
        localStorage.setItem(
          verificationKey,
          JSON.stringify([
            {
              id: 'vr-1',
              userCode: 'USER-ALPHA',
              timestamp: now - 1000 * 60 * 60 * 2,
              verified: true,
              role: 'POLICE',
              location: 'Monrovia',
              notes: 'Verified at checkpoint'
            },
            {
              id: 'vr-2',
              userCode: 'USER-BRAVO',
              timestamp: now - 1000 * 60 * 60 * 5,
              verified: false,
              role: 'SAFEHOUSE',
              location: 'Paynesville',
              notes: 'Invalid QR code'
            }
          ])
        );
      }
    } catch (error) {
      console.error('Failed to seed mock data:', error);
    }
  }
}

export const offlineStorage = OfflineStorage.getInstance();
