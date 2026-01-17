import React, { useEffect, useState } from 'react';
import { Shield, Lock, CheckCircle, X } from 'lucide-react';

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
  const [showNdaModal, setShowNdaModal] = useState(false);

  const ndaContent = `
CONFIDENTIAL DATA ACCESS AGREEMENT

By enabling NDA confirmation, you agree to:
1. Maintain strict confidentiality of all data
2. Not share, copy, or distribute any information
3. Use data only for authorized purposes
4. Report any security breaches immediately
5. Comply with all privacy regulations

Violation of this agreement may result in:
- Immediate access revocation
- Legal action
- Termination of privileges

Your access is logged and monitored.
  `.trim();

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

  const handleNdaToggle = (checked: boolean) => {
    if (checked) {
      setShowNdaModal(true);
      return;
    }
    setPrefs((prev) => ({ ...prev, enableNda: false }));
  };

  const handleNdaAccept = () => {
    setPrefs((prev) => ({ ...prev, enableNda: true }));
    setShowNdaModal(false);
  };

  const handleNdaCancel = () => {
    setPrefs((prev) => ({ ...prev, enableNda: false }));
    setShowNdaModal(false);
  };

  return (
    <>
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
            onChange={(e) => handleNdaToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        <p className="text-xs text-gray-500">
          NDA confirmation activates only after you review and accept the terms.
        </p>

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
      {showNdaModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h4 className="text-base font-semibold text-gray-900">Review NDA Terms</h4>
            <button
              onClick={handleNdaCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              aria-label="Close NDA modal"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-5 py-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-56 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">{ndaContent}</pre>
            </div>
            <p className="mt-3 text-xs text-gray-600">
              Accepting enables NDA confirmation before accessing protected data.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 px-5 py-4 border-t border-gray-200">
            <button
              onClick={handleNdaCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleNdaAccept}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Accept & Enable NDA
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default SecurityPreferences;
