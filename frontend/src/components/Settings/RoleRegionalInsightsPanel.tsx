import React, { useState } from 'react';
import { MapPin, BarChart4, X } from 'lucide-react';

interface RoleRegionalInsightsPanelProps {
  role: string;
  insights: Array<{ region: string; summary: string; trend: string }>;
}

const RoleRegionalInsightsPanel: React.FC<RoleRegionalInsightsPanelProps> = ({ role, insights }) => {
  const [showInsight, setShowInsight] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Regional Insights</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track region-specific trends for {role.toLowerCase()} planning.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {insights.map((insight) => (
            <div key={insight.region} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{insight.region}</p>
              <p className="text-xs text-gray-600 mt-1">{insight.summary}</p>
              <div className="mt-1 text-xs text-blue-600">{insight.trend}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowInsight(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <BarChart4 size={16} />
          <span>Generate Insight</span>
        </button>
      </div>

      {showInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Generate Insight</h4>
              <button
                onClick={() => setShowInsight(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close insight modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Region
                <input
                  type="text"
                  placeholder="Region name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Notes
                <textarea
                  rows={3}
                  placeholder="Insight summary"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowInsight(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Save Insight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleRegionalInsightsPanel;
