import React, { useEffect, useState } from 'react';
import { Shield, Lock, CheckCircle } from 'lucide-react';

interface SecurityPreferencesProps {
  role: string;
}

type SecurityPrefs = {
  enableNda: boolean;
  enablePin: boolean;
  pin: string;
};

const SecurityPreferences: React.FC<SecurityPreferencesProps> = ({ role }) => {
  const storageKey = `repro-plan_security_prefs_${role}`;
  const [prefs, setPrefs] = useState<SecurityPrefs>({
    enableNda: false,
    enablePin: false,
    pin: ''
  });
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SecurityPrefs;
        setPrefs(parsed);
        setConfirmPin(parsed.pin);
      } catch {
        // Ignore invalid stored prefs
      }
    }
  }, [storageKey]);

  const handleSave = () => {
    setError('');
    if (prefs.enablePin) {
      if (prefs.pin.trim().length < 4) {
        setError('PIN must be at least 4 digits.');
        return;
      }
      if (prefs.pin !== confirmPin) {
        setError('PIN confirmation does not match.');
        return;
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Optional Security Setup</h3>
      </div>
      <p className="text-xs sm:text-sm text-gray-600">
        NDA and PIN are optional. Enable them only if you want extra protection on your device.
      </p>

      <div className="space-y-3">
        <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Enable NDA confirmation</span>
          </div>
          <input
            type="checkbox"
            checked={prefs.enableNda}
            onChange={(e) => setPrefs((prev) => ({ ...prev, enableNda: e.target.checked }))}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Enable PIN access</span>
          </div>
          <input
            type="checkbox"
            checked={prefs.enablePin}
            onChange={(e) =>
              setPrefs((prev) => ({
                ...prev,
                enablePin: e.target.checked,
                pin: e.target.checked ? prev.pin : ''
              }))
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>

        {prefs.enablePin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">Set PIN</label>
              <input
                type="password"
                value={prefs.pin}
                onChange={(e) => setPrefs((prev) => ({ ...prev, pin: e.target.value }))}
                placeholder="Enter PIN"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">Confirm PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm PIN"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center space-x-2"
      >
        <CheckCircle size={16} />
        <span>{saved ? 'Saved' : 'Save Preferences'}</span>
      </button>
    </div>
  );
};

export default SecurityPreferences;
