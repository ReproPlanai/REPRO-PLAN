import React, { useState } from 'react';
import { Map, Target, X } from 'lucide-react';

interface RoleFieldOpsPanelProps {
  role: string;
  missions: Array<{ title: string; status: string; region: string }>;
}

const RoleFieldOpsPanel: React.FC<RoleFieldOpsPanelProps> = ({ role, missions }) => {
  const [showDeploy, setShowDeploy] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Map className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Field Operations</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track field missions and deployments for {role.toLowerCase()} teams.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {missions.map((mission) => (
            <div key={mission.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{mission.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{mission.region}</span>
                <span>{mission.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowDeploy(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center justify-center space-x-2"
        >
          <Target size={16} />
          <span>Launch Deployment</span>
        </button>
      </div>

      {showDeploy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Launch Deployment</h4>
              <button
                onClick={() => setShowDeploy(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close deployment"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Mission name
                <input
                  type="text"
                  placeholder="Deployment title"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Region
                <input
                  type="text"
                  placeholder="Target region"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Objectives
                <textarea
                  rows={3}
                  placeholder="Outline key objectives."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowDeploy(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Confirm Deployment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleFieldOpsPanel;
