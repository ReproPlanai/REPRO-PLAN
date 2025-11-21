import React, { useState } from 'react';
import { 
  Settings, 
  Eye, 
  MousePointer, 
  Volume2, 
  Smartphone, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetToDefaults } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'visual' | 'motor' | 'cognitive' | 'hearing' | 'rural'>('visual');

  if (!isOpen) return null;

  const tabs = [
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'motor', label: 'Motor', icon: MousePointer },
    { id: 'cognitive', label: 'Cognitive', icon: Settings },
    { id: 'hearing', label: 'Hearing', icon: Volume2 },
    { id: 'rural', label: 'Rural/Basic', icon: Smartphone },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Accessibility Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close accessibility settings"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'visual' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Visual Accessibility</h3>
              
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['normal', 'large', 'extra-large', 'huge'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`p-3 rounded-lg border text-sm ${
                        settings.fontSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size === 'normal' && 'Normal (16px)'}
                      {size === 'large' && 'Large (20px)'}
                      {size === 'extra-large' && 'Extra Large (24px)'}
                      {size === 'huge' && 'Huge (32px)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">High Contrast Mode</label>
                  <p className="text-xs text-gray-500">Increases contrast for better visibility</p>
                </div>
                <button
                  onClick={() => updateSetting('highContrast', !settings.highContrast)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Color Blind Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Blind Support
                </label>
                <select
                  value={settings.colorBlindMode}
                  onChange={(e) => updateSetting('colorBlindMode', e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-blind)</option>
                </select>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Reduce Motion</label>
                  <p className="text-xs text-gray-500">Minimizes animations and transitions</p>
                </div>
                <button
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'motor' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Motor Accessibility</h3>
              
              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Keyboard Navigation</label>
                  <p className="text-xs text-gray-500">Navigate using Tab, Enter, and arrow keys</p>
                </div>
                <button
                  onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Voice Commands */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Voice Commands</label>
                  <p className="text-xs text-gray-500">Control the app using voice commands</p>
                </div>
                <button
                  onClick={() => updateSetting('voiceCommands', !settings.voiceCommands)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.voiceCommands ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.voiceCommands ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Large Touch Targets */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Large Touch Targets</label>
                  <p className="text-xs text-gray-500">Makes buttons and links easier to tap</p>
                </div>
                <button
                  onClick={() => updateSetting('largeTouchTargets', !settings.largeTouchTargets)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.largeTouchTargets ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.largeTouchTargets ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cognitive' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Cognitive Accessibility</h3>
              
              {/* Simple Language */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Simple Language</label>
                  <p className="text-xs text-gray-500">Uses plain, easy-to-understand language</p>
                </div>
                <button
                  onClick={() => updateSetting('simpleLanguage', !settings.simpleLanguage)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.simpleLanguage ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.simpleLanguage ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Show Progress */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Show Progress</label>
                  <p className="text-xs text-gray-500">Always show progress indicators</p>
                </div>
                <button
                  onClick={() => updateSetting('showProgress', !settings.showProgress)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showProgress ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showProgress ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Confirm Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Confirm Actions</label>
                  <p className="text-xs text-gray-500">Ask for confirmation before important actions</p>
                </div>
                <button
                  onClick={() => updateSetting('confirmActions', !settings.confirmActions)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.confirmActions ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.confirmActions ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'hearing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Hearing Accessibility</h3>
              
              {/* Visual Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Visual Alerts</label>
                  <p className="text-xs text-gray-500">Flash notifications for audio cues</p>
                </div>
                <button
                  onClick={() => updateSetting('visualAlerts', !settings.visualAlerts)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.visualAlerts ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.visualAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Captions */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Captions</label>
                  <p className="text-xs text-gray-500">Show captions for all videos</p>
                </div>
                <button
                  onClick={() => updateSetting('captions', !settings.captions)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.captions ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.captions ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rural' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Rural & Basic Phone Features</h3>
              
              {/* SMS Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Mode</label>
                  <p className="text-xs text-gray-500">Text-based interface for basic phones</p>
                </div>
                <button
                  onClick={() => updateSetting('smsMode', !settings.smsMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.smsMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.smsMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Offline Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Offline Mode</label>
                  <p className="text-xs text-gray-500">Works without internet connection</p>
                </div>
                <button
                  onClick={() => updateSetting('offlineMode', !settings.offlineMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.offlineMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.offlineMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Low Bandwidth */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Low Bandwidth Mode</label>
                  <p className="text-xs text-gray-500">Minimizes data usage</p>
                </div>
                <button
                  onClick={() => updateSetting('lowBandwidth', !settings.lowBandwidth)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.lowBandwidth ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.lowBandwidth ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* USSD Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">USSD Mode</label>
                  <p className="text-xs text-gray-500">Menu-based interface like *123#</p>
                </div>
                <button
                  onClick={() => updateSetting('ussdMode', !settings.ussdMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.ussdMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.ussdMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={resetToDefaults}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <RotateCcw size={16} />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Check size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;
