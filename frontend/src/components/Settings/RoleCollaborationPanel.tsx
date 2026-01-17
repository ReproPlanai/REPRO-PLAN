import React, { useState } from 'react';
import { Users, MessageSquare, Calendar, X } from 'lucide-react';

interface RoleCollaborationPanelProps {
  role: string;
  partnerTeams: string[];
}

const RoleCollaborationPanel: React.FC<RoleCollaborationPanelProps> = ({ role, partnerTeams }) => {
  const [showBriefing, setShowBriefing] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(partnerTeams[0] || '');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Collaboration Hub</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Coordinate with partner teams and keep everyone aligned for {role.toLowerCase()} workflows.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {partnerTeams.map((team) => (
            <div key={team} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {team}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowBriefing(true)}
          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center justify-center space-x-2"
        >
          <MessageSquare size={16} />
          <span>Send Partner Briefing</span>
        </button>
        <button
          onClick={() => setShowSync(true)}
          className="flex-1 px-4 py-3 border border-indigo-200 text-indigo-700 rounded-lg text-sm hover:bg-indigo-50 flex items-center justify-center space-x-2"
        >
          <Calendar size={16} />
          <span>Schedule Sync</span>
        </button>
      </div>

      {showBriefing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Partner Briefing</h4>
              <button
                onClick={() => setShowBriefing(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close partner briefing"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Partner Team
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {partnerTeams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-gray-700">
                Briefing Notes
                <textarea
                  rows={4}
                  placeholder="Summarize the update, needed actions, and timeline."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                Briefings are logged for transparency and follow-up tracking.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowBriefing(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Send Briefing
              </button>
            </div>
          </div>
        </div>
      )}

      {showSync && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Schedule Sync</h4>
              <button
                onClick={() => setShowSync(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close schedule sync"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Meeting Focus
                <input
                  type="text"
                  placeholder="e.g., case handoff review"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-sm text-gray-700">
                  Date
                  <input
                    type="date"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Time
                  <input
                    type="time"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowSync(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Schedule Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCollaborationPanel;
