import React, { useState } from 'react';
import { TrendingUp, BarChart3, X } from 'lucide-react';

interface RoleImpactPanelProps {
  role: string;
  highlights: Array<{ label: string; value: string; change: string }>;
}

const RoleImpactPanel: React.FC<RoleImpactPanelProps> = ({ role, highlights }) => {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Impact Reporting</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track outcomes and impact metrics for {role.toLowerCase()} operations.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">{item.label}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">{item.value}</span>
                <span className="text-xs text-amber-600">{item.change}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 flex items-center justify-center space-x-2"
        >
          <BarChart3 size={16} />
          <span>Generate Impact Report</span>
        </button>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Impact Report</h4>
              <button
                onClick={() => setShowReport(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close impact report"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Reporting window
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Quarter to date</option>
                </select>
              </label>
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Reports are stored in your role-specific archive.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleImpactPanel;
