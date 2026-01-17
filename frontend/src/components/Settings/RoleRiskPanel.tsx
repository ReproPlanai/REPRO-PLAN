import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';

interface RoleRiskPanelProps {
  role: string;
  risks: Array<{ label: string; level: string; region: string }>;
}

const RoleRiskPanel: React.FC<RoleRiskPanelProps> = ({ role, risks }) => {
  const [showMitigation, setShowMitigation] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Risk Intelligence</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Monitor priority risks and mitigation plans for {role.toLowerCase()} teams.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {risks.map((risk) => (
            <div key={risk.label} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{risk.label}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{risk.region}</span>
                <span>{risk.level}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowMitigation(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center justify-center space-x-2"
        >
          <ShieldAlert size={16} />
          <span>Log Mitigation Plan</span>
        </button>
      </div>

      {showMitigation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Mitigation Plan</h4>
              <button
                onClick={() => setShowMitigation(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close mitigation plan"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Risk summary
                <input
                  type="text"
                  placeholder="Risk label"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Mitigation steps
                <textarea
                  rows={3}
                  placeholder="Outline mitigation plan."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowMitigation(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleRiskPanel;
