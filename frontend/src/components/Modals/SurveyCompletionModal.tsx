import React from 'react';
import { FileText, ArrowRight, X, CheckCircle2 } from 'lucide-react';

interface SurveyCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  surveyTitle?: string;
  surveyDescription?: string;
}

const SurveyCompletionModal: React.FC<SurveyCompletionModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  surveyTitle = 'Complete Your Survey',
  surveyDescription = 'Please complete the survey to continue using the app and unlock all features.'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-indigo-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-full">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{surveyTitle}</h3>
              <p className="text-sm text-gray-500">Action Required</p>
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
            {surveyDescription}
          </p>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-indigo-800">
                <p className="font-medium mb-1">Why complete the survey?</p>
                <ul className="space-y-1 text-indigo-700">
                  <li>• Unlock personalized features</li>
                  <li>• Get tailored recommendations</li>
                  <li>• Help improve our services</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Continue to Survey
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

export default SurveyCompletionModal;
