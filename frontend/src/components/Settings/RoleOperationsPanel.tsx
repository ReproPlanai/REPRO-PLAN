import React, { useState } from 'react';
import { ClipboardList, ShieldCheck, Sparkles, X } from 'lucide-react';

interface RoleOperationsPanelProps {
  role: string;
  title: string;
  focusAreas: string[];
  escalationTips: string[];
}

const RoleOperationsPanel: React.FC<RoleOperationsPanelProps> = ({
  role,
  title,
  focusAreas,
  escalationTips
}) => {
  const [showToolkit, setShowToolkit] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Operational playbooks and quick actions tailored for {role.toLowerCase()} workflows.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {focusAreas.map((area) => (
            <div key={area} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {area}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowToolkit(true)}
          className="mt-5 w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
        >
          Open Operations Toolkit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Escalation Checklist</h3>
        </div>
        <ul className="mt-3 space-y-2 text-xs sm:text-sm text-gray-600">
          {escalationTips.map((tip) => (
            <li key={tip} className="flex items-start space-x-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Feature Highlights</h3>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">
          Track performance metrics, coordinate cross-role updates, and keep compliance aligned with real-time alerts.
        </p>
      </div>

      {showToolkit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Operations Toolkit</h4>
              <button
                onClick={() => setShowToolkit(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close operations toolkit"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm text-gray-600">
              <p>Quick actions to keep your team aligned:</p>
              <ul className="space-y-2">
                <li>• Share a cross-role update</li>
                <li>• Log a high-priority incident</li>
                <li>• Schedule a compliance review</li>
                <li>• Generate a weekly activity summary</li>
              </ul>
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-xs text-purple-700">
                Toolkit actions are logged for transparency and audit readiness.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowToolkit(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleOperationsPanel;
