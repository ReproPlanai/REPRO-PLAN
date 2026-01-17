import React, { useState } from 'react';
import { CheckSquare, ClipboardCheck, X } from 'lucide-react';

interface RoleCaseQualityPanelProps {
  role: string;
  reviews: Array<{ title: string; status: string; reviewer: string }>;
}

const RoleCaseQualityPanel: React.FC<RoleCaseQualityPanelProps> = ({ role, reviews }) => {
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-lime-50 rounded-lg">
            <CheckSquare className="w-5 h-5 text-lime-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Case Quality Review</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track quality checks and improvements for {role.toLowerCase()} cases.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <div key={review.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{review.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{review.reviewer}</span>
                <span>{review.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowReview(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-700 flex items-center justify-center space-x-2"
        >
          <ClipboardCheck size={16} />
          <span>Start Review</span>
        </button>
      </div>

      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Quality Review</h4>
              <button
                onClick={() => setShowReview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close quality review"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Case reference
                <input
                  type="text"
                  placeholder="Case ID or title"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Findings
                <textarea
                  rows={3}
                  placeholder="Record quality observations."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowReview(false)}
                className="px-4 py-2 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCaseQualityPanel;
