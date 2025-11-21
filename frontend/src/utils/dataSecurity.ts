// Data Security Manager for NDA and OTP Protection
export interface DataAccessLog {
  timestamp: string;
  userRole: string;
  dataType: string;
  accessGranted: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface NDAAgreement {
  id: string;
  userRole: string;
  acceptedAt: string;
  expiresAt: string;
  terms: string[];
}

export interface OTPVerification {
  code: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

class DataSecurityManager {
  private static instance: DataSecurityManager;
  private accessLogs: DataAccessLog[] = [];
  private ndaAgreements: Map<string, NDAAgreement> = new Map();
  private otpVerifications: Map<string, OTPVerification> = new Map();

  private constructor() {}

  public static getInstance(): DataSecurityManager {
    if (!DataSecurityManager.instance) {
      DataSecurityManager.instance = new DataSecurityManager();
    }
    return DataSecurityManager.instance;
  }

  // NDA Management
  public generateNDAAgreement(userRole: string): NDAAgreement {
    const agreementId = `nda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const terms = [
      "Maintain strict confidentiality of all data",
      "Not share, copy, or distribute any information",
      "Use data only for authorized purposes",
      "Report any security breaches immediately",
      "Comply with all privacy regulations",
      "Data access is logged and monitored",
      "Violation may result in access revocation"
    ];

    const agreement: NDAAgreement = {
      id: agreementId,
      userRole,
      acceptedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      terms
    };

    this.ndaAgreements.set(agreementId, agreement);
    return agreement;
  }

  public verifyNDAAgreement(agreementId: string): boolean {
    const agreement = this.ndaAgreements.get(agreementId);
    if (!agreement) return false;

    const now = new Date();
    const expiresAt = new Date(agreement.expiresAt);
    
    return now < expiresAt;
  }

  // OTP Management
  public generateOTP(userRole: string, phoneNumber: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const verification: OTPVerification = {
      code,
      expiresAt,
      attempts: 0,
      maxAttempts: 3
    };

    const key = `${userRole}_${phoneNumber}`;
    this.otpVerifications.set(key, verification);

    // In production, this would send actual SMS
    console.log(`OTP for ${userRole}: ${code} (expires in 5 minutes)`);
    
    return code;
  }

  public verifyOTP(userRole: string, phoneNumber: string, inputCode: string): boolean {
    const key = `${userRole}_${phoneNumber}`;
    const verification = this.otpVerifications.get(key);

    if (!verification) return false;

    // Check if expired
    if (Date.now() > verification.expiresAt) {
      this.otpVerifications.delete(key);
      return false;
    }

    // Check attempts
    if (verification.attempts >= verification.maxAttempts) {
      this.otpVerifications.delete(key);
      return false;
    }

    // Increment attempts
    verification.attempts++;

    if (verification.code === inputCode) {
      this.otpVerifications.delete(key);
      return true;
    }

    return false;
  }

  // Data Access Logging
  public logDataAccess(log: DataAccessLog): void {
    this.accessLogs.push({
      ...log,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    });

    // Keep only last 1000 logs
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000);
    }
  }

  public getAccessLogs(userRole: string): DataAccessLog[] {
    if (userRole === 'ADMIN') {
      return this.accessLogs;
    }
    return this.accessLogs.filter(log => log.userRole === userRole);
  }

  // Security Checks
  public canAccessData(userRole: string, dataType: string): boolean {
    // Admin has full access
    if (userRole === 'ADMIN') return true;

    // Role-based data access
    const rolePermissions = {
      'POLICE': ['emergency_data', 'case_data', 'response_metrics'],
      'SAFEHOUSE': ['resident_data', 'security_data', 'capacity_metrics'],
      'MEDICAL': ['patient_data', 'medical_data', 'health_metrics'],
      'NGO': ['program_data', 'beneficiary_data', 'impact_metrics']
    };

    const allowedDataTypes = rolePermissions[userRole as keyof typeof rolePermissions] || [];
    return allowedDataTypes.includes(dataType);
  }

  public isDataSensitive(dataType: string): boolean {
    const sensitiveDataTypes = [
      'personal_data',
      'medical_records',
      'emergency_data',
      'security_data',
      'financial_data'
    ];
    return sensitiveDataTypes.includes(dataType);
  }

  // Utility Methods
  private getClientIP(): string {
    // In production, this would get the actual client IP
    return '127.0.0.1';
  }

  public getSecurityStatus(userRole: string): {
    hasActiveNDA: boolean;
    canAccessSensitiveData: boolean;
    recentAccessCount: number;
    lastAccessTime?: string;
  } {
    const recentLogs = this.accessLogs
      .filter(log => log.userRole === userRole)
      .slice(-10);

    const lastAccess = recentLogs[recentLogs.length - 1];

    return {
      hasActiveNDA: this.ndaAgreements.size > 0,
      canAccessSensitiveData: userRole === 'ADMIN',
      recentAccessCount: recentLogs.length,
      lastAccessTime: lastAccess?.timestamp
    };
  }

  // Data Encryption (Basic implementation)
  public encryptSensitiveData(data: any): string {
    // In production, use proper encryption
    return btoa(JSON.stringify(data));
  }

  public decryptSensitiveData(encryptedData: string): any {
    // In production, use proper decryption
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return null;
    }
  }
}

export const dataSecurityManager = DataSecurityManager.getInstance();
