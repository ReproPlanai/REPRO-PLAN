import React, { useState } from 'react';
import { ShieldCheck, FileLock2, X } from 'lucide-react';

interface RoleDataGovernancePanelProps {
  role: string;
  policies: string[];
}

const RoleDataGovernancePanel: React.FC<RoleDataGovernancePanelProps> = ({ role, policies }) => {
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Data Governance</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Governance standards and retention rules for {role.toLowerCase()} data.
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-xs sm:text-sm text-gray-600">
          {policies.map((policy) => (
            <li key={policy} className="flex items-start space-x-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>{policy}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowPolicy(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 flex items-center justify-center space-x-2"
        >
          <FileLock2 size={16} />
          <span>Review Governance Policy</span>
        </button>
      </div>

      {showPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Governance Policy</h4>
              <button
                onClick={() => setShowPolicy(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close governance policy"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-600 space-y-3">
              <p>Review policy highlights for data handling, retention, and sharing controls.</p>
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                Policy updates are logged and require acknowledgement.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowPolicy(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDataGovernancePanel;
