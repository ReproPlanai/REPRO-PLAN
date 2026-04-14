import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastUpdated?: string;
  apiStatus: 'online' | 'degraded' | 'offline';
  onRetry?: () => void;
}

const ApiStatusModal: React.FC<ApiStatusModalProps> = ({
  isOpen,
  onClose,
  lastUpdated,
  apiStatus,
  onRetry
}) => {
  if (!isOpen) return null;

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = () => {
    switch (apiStatus) {
      case 'online': return 'All systems operational';
      case 'degraded': return 'Some services experiencing issues';
      case 'offline': return 'Database or API unavailable';
      default: return 'Status unknown';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">API Status Warning</h3>
              <p className="text-sm text-gray-500">Using cached data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-green-500' :
                apiStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="font-medium">{getStatusMessage()}</span>
            </div>
          </div>

          {lastUpdated && (
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Last Updated:</p>
              <p className="text-gray-500">
                {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">What this means:</p>
            <ul className="list-disc list-inside text-gray-500 space-y-1">
              <li>The dashboard is showing cached data</li>
              <li>Real-time data may not be available</li>
              <li>Some features may be limited</li>
            </ul>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiStatusModal;
