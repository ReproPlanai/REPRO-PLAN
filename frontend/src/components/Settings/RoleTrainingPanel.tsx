import React, { useState } from 'react';
import { GraduationCap, CheckCircle, BookOpen, X } from 'lucide-react';

interface RoleTrainingPanelProps {
  role: string;
  modules: Array<{ title: string; status: string; duration: string }>;
}

const RoleTrainingPanel: React.FC<RoleTrainingPanelProps> = ({ role, modules }) => {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Training Hub</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Role-based learning for {role.toLowerCase()} workflows and compliance.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((module) => (
            <div key={module.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{module.title}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                <span>{module.duration}</span>
                <span className="flex items-center space-x-1 text-emerald-600">
                  <CheckCircle size={12} />
                  <span>{module.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowRequest(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center justify-center space-x-2"
        >
          <BookOpen size={16} />
          <span>Request Training Session</span>
        </button>
      </div>

      {showRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Training Request</h4>
              <button
                onClick={() => setShowRequest(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close training request"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Training Focus
                <input
                  type="text"
                  placeholder="e.g., crisis response refresher"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Preferred Date
                <input
                  type="date"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                Training requests are shared with your admin coordinator.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowRequest(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
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

export default RoleTrainingPanel;
