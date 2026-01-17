import React, { useState } from 'react';
import { ShieldCheck, BellRing, X } from 'lucide-react';

interface RolePolicyUpdatesPanelProps {
  role: string;
  updates: Array<{ title: string; date: string; status: string }>;
}

const RolePolicyUpdatesPanel: React.FC<RolePolicyUpdatesPanelProps> = ({ role, updates }) => {
  const [showAck, setShowAck] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Policy Updates</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Latest policy updates for {role.toLowerCase()} stakeholders.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {updates.map((update) => (
            <div key={update.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{update.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{update.date}</span>
                <span>{update.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowAck(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <BellRing size={16} />
          <span>Acknowledge Updates</span>
        </button>
      </div>

      {showAck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Policy Acknowledgement</h4>
              <button
                onClick={() => setShowAck(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close policy acknowledgement"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-600 space-y-3">
              <p>Confirm you have reviewed the latest policies.</p>
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Acknowledgements are logged for compliance.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowAck(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
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

export default RolePolicyUpdatesPanel;
