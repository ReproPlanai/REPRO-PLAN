import React, { useState } from 'react';
import { MessageSquarePlus, Star, X } from 'lucide-react';

interface RoleFeedbackPanelProps {
  role: string;
  highlights: Array<{ title: string; status: string; date: string }>;
}

const RoleFeedbackPanel: React.FC<RoleFeedbackPanelProps> = ({ role, highlights }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Feedback Loop</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Capture feedback to improve {role.toLowerCase()} operations.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{item.status}</span>
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowFeedback(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 flex items-center justify-center space-x-2"
        >
          <MessageSquarePlus size={16} />
          <span>Submit Feedback</span>
        </button>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Submit Feedback</h4>
              <button
                onClick={() => setShowFeedback(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close feedback"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Feedback topic
                <input
                  type="text"
                  placeholder="Topic"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Details
                <textarea
                  rows={3}
                  placeholder="Share your feedback"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleFeedbackPanel;
