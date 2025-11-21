import React, { useState } from 'react';
import { Shield, User, Phone, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

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
        return;
      }

      if (!formData.agreeToTerms) {
        setErrorMessage('You must agree to the terms and conditions.');
        return;
      }

      // Simulate verification process
      setVerificationStatus('pending');
      
      // Generate OTP if needed
      if (showOTP) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setOtpCode(otp);
        setShowOTPInput(true);
        onOTPGenerated?.(otp);
        setVerificationStatus('idle');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVerificationStatus('verified');
      onVerificationComplete(true);
      
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
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVerificationStatus('verified');
      onVerificationComplete(true);
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Invalid OTP. Please try again.');
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verification Successful!
          </h3>
          <p className="text-gray-600 mb-4">
            You can now access {serviceName}
          </p>
          <button
            onClick={() => onVerificationComplete(true)}
            className="btn-primary"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            OTP Verification Required
          </h3>
          <p className="text-gray-600">
            An OTP has been sent to your phone. Please enter it below to complete verification.
          </p>
        </div>

        <form onSubmit={handleOTPVerification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowOTPInput(false)}
              className="flex-1 btn-outline"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="flex-1 btn-primary"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isEmergency ? 'Emergency Access Required' : 'Verification Required'}
        </h3>
        <p className="text-gray-600">
          {isEmergency 
            ? `Emergency access to ${serviceName} requires verification for your safety.`
            : `Access to ${serviceName} requires verification to ensure privacy and security.`
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Secure ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Secure ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="secureId"
            value={formData.secureId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your secure ID"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Reason for Access <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please explain why you need access to this service"
          />
        </div>

        {/* Reason for Visit (for secure locations) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit
          </label>
          <select
            name="reasonForVisit"
            value={formData.reasonForVisit}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Emergency Contact <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="mt-1"
            required
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
            I agree to the terms and conditions and understand that this information will be used for security purposes only. <span className="text-red-500">*</span>
          </label>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 btn-outline"
          >
            Skip Verification
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 btn-primary"
          >
            {isSubmitting ? 'Processing...' : 'Verify & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnifiedVerificationForm;
