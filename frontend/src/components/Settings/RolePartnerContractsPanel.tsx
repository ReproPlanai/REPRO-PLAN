import React, { useState } from 'react';
import { FileSignature, FileText, X } from 'lucide-react';

interface RolePartnerContractsPanelProps {
  role: string;
  contracts: Array<{ name: string; status: string; renewal: string }>;
}

const RolePartnerContractsPanel: React.FC<RolePartnerContractsPanelProps> = ({ role, contracts }) => {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FileSignature className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Partner Contracts</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track partner agreements and renewal timelines for {role.toLowerCase()} teams.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {contracts.map((contract) => (
            <div key={contract.name} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{contract.name}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{contract.status}</span>
                <span>Renew {contract.renewal}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowRequest(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center justify-center space-x-2"
        >
          <FileText size={16} />
          <span>Request Contract Update</span>
        </button>
      </div>

      {showRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Contract Update Request</h4>
              <button
                onClick={() => setShowRequest(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close contract update"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Partner name
                <input
                  type="text"
                  placeholder="Partner organization"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Update notes
                <textarea
                  rows={3}
                  placeholder="Summarize requested updates."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowRequest(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
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

export default RolePartnerContractsPanel;
