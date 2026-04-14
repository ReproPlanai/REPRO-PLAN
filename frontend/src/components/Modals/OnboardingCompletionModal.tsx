import React from 'react';
import { UserCheck, ArrowRight, X, CheckCircle2, Shield } from 'lucide-react';

interface OnboardingCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onboardingTitle?: string;
  onboardingDescription?: string;
}

const OnboardingCompletionModal: React.FC<OnboardingCompletionModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  onboardingTitle = 'Complete Your Profile',
  onboardingDescription = 'Please complete your profile information to fully access all features and ensure your account security.'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-green-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{onboardingTitle}</h3>
              <p className="text-sm text-gray-500">Complete Your Onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {onboardingDescription}
          </p>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Complete your profile to:</p>
                <ul className="space-y-1 text-green-700">
                  <li>• Access all app features</li>
                  <li>• Receive personalized support</li>
                  <li>• Ensure account security</li>
                  <li>• Connect with resources</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">It only takes 2-3 minutes</p>
                <p className="text-blue-700">Your information helps us provide better service and support.</p>
              </div>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            Remind Me Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompletionModal;
