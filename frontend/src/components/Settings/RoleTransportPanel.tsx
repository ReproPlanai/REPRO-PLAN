import React, { useState } from 'react';
import { Truck, Navigation, X } from 'lucide-react';

interface RoleTransportPanelProps {
  role: string;
  routes: Array<{ name: string; status: string; eta: string }>;
}

const RoleTransportPanel: React.FC<RoleTransportPanelProps> = ({ role, routes }) => {
  const [showDispatch, setShowDispatch] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Truck className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transport Logistics</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Coordinate transport routes for {role.toLowerCase()} operations.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {routes.map((route) => (
            <div key={route.name} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{route.name}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{route.eta}</span>
                <span>{route.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowDispatch(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center space-x-2"
        >
          <Navigation size={16} />
          <span>Dispatch Transport</span>
        </button>
      </div>

      {showDispatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Dispatch Transport</h4>
              <button
                onClick={() => setShowDispatch(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close transport dispatch"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Route name
                <input
                  type="text"
                  placeholder="Route identifier"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Destination
                <input
                  type="text"
                  placeholder="Destination address"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowDispatch(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900"
              >
                Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleTransportPanel;
