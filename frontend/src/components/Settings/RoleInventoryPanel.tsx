import React, { useState } from 'react';
import { Package, AlertTriangle, X } from 'lucide-react';

interface RoleInventoryPanelProps {
  role: string;
  items: Array<{ name: string; level: string; status: string }>;
}

const RoleInventoryPanel: React.FC<RoleInventoryPanelProps> = ({ role, items }) => {
  const [showRestock, setShowRestock] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Inventory Control</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Monitor supplies and readiness for {role.toLowerCase()} operations.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.name} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{item.level}</span>
                <span>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowRestock(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 border border-orange-200 text-orange-700 rounded-lg text-sm hover:bg-orange-50 flex items-center justify-center space-x-2"
        >
          <AlertTriangle size={16} />
          <span>Request Restock</span>
        </button>
      </div>

      {showRestock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Restock Request</h4>
              <button
                onClick={() => setShowRestock(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close restock request"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Item needed
                <input
                  type="text"
                  placeholder="Supply name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Quantity
                <input
                  type="text"
                  placeholder="Requested quantity"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Notes
                <textarea
                  rows={3}
                  placeholder="Add urgency or special handling."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowRestock(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
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

export default RoleInventoryPanel;
