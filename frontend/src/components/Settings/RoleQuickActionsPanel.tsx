import React, { useState } from 'react';
import { AlertTriangle, FileText, Send, X } from 'lucide-react';

interface RoleQuickActionsPanelProps {
  role: string;
}

const RoleQuickActionsPanel: React.FC<RoleQuickActionsPanelProps> = ({ role }) => {
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setShowBroadcast(true)}
          className="px-4 py-3 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 flex items-center justify-center space-x-2"
        >
          <Send size={16} />
          <span>Broadcast Update</span>
        </button>
        <button
          onClick={() => setShowHandoff(true)}
          className="px-4 py-3 border border-amber-200 text-amber-700 rounded-lg text-sm hover:bg-amber-50 flex items-center justify-center space-x-2"
        >
          <FileText size={16} />
          <span>Case Handoff</span>
        </button>
      </div>

      {showBroadcast && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Broadcast Update</h4>
              <button
                onClick={() => setShowBroadcast(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close broadcast update"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="text-xs text-gray-500">Role: {role}</div>
              <label className="block text-sm text-gray-700">
                Update Summary
                <input
                  type="text"
                  placeholder="Short headline for all stakeholders"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Details
                <textarea
                  rows={4}
                  placeholder="Provide critical context and next steps."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Broadcasts are delivered to partner teams with escalation priority.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowBroadcast(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
              >
                Send Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showHandoff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Case Handoff</h4>
              <button
                onClick={() => setShowHandoff(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close case handoff"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Receiving Team
                <input
                  type="text"
                  placeholder="e.g., Medical Response"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Handoff Notes
                <textarea
                  rows={4}
                  placeholder="Summarize status, risks, and required actions."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Handoffs are logged with timestamps for accountability.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowHandoff(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
              >
                Submit Handoff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleQuickActionsPanel;
