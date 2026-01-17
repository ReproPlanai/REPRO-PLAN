import React, { useState } from 'react';
import { Users, UserPlus, X } from 'lucide-react';

interface RoleVolunteerPanelProps {
  role: string;
  volunteers: Array<{ name: string; status: string; skill: string }>;
}

const RoleVolunteerPanel: React.FC<RoleVolunteerPanelProps> = ({ role, volunteers }) => {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Volunteer Management</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track active volunteers supporting {role.toLowerCase()} initiatives.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {volunteers.map((volunteer) => (
            <div key={volunteer.name} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{volunteer.skill}</span>
                <span>{volunteer.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center justify-center space-x-2"
        >
          <UserPlus size={16} />
          <span>Invite Volunteer</span>
        </button>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Invite Volunteer</h4>
              <button
                onClick={() => setShowInvite(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close volunteer invite"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Volunteer name
                <input
                  type="text"
                  placeholder="Full name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Role or skill
                <input
                  type="text"
                  placeholder="Skill area"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleVolunteerPanel;
