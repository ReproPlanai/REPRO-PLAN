export interface UserVerification {
  id: string;
  phoneNumber: string;
  reason: string;
  isVerified: boolean;
  verificationDate: string;
  verificationMethod: 'id_phone' | 'emergency_contact';
}

export interface VerificationRequest {
  id: string;
  phoneNumber: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

class UserVerificationService {
  private verificationRequests: VerificationRequest[] = [];
  private verifiedUsers: UserVerification[] = [];

  // Request verification for sensitive services
  async requestVerification(
    id: string,
    phoneNumber: string,
    reason: string
  ): Promise<{ success: boolean; message: string; requestId?: string }> {
    try {
      // Validate inputs
      if (!id || !phoneNumber || !reason) {
        return {
          success: false,
          message: 'Please provide ID, phone number, and reason for access'
        };
      }

      // Check if user is already verified
      const existingVerification = this.verifiedUsers.find(
        user => user.id === id && user.phoneNumber === phoneNumber
      );

      if (existingVerification && existingVerification.isVerified) {
        return {
          success: true,
          message: 'You are already verified for sensitive services'
        };
      }

      // Check for pending requests
      const pendingRequest = this.verificationRequests.find(
        req => req.id === id && req.phoneNumber === phoneNumber && req.status === 'pending'
      );

      if (pendingRequest) {
        return {
          success: false,
          message: 'You already have a pending verification request'
        };
      }

      // Create new verification request
      const requestId = Date.now().toString();
      const newRequest: VerificationRequest = {
        id,
        phoneNumber,
        reason,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      this.verificationRequests.push(newRequest);

      // In a real app, this would send to a backend for manual review
      // For demo purposes, we'll auto-approve with a delay
      setTimeout(() => {
        this.approveVerification(requestId);
      }, 2000);

      return {
        success: true,
        message: 'Verification request submitted. You will be notified when approved.',
        requestId
      };
    } catch (error) {
      console.error('Error requesting verification:', error);
      return {
        success: false,
        message: 'Failed to submit verification request. Please try again.'
      };
    }
  }

  // Approve verification (in real app, this would be done by admin)
  private approveVerification(requestId: string): void {
    const request = this.verificationRequests.find(req => req.id === requestId);
    if (!request) return;

    request.status = 'approved';

    // Add to verified users
    const verification: UserVerification = {
      id: request.id,
      phoneNumber: request.phoneNumber,
      reason: request.reason,
      isVerified: true,
      verificationDate: new Date().toISOString(),
      verificationMethod: 'id_phone'
    };

    this.verifiedUsers.push(verification);
  }

  // Check if user is verified
  isUserVerified(id: string, phoneNumber: string): boolean {
    return this.verifiedUsers.some(
      user => user.id === id && user.phoneNumber === phoneNumber && user.isVerified
    );
  }

  // Get verification status
  getVerificationStatus(id: string, phoneNumber: string): {
    isVerified: boolean;
    verificationDate?: string;
    reason?: string;
  } {
    const verification = this.verifiedUsers.find(
      user => user.id === id && user.phoneNumber === phoneNumber
    );

    if (verification && verification.isVerified) {
      return {
        isVerified: true,
        verificationDate: verification.verificationDate,
        reason: verification.reason
      };
    }

    return { isVerified: false };
  }

  // Get pending requests (for admin use)
  getPendingRequests(): VerificationRequest[] {
    return this.verificationRequests.filter(req => req.status === 'pending');
  }

  // Emergency verification (for immediate access in emergencies)
  async emergencyVerification(
    id: string,
    phoneNumber: string,
    emergencyReason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // For emergencies, we provide immediate temporary access
      const verification: UserVerification = {
        id,
        phoneNumber,
        reason: emergencyReason,
        isVerified: true,
        verificationDate: new Date().toISOString(),
        verificationMethod: 'emergency_contact'
      };

      // Remove any existing verification for this user
      this.verifiedUsers = this.verifiedUsers.filter(
        user => !(user.id === id && user.phoneNumber === phoneNumber)
      );

      this.verifiedUsers.push(verification);

      return {
        success: true,
        message: 'Emergency verification granted. Access provided for immediate assistance.'
      };
    } catch (error) {
      console.error('Error with emergency verification:', error);
      return {
        success: false,
        message: 'Failed to process emergency verification. Please contact emergency services directly.'
      };
    }
  }
}

export const userVerificationService = new UserVerificationService();
