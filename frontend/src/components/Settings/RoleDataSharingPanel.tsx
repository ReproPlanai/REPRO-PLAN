import React, { useState } from 'react';
import { Share2, Send, X } from 'lucide-react';

interface RoleDataSharingPanelProps {
  role: string;
  policies: string[];
}

const RoleDataSharingPanel: React.FC<RoleDataSharingPanelProps> = ({ role, policies }) => {
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Share2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Data Sharing</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Configure secure data sharing for {role.toLowerCase()} operations.
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-xs sm:text-sm text-gray-600">
          {policies.map((policy) => (
            <li key={policy} className="flex items-start space-x-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span>{policy}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowShare(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center justify-center space-x-2"
        >
          <Send size={16} />
          <span>Share Data Pack</span>
        </button>
      </div>

      {showShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Share Data Pack</h4>
              <button
                onClick={() => setShowShare(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close data sharing"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Recipient team
                <input
                  type="text"
                  placeholder="Partner or team name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Data scope
                <textarea
                  rows={3}
                  placeholder="Describe the scope of shared data."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowShare(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                Send Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDataSharingPanel;
