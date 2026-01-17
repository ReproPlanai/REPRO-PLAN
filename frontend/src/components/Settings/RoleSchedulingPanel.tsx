import React, { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';

interface RoleSchedulingPanelProps {
  role: string;
  upcoming: Array<{ title: string; date: string; time: string }>;
}

const RoleSchedulingPanel: React.FC<RoleSchedulingPanelProps> = ({ role, upcoming }) => {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-violet-50 rounded-lg">
            <Calendar className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Scheduling</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track upcoming events and plan schedules for {role.toLowerCase()} workflows.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {upcoming.map((item) => (
            <div key={item.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-600 mt-1">{item.date} • {item.time}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 flex items-center justify-center space-x-2"
        >
          <Clock size={16} />
          <span>Schedule New Event</span>
        </button>
      </div>

      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">New Schedule</h4>
              <button
                onClick={() => setShowSchedule(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close scheduling"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Event name
                <input
                  type="text"
                  placeholder="Event title"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-sm text-gray-700">
                  Date
                  <input
                    type="date"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Time
                  <input
                    type="time"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowSchedule(false)}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSchedulingPanel;
