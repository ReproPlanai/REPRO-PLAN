import React, { useState } from 'react';
import { Shield, User, Phone, FileText, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { userVerificationService } from '../../utils/userVerification';

interface UserVerificationProps {
  onVerificationComplete: (isVerified: boolean) => void;
  serviceName: string;
  isEmergency?: boolean;
}

const UserVerification: React.FC<UserVerificationProps> = ({
  onVerificationComplete,
  serviceName,
  isEmergency = false
}) => {
  const [formData, setFormData] = useState({
    id: '',
    phoneNumber: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let result;
      
      if (isEmergency) {
        result = await userVerificationService.emergencyVerification(
          formData.id,
          formData.phoneNumber,
          formData.reason
        );
      } else {
        result = await userVerificationService.requestVerification(
          formData.id,
          formData.phoneNumber,
          formData.reason
        );
      }

      if (result.success) {
        setVerificationStatus('verified');
        onVerificationComplete(true);
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.message);
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onVerificationComplete(false);
  };

  if (verificationStatus === 'verified') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Complete</h3>
          <p className="text-gray-600 mb-4">
            You have been verified and can now access {serviceName}.
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
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-2" />
            ID Number
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your ID number"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+231-XXX-XXXX"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4 inline mr-2" />
            Reason for Access
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={isEmergency 
              ? "Describe your emergency situation..."
              : "Explain why you need access to this service..."
            }
          />
        </div>

        {errorMessage && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : (isEmergency ? 'Emergency Access' : 'Request Verification')}</span>
          </button>
          
          {!isEmergency && (
            <button
              type="button"
              onClick={handleSkip}
              className="btn-outline"
            >
              Skip
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Privacy Notice:</strong> Your information is encrypted and only used for verification purposes. 
          We do not store or share your personal data with third parties.
        </p>
      </div>
    </div>
  );
};

export default UserVerification;
