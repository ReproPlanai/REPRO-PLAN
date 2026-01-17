import React, { useState } from 'react';
import { DollarSign, FilePlus, X } from 'lucide-react';

interface RoleFundingPanelProps {
  role: string;
  grants: Array<{ name: string; amount: string; status: string }>;
}

const RoleFundingPanel: React.FC<RoleFundingPanelProps> = ({ role, grants }) => {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Funding Tracker</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track active funding and requests for {role.toLowerCase()} initiatives.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {grants.map((grant) => (
            <div key={grant.name} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{grant.name}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{grant.amount}</span>
                <span>{grant.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowRequest(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center justify-center space-x-2"
        >
          <FilePlus size={16} />
          <span>Request Funding</span>
        </button>
      </div>

      {showRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Funding Request</h4>
              <button
                onClick={() => setShowRequest(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close funding request"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Request title
                <input
                  type="text"
                  placeholder="Short summary"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Amount needed
                <input
                  type="text"
                  placeholder="e.g., $25,000"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Justification
                <textarea
                  rows={3}
                  placeholder="Describe impact and urgency."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowRequest(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleFundingPanel;
