import React, { useState } from 'react';
import { Users, UserCheck, X } from 'lucide-react';

interface RoleStakeholderDirectoryPanelProps {
  role: string;
  stakeholders: Array<{ name: string; focus: string; contact: string }>;
}

const RoleStakeholderDirectoryPanel: React.FC<RoleStakeholderDirectoryPanelProps> = ({ role, stakeholders }) => {
  const [showAccess, setShowAccess] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Stakeholder Directory</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Cross-role directory for {role.toLowerCase()} collaboration.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stakeholders.map((stakeholder) => (
            <div key={stakeholder.name} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{stakeholder.name}</p>
              <p className="text-xs text-gray-600">{stakeholder.focus}</p>
              <p className="text-xs text-gray-500 mt-1">{stakeholder.contact}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowAccess(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 border border-amber-200 text-amber-700 rounded-lg text-sm hover:bg-amber-50 flex items-center justify-center space-x-2"
        >
          <UserCheck size={16} />
          <span>Request Access</span>
        </button>
      </div>

      {showAccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Access Request</h4>
              <button
                onClick={() => setShowAccess(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close access request"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Stakeholder name
                <input
                  type="text"
                  placeholder="Stakeholder or team"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Reason
                <textarea
                  rows={3}
                  placeholder="Why access is needed"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowAccess(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
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

export default RoleStakeholderDirectoryPanel;
