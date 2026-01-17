import React, { useState } from 'react';
import { ClipboardList, AlertTriangle, X } from 'lucide-react';

interface RoleAuditPanelProps {
  role: string;
  recentAudits: Array<{ title: string; status: string; date: string }>;
}

const RoleAuditPanel: React.FC<RoleAuditPanelProps> = ({ role, recentAudits }) => {
  const [showIncident, setShowIncident] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-rose-50 rounded-lg">
            <ClipboardList className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Audit Logs</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Visibility into recent audits and access reviews for {role.toLowerCase()} data.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {recentAudits.map((audit) => (
            <div key={audit.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{audit.title}</p>
                <span className="text-xs text-gray-500">{audit.date}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Status: {audit.status}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowIncident(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 border border-rose-200 text-rose-700 rounded-lg text-sm hover:bg-rose-50 flex items-center justify-center space-x-2"
        >
          <AlertTriangle size={16} />
          <span>Report Incident</span>
        </button>
      </div>

      {showIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Incident Report</h4>
              <button
                onClick={() => setShowIncident(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close incident report"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Incident summary
                <input
                  type="text"
                  placeholder="Brief incident title"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Details
                <textarea
                  rows={4}
                  placeholder="Describe the incident and actions taken."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowIncident(false)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAuditPanel;
