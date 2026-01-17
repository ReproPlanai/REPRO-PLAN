import React, { useState } from 'react';
import { FileText, Send, X } from 'lucide-react';

interface RoleGrantReportingPanelProps {
  role: string;
  reports: Array<{ title: string; status: string; due: string }>;
}

const RoleGrantReportingPanel: React.FC<RoleGrantReportingPanelProps> = ({ role, reports }) => {
  const [showSubmit, setShowSubmit] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <FileText className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Grant Reporting</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Track reporting deadlines for {role.toLowerCase()} grants.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {reports.map((report) => (
            <div key={report.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{report.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>Due {report.due}</span>
                <span>{report.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 flex items-center justify-center space-x-2"
        >
          <Send size={16} />
          <span>Submit Report</span>
        </button>
      </div>

      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Submit Grant Report</h4>
              <button
                onClick={() => setShowSubmit(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close grant report"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Report title
                <input
                  type="text"
                  placeholder="Report name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-700"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Summary
                <textarea
                  rows={3}
                  placeholder="Summarize outcomes and spend."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-700"
                />
              </label>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowSubmit(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleGrantReportingPanel;
