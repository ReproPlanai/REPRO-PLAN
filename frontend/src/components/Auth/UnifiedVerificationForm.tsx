import React, { useState } from 'react';
import { Shield, User, Phone, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface UnifiedVerificationFormProps {
  onVerificationComplete: (isVerified: boolean) => void;
  serviceName: string;
  isEmergency?: boolean;
  showOTP?: boolean;
  onOTPGenerated?: (otp: string) => void;
}

interface VerificationFormData {
  secureId: string;
  phoneNumber: string;
  reason: string;
  reasonForVisit: string;
  emergencyContact: string;
  agreeToTerms: boolean;
}

const UnifiedVerificationForm: React.FC<UnifiedVerificationFormProps> = ({
  onVerificationComplete,
  serviceName,
  isEmergency = false,
  showOTP = false,
  onOTPGenerated
}) => {
  const [formData, setFormData] = useState<VerificationFormData>({
    secureId: '',
    phoneNumber: '',
    reason: '',
    reasonForVisit: '',
    emergencyContact: '',
    agreeToTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Validate required fields
      if (!formData.secureId || !formData.phoneNumber || !formData.reason || !formData.emergencyContact) {
        setErrorMessage('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.agreeToTerms) {
        setErrorMessage('You must agree to the terms and conditions.');
        setIsSubmitting(false);
        return;
      }

      // Start verification process
      setVerificationStatus('pending');
      
      // Generate OTP if needed
      if (showOTP) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setOtpCode(otp);
        setShowOTPInput(true);
        onOTPGenerated?.(otp);
        setVerificationStatus('idle');
        setIsSubmitting(false);
        return;
      }

      // Submit verification request to admin for approval
      const response = await apiService.loginUser(formData.secureId) as { 
        success: boolean; 
        user?: any 
      };
      
      if (response.success) {
        // Form submitted successfully - sent to admin for approval
        setVerificationStatus('verified');
        onVerificationComplete(true);
      } else {
        setVerificationStatus('error');
        setErrorMessage('Submission failed. Please check your secure ID and try again.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      setIsSubmitting(true);
      
      // Call real API to verify OTP
      const response = await apiService.loginUser(otpCode) as { 
        success: boolean; 
        user?: any 
      };
      
      if (response.success) {
        setVerificationStatus('verified');
        onVerificationComplete(true);
      } else {
        setVerificationStatus('error');
        setErrorMessage('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Failed to verify OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onVerificationComplete(false);
  };

  // Show success state
  if (verificationStatus === 'verified') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-4 sm:p-5 max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full mb-3 sm:mb-4">
            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Submission Successful!
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Your request has been sent to admin for approval. You will be notified once approved.
          </p>
          <button
            onClick={() => onVerificationComplete(true)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 transition-all min-h-[44px]"
          >
            Continue to {serviceName}
          </button>
        </div>
      </div>
    );
  }

  // Show OTP input if OTP is required
  if (showOTPInput) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-4 sm:p-5 max-w-md mx-auto">
        <div className="text-center mb-4 sm:mb-5">
          <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full mb-3 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            OTP Verification Required
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            An OTP has been sent to your phone. Please enter it below to complete verification.
          </p>
        </div>

        <form onSubmit={handleOTPVerification} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Enter OTP Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg sm:text-xl tracking-widest"
              required
            />
          </div>

          <div className="flex space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={() => setShowOTPInput(false)}
              className="flex-1 py-2.5 px-3 sm:py-3 sm:px-4 border-2 border-gray-200 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all min-h-[44px]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="flex-1 py-2.5 px-3 sm:py-3 sm:px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-4 sm:p-5 max-w-md mx-auto">
      <div className="text-center mb-4 sm:mb-5">
        <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full mb-3 sm:mb-4">
          <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
          {isEmergency ? 'Emergency Access Required' : 'Verification Required'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {isEmergency 
            ? `Emergency access to ${serviceName} requires verification for your safety.`
            : `Access to ${serviceName} requires verification to ensure privacy and security.`
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Secure ID */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
            Secure ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="secureId"
            value={formData.secureId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter your secure ID"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
            Reason for Access <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            required
            rows={2}
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
            placeholder="Please explain why you need access to this service"
          />
        </div>

        {/* Reason for Visit (for secure locations) */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Reason for Visit
          </label>
          <select
            name="reasonForVisit"
            value={formData.reasonForVisit}
            onChange={handleInputChange}
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
          >
            <option value="">Select a reason</option>
            <option value="emergency">Emergency shelter</option>
            <option value="counseling">Counseling services</option>
            <option value="medical">Medical assistance</option>
            <option value="support">Support group</option>
            <option value="information">Information gathering</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
            Emergency Contact <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter emergency contact number"
          />
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-4 sm:h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            required
          />
          <label htmlFor="agreeToTerms" className="text-xs sm:text-sm text-gray-600 leading-tight">
            I agree to the terms and conditions and understand that this information will be used for security purposes only. <span className="text-red-500">*</span>
          </label>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-600 text-xs sm:text-sm bg-red-50 p-2.5 sm:p-3 rounded-xl border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 py-2.5 px-3 sm:py-3 sm:px-4 border-2 border-gray-200 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all min-h-[44px] text-sm sm:text-base"
          >
            Skip Verification
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-3 sm:py-3 sm:px-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px] text-sm sm:text-base"
          >
            {isSubmitting ? 'Processing...' : 'Verify & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnifiedVerificationForm;
