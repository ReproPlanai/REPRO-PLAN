import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  CheckCircle
} from 'lucide-react';

interface FloatingDownloadButtonProps {
  onOpenModal: () => void;
  onClose?: () => void;
}

const FloatingDownloadButton: React.FC<FloatingDownloadButtonProps> = ({
  onOpenModal,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has dismissed the button
  React.useEffect(() => {
    const dismissed = localStorage.getItem('repro-plan-floating-button-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Auto-hide after 10 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem('repro-plan-floating-button-dismissed', 'true');
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Expanded State */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 mb-4 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Get the REPRO PLAN App</h3>
                <p className="text-xs text-gray-600">Enhanced experience</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Offline access</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Push notifications</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Better security</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                onOpenModal();
                setIsExpanded(false);
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
            <button
              onClick={() => {
                setIsExpanded(false);
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-xs transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Main Button */}
      <div className="flex flex-col items-end space-y-2">
        {/* Close Button (when expanded) */}
        {isExpanded && (
          <button
            onClick={() => {
              setIsDismissed(true);
              localStorage.setItem('repro-plan-floating-button-dismissed', 'true');
              setIsExpanded(false);
              if (onClose) onClose();
            }}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            title="Don't show again"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Main Download Button */}
        {!isDismissed && (
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded) {
                // Also open modal when clicking the button
                onOpenModal();
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2 relative"
          >
            <Smartphone className="w-5 h-5" />
            {!isExpanded && (
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">App</span>
              </div>
            )}
            {/* Pulse Animation */}
            <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default FloatingDownloadButton;
