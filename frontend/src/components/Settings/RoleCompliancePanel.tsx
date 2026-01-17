import React, { useState } from 'react';
import { ClipboardCheck, ShieldCheck, X } from 'lucide-react';

interface RoleCompliancePanelProps {
  role: string;
  checklist: string[];
}

const RoleCompliancePanel: React.FC<RoleCompliancePanelProps> = ({ role, checklist }) => {
  const [showAudit, setShowAudit] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Compliance Center</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Maintain audit readiness for {role.toLowerCase()} data access and workflows.
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-xs sm:text-sm text-gray-600">
          {checklist.map((item) => (
            <li key={item} className="flex items-start space-x-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowAudit(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 flex items-center justify-center space-x-2"
        >
          <ShieldCheck size={16} />
          <span>Run Compliance Check</span>
        </button>
      </div>

      {showAudit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Compliance Check</h4>
              <button
                onClick={() => setShowAudit(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close compliance check"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm text-gray-600">
              <p>Confirm the scope for this compliance review:</p>
              <label className="block text-sm text-gray-700">
                Review window
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-700">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Quarter to date</option>
                </select>
              </label>
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                Compliance checks are logged and shared with administrators.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowAudit(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
              >
                Start Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCompliancePanel;
