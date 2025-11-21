import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Shield, ArrowRight, ChevronDown } from 'lucide-react';
import { LogoCircular } from '../../assets';
import { secretCodeManager } from '../../utils/secretCode';
import { apiService } from '../../services/api';

interface LoginFormProps {
  onLogin: (code: string) => void;
  onCreateNew: () => void;
  onForgetCode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCreateNew, onForgetCode }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStakeholderDropdown, setShowStakeholderDropdown] = useState(false);
  const [showStakeholderSection, setShowStakeholderSection] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStakeholderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hidden trigger to show stakeholder section (triple click on logo)
  const handleLogoClick = () => {
    // Simple counter for triple click detection
    if (!(window as any).logoClickCount) (window as any).logoClickCount = 0;
    (window as any).logoClickCount++;
    
    setTimeout(() => {
      if ((window as any).logoClickCount && (window as any).logoClickCount >= 3) {
        setShowStakeholderSection(true);
        (window as any).logoClickCount = 0;
      } else {
        (window as any).logoClickCount = 0;
      }
    }, 1000);
  };

  // Stakeholder roles configuration
  const stakeholderRoles = [
    { value: 'ADMIN', label: 'Administrator', icon: '👨‍💼', color: 'from-red-500 to-pink-500' },
    { value: 'POLICE', label: 'Police', icon: '👮‍♂️', color: 'from-blue-500 to-indigo-500' },
    { value: 'SAFEHOUSE', label: 'Safe House', icon: '🏠', color: 'from-green-500 to-emerald-500' },
    { value: 'MEDICAL', label: 'Medical', icon: '👩‍⚕️', color: 'from-purple-500 to-violet-500' },
    { value: 'NGO', label: 'NGO', icon: '🤝', color: 'from-orange-500 to-yellow-500' }
  ];

  const handleStakeholderLogin = (role: string) => {
    setShowStakeholderDropdown(false);
    // Redirect to stakeholder login page
    window.location.href = `/dashboard?role=${role}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Only show loading for regular users
    setIsLoading(true);

    try {
      // First check if it's a stakeholder code (starts with REPROPLAN_)
      if (code.startsWith('REPROPLAN_')) {
        setError('This is a stakeholder code. Please use the stakeholder portal.');
        setIsLoading(false);
        return;
      }

      // Validate and login regular user with backend
      const response = await apiService.loginUser(code);
      
      if (response.success) {
        // Store user data
        if (response.user) {
          secretCodeManager.storeCodeFromBackend(
            code,
            response.user.id,
            response.user.surveyLink || ''
          );
        }
        secretCodeManager.updateLastUsed();
        onLogin(code);
      } else {
        setError(response.message || 'Invalid secret code. Please try again.');
      }
    } catch (error: any) {
      // Fallback to local validation if backend is unavailable
      console.warn('Backend unavailable, using local validation:', error);
      if (secretCodeManager.validateSecretCode(code)) {
        secretCodeManager.updateLastUsed();
        onLogin(code);
      } else {
        setError(error.message || 'Invalid secret code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    // For regular user codes, remove all non-alphanumeric characters
    value = value.replace(/[^A-Z0-9]/g, '');
    
    // Allow up to 8 characters for regular user codes
    value = value.substring(0, 8);
    setCode(value);
    setError('');
  };

  const formatCodeDisplay = (value: string) => {
    // For regular user codes, add space after 4 characters
    if (value.length <= 4) return value;
    return `${value.substring(0, 4)} ${value.substring(4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 cursor-pointer hover:scale-105 transition-transform shadow-lg ring-4 ring-primary-100"
            onClick={handleLogoClick}
            title="Triple click to access stakeholder login"
          >
            <img 
              src={LogoCircular} 
              alt="REPRO PLAN Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('app.name')}
          </h1>
          <p className="text-gray-600">
            {t('auth.subtitle')}
          </p>
        </div>

        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('auth.welcome')}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('auth.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.enterCode')}
              </label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  id="code"
                  value={formatCodeDisplay(code)}
                  onChange={handleCodeChange}
                  placeholder={t('auth.codePlaceholder')}
                  className="input-field pr-20"
                  maxLength={9} // 8 chars + 1 space
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 8}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.login')}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Stakeholder Login Section - Hidden by default */}
          {showStakeholderSection && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Stakeholder Access Portal
                </p>
                
                {/* Stakeholder Login Button */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowStakeholderDropdown(!showStakeholderDropdown)}
                    className="w-full btn-outline flex items-center justify-center space-x-2"
                  >
                    <Shield size={16} />
                    <span>Select Your Role</span>
                    <ChevronDown size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {showStakeholderDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {stakeholderRoles.map((role) => (
                        <button
                          key={role.value}
                          onClick={() => handleStakeholderLogin(role.value)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <span className="text-2xl">{role.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{role.label}</p>
                            <p className="text-sm text-gray-500">Click to login</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Hide button */}
                <button
                  onClick={() => setShowStakeholderSection(false)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Hide Stakeholder Access
                </button>
              </div>
            </div>
          )}

          {/* Create Code and Forget Code Options */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div>
              <p className="text-center text-sm text-gray-600 mb-4">
                Don't have a secret code?
              </p>
              <button
                onClick={onCreateNew}
                className="w-full btn-outline"
              >
                {t('auth.create')}
              </button>
            </div>
            
            <div>
              <p className="text-center text-sm text-gray-600 mb-4">
                Forgot your secret code?
              </p>
              <button
                onClick={onForgetCode}
                className="w-full btn-outline text-primary-600 border-primary-300 hover:bg-primary-50"
              >
                Recover Code with Survey Link
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">Privacy Protected</p>
                <p className="text-blue-700">
                  Your secret code is stored locally and never shared. Your identity remains completely anonymous.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginForm;
