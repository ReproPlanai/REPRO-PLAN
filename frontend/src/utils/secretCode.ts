// import { v4 as uuidv4 } from 'uuid';

export interface SecretCode {
  code: string;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
}

export interface UserDemographics {
  gender: string;
  ageRange: string;
  county: string;
  education: string;
  relationshipStatus: string;
  primaryLanguage: string;
  hasChildren: string;
  srhrExperience: string;
}

export class SecretCodeManager {
  private static instance: SecretCodeManager;
  private storageKey = 'repro-plan_secret_code';

  constructor() {
    if (!SecretCodeManager.instance) {
      SecretCodeManager.instance = this;
    }
    return SecretCodeManager.instance;
  }

  static getInstance(): SecretCodeManager {
    if (!SecretCodeManager.instance) {
      SecretCodeManager.instance = new SecretCodeManager();
    }
    return SecretCodeManager.instance;
  }

  // Generate a new secret code
  generateSecretCode(): string {
    // Create a user-friendly code format: 4 letters + 4 numbers
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude confusing letters
    const numbers = '23456789'; // Exclude 0, 1, O, I
    
    let code = '';
    
    // Add 4 random letters
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Add 4 random numbers
    for (let i = 0; i < 4; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  }

  // Create and store a new secret code
  createSecretCode(): SecretCode {
    const code = this.generateSecretCode();
    const secretCode: SecretCode = {
      code,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true
    };

    // Store in localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(secretCode));
    
    return secretCode;
  }

  // Create secret code from backend response
  createSecretCodeFromBackend(code: string): SecretCode {
    const secretCode: SecretCode = {
      code,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true
    };

    // Store in localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(secretCode));
    
    return secretCode;
  }

  // Get existing secret code
  getSecretCode(): SecretCode | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const secretCode = JSON.parse(stored) as SecretCode;
        return secretCode;
      }
    } catch (error) {
      console.error('Failed to get secret code:', error);
    }
    return null;
  }

  // Validate secret code
  validateSecretCode(inputCode: string): boolean {
    const storedCode = this.getSecretCode();
    if (!storedCode) {
      return false;
    }

    // Normalize input (remove spaces, convert to uppercase)
    const normalizedInput = inputCode.replace(/\s/g, '').toUpperCase();
    const normalizedStored = storedCode.code.toUpperCase();

    return normalizedInput === normalizedStored;
  }

  // Update last used timestamp
  updateLastUsed(): void {
    const secretCode = this.getSecretCode();
    if (secretCode) {
      secretCode.lastUsed = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify(secretCode));
    }
  }

  // Deactivate secret code
  deactivateSecretCode(): void {
    const secretCode = this.getSecretCode();
    if (secretCode) {
      secretCode.isActive = false;
      localStorage.setItem(this.storageKey, JSON.stringify(secretCode));
    }
  }

  // Delete secret code
  deleteSecretCode(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Check if user has a valid secret code
  hasValidSecretCode(): boolean {
    const secretCode = this.getSecretCode();
    return secretCode !== null && secretCode.isActive;
  }

  // Get code display format (with spaces for readability)
  getDisplayCode(code: string): string {
    return code.replace(/(.{4})(.{4})/, '$1 $2');
  }

  // Generate backup codes (for recovery)
  generateBackupCodes(count: number = 3): string[] {
    const backupCodes: string[] = [];
    for (let i = 0; i < count; i++) {
      backupCodes.push(this.generateSecretCode());
    }
    return backupCodes;
  }

  // Store backup codes
  storeBackupCodes(codes: string[]): void {
    localStorage.setItem('repro-plan_backup_codes', JSON.stringify({
      codes,
      createdAt: Date.now()
    }));
  }

  // Get backup codes
  getBackupCodes(): string[] | null {
    try {
      const stored = localStorage.getItem('repro-plan_backup_codes');
      if (stored) {
        const data = JSON.parse(stored);
        return data.codes;
      }
    } catch (error) {
      console.error('Failed to get backup codes:', error);
    }
    return null;
  }

  // Validate backup code
  validateBackupCode(inputCode: string): boolean {
    const backupCodes = this.getBackupCodes();
    if (!backupCodes) {
      return false;
    }

    const normalizedInput = inputCode.replace(/\s/g, '').toUpperCase();
    return backupCodes.some(code => code.toUpperCase() === normalizedInput);
  }

  // Get code strength indicator
  getCodeStrength(code: string): 'weak' | 'medium' | 'strong' {
    if (code.length < 8) return 'weak';
    
    const hasLetters = /[A-Z]/.test(code);
    const hasNumbers = /[0-9]/.test(code);
    const hasVariety = /[A-Z]/.test(code) && /[0-9]/.test(code);
    
    if (hasVariety && code.length >= 8) return 'strong';
    if (hasLetters || hasNumbers) return 'medium';
    return 'weak';
  }

  // Store user demographics (for analytics)
  storeUserDemographics(demographics: UserDemographics): void {
    try {
      localStorage.setItem('repro-plan_user_demographics', JSON.stringify({
        ...demographics,
        createdAt: Date.now()
      }));
    } catch (error) {
      console.error('Failed to store user demographics:', error);
    }
  }

  // Get user demographics
  getUserDemographics(): UserDemographics | null {
    try {
      const stored = localStorage.getItem('repro-plan_user_demographics');
      if (stored) {
        const data = JSON.parse(stored);
        return data;
      }
    } catch (error) {
      console.error('Failed to get user demographics:', error);
    }
    return null;
  }

  // Clear user demographics
  clearUserDemographics(): void {
    localStorage.removeItem('repro-plan_user_demographics');
  }
}

export const secretCodeManager = SecretCodeManager.getInstance();
