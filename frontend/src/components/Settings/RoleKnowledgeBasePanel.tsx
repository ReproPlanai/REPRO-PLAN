import React, { useState } from 'react';
import { Book, Search, X } from 'lucide-react';

interface RoleKnowledgeBasePanelProps {
  role: string;
  articles: Array<{ title: string; category: string; updated: string }>;
}

const RoleKnowledgeBasePanel: React.FC<RoleKnowledgeBasePanelProps> = ({ role, articles }) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Book className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Knowledge Base</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Curated guidance and FAQs for {role.toLowerCase()} teams.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {articles.map((article) => (
            <div key={article.title} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{article.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                <span>{article.category}</span>
                <span>Updated {article.updated}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="mt-4 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center justify-center space-x-2"
        >
          <Search size={16} />
          <span>Search Articles</span>
        </button>
      </div>

      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">Search Knowledge Base</h4>
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close knowledge search"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="block text-sm text-gray-700">
                Search terms
                <input
                  type="text"
                  placeholder="Search by keyword"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                Search results are filtered to your role permissions.
              </div>
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowSearch(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleKnowledgeBasePanel;
