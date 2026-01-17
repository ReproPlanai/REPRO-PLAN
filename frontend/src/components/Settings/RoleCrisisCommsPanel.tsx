import React, { useState } from 'react';
import { Radio, Megaphone, X } from 'lucide-react';

interface RoleCrisisCommsPanelProps {
  role: string;
  bulletins: Array<{ title: string; status: string; time: string }>;
}

const RoleCrisisCommsPanel: React.FC<RoleCrisisCommsPanelProps> = ({ role, bulletins }) => {
  const [showBulletin, setShowBulletin] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-rose-50 rounded-lg">
            <Radio className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Crisis Communications</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Coordinate rapid comms for {role.toLowerCase()} stakeholders.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {bulletins.map((bulletin) => (
            <div key={bulletin.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{bulletin.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{bulletin.status}</span>
                <span>{bulletin.time}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowBulletin(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 flex items-center justify-center space-x-2"
        >
          <Megaphone size={16} />
          <span>Send Crisis Bulletin</span>
        </button>
      </div>

      {showBulletin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Crisis Bulletin</h4>
              <button
                onClick={() => setShowBulletin(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close crisis bulletin"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Bulletin title
                <input
                  type="text"
                  placeholder="Urgent update title"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Message
                <textarea
                  rows={3}
                  placeholder="Share critical instructions."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowBulletin(false)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700"
              >
                Send Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCrisisCommsPanel;
