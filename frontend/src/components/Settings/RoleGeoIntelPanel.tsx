import React, { useState } from 'react';
import { Globe2, Radar, X } from 'lucide-react';

interface RoleGeoIntelPanelProps {
  role: string;
  hotspots: Array<{ label: string; status: string; region: string }>;
}

const RoleGeoIntelPanel: React.FC<RoleGeoIntelPanelProps> = ({ role, hotspots }) => {
  const [showUpdate, setShowUpdate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-sky-50 rounded-lg">
            <Globe2 className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Geo Intelligence</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Monitor hotspots and trends relevant to {role.toLowerCase()} teams.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hotspots.map((spot) => (
            <div key={spot.label} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{spot.label}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{spot.region}</span>
                <span>{spot.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowUpdate(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 border border-sky-200 text-sky-700 rounded-lg text-sm hover:bg-sky-50 flex items-center justify-center space-x-2"
        >
          <Radar size={16} />
          <span>Share Geo Update</span>
        </button>
      </div>

      {showUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Geo Update</h4>
              <button
                onClick={() => setShowUpdate(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close geo update"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Location summary
                <input
                  type="text"
                  placeholder="Region / hotspot"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Observations
                <textarea
                  rows={3}
                  placeholder="Share key signals or trends."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowUpdate(false)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700"
              >
                Submit Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleGeoIntelPanel;
