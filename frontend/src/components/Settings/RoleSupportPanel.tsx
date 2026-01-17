import React, { useState } from 'react';
import { LifeBuoy, MessageCircle, X } from 'lucide-react';

interface RoleSupportPanelProps {
  role: string;
  contacts: string[];
}

const RoleSupportPanel: React.FC<RoleSupportPanelProps> = ({ role, contacts }) => {
  const [showTicket, setShowTicket] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <LifeBuoy className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Support Center</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Dedicated assistance channels for {role.toLowerCase()} teams.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <div key={contact} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {contact}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowTicket(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 flex items-center justify-center space-x-2"
        >
          <MessageCircle size={16} />
          <span>Open Support Ticket</span>
        </button>
      </div>

      {showTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Support Ticket</h4>
              <button
                onClick={() => setShowTicket(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close support ticket"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Issue title
                <input
                  type="text"
                  placeholder="Short issue summary"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Details
                <textarea
                  rows={4}
                  placeholder="Describe the issue and urgency."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowTicket(false)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSupportPanel;
