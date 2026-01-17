import React, { useState } from 'react';
import { BookOpen, Download, X } from 'lucide-react';

interface RoleResourcesPanelProps {
  role: string;
  resources: Array<{ title: string; type: string; updated: string }>;
}

const RoleResourcesPanel: React.FC<RoleResourcesPanelProps> = ({ role, resources }) => {
  const [showBundle, setShowBundle] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Resource Library</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Reference guides and templates curated for {role.toLowerCase()} teams.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map((resource) => (
            <div key={resource.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{resource.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{resource.type}</span>
                <span>Updated {resource.updated}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowBundle(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Download size={16} />
          <span>Download Resource Bundle</span>
        </button>
      </div>

      {showBundle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Download Bundle</h4>
              <button
                onClick={() => setShowBundle(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close resource bundle"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-600 space-y-3">
              <p>The bundle includes guides, templates, and quick reference sheets.</p>
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Downloads are tracked for audit and version control.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowBundle(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Start Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleResourcesPanel;
