import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX,
  Languages,
  Settings,
  Palette,
  Accessibility,
  Monitor,
  Smartphone,
  Tablet,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
  animations: boolean;
}

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: boolean;
}

interface LanguageSettings {
  current: string;
  available: Array<{
    code: string;
    name: string;
    native: string;
  }>;
}

interface DeviceSettings {
  type: 'desktop' | 'tablet' | 'mobile';
  orientation: 'portrait' | 'landscape';
  screenSize: string;
  pixelRatio: number;
}

interface UserExperienceManagerProps {
  onThemeChange: (theme: ThemeSettings) => void;
  onAccessibilityChange: (settings: AccessibilitySettings) => void;
  onLanguageChange: (language: string) => void;
  onDeviceChange: (device: DeviceSettings) => void;
}

const UserExperienceManager: React.FC<UserExperienceManagerProps> = ({
  onThemeChange,
  onAccessibilityChange,
  onLanguageChange,
  onDeviceChange
}) => {
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: 'auto',
    primaryColor: 'blue',
    fontSize: 'medium',
    contrast: 'normal',
    animations: true
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    reducedMotion: false,
    focusIndicators: true,
    keyboardNavigation: true,
    colorBlindSupport: false
  });

  const [language, setLanguage] = useState<LanguageSettings>({
    current: 'en',
    available: [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'fr', name: 'French', native: 'Français' },
      { code: 'es', name: 'Spanish', native: 'Español' },
      { code: 'pt', name: 'Portuguese', native: 'Português' },
      { code: 'ar', name: 'Arabic', native: 'العربية' },
      { code: 'zh', name: 'Chinese', native: '中文' }
    ]
  });

  const [device, setDevice] = useState<DeviceSettings>({
    type: 'desktop',
    orientation: 'landscape',
    screenSize: '1920x1080',
    pixelRatio: 1
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Detect device type and screen size
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      
      let deviceType: DeviceSettings['type'] = 'desktop';
      if (width < 768) deviceType = 'mobile';
      else if (width < 1024) deviceType = 'tablet';

      const newDevice: DeviceSettings = {
        type: deviceType,
        orientation: width > height ? 'landscape' : 'portrait',
        screenSize: `${width}x${height}`,
        pixelRatio
      };

      setDevice(newDevice);
      onDeviceChange(newDevice);
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, [onDeviceChange]);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dark mode
    if (theme.mode === 'dark' || (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply primary color
    root.style.setProperty('--primary-color', getColorValue(theme.primaryColor));

    // Apply font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizeMap[theme.fontSize]);

    // Apply high contrast
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    onThemeChange(theme);
  }, [theme, accessibility, onThemeChange]);

  const getColorValue = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      red: '#EF4444',
      orange: '#F59E0B',
      pink: '#EC4899',
      indigo: '#6366F1',
      teal: '#14B8A6'
    };
    return colors[color] || colors.blue;
  };

  const getDeviceIcon = (type: DeviceSettings['type']) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const handleThemeChange = (key: keyof ThemeSettings, value: any) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleAccessibilityChange = (key: keyof AccessibilitySettings, value: boolean) => {
    setAccessibility(prev => ({ ...prev, [key]: value }));
    onAccessibilityChange({ ...accessibility, [key]: value });
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(prev => ({ ...prev, current: code }));
    onLanguageChange(code);
  };

  const resetToDefaults = () => {
    setTheme({
      mode: 'auto',
      primaryColor: 'blue',
      fontSize: 'medium',
      contrast: 'normal',
      animations: true
    });
    setAccessibility({
      screenReader: false,
      highContrast: false,
      reducedMotion: false,
      focusIndicators: true,
      keyboardNavigation: true,
      colorBlindSupport: false
    });
    setZoomLevel(100);
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Palette className="w-5 h-5 text-blue-500" />
            <span>Theme & Appearance</span>
          </h3>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleThemeChange('mode', 'light')}
                className={`p-2 rounded-lg ${theme.mode === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleThemeChange('mode', 'dark')}
                className={`p-2 rounded-lg ${theme.mode === 'dark' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleThemeChange('mode', 'auto')}
                className={`p-2 rounded-lg ${theme.mode === 'auto' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-3">Primary Color</div>
            <div className="grid grid-cols-4 gap-3">
              {['blue', 'green', 'purple', 'red', 'orange', 'pink', 'indigo', 'teal'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleThemeChange('primaryColor', color)}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    theme.primaryColor === color 
                      ? 'border-gray-900 dark:border-white' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: getColorValue(color) }}
                >
                  {theme.primaryColor === color && (
                    <CheckCircle className="w-6 h-6 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="font-medium text-gray-900 dark:text-white mb-3">Font Size</div>
            <div className="flex space-x-2">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleThemeChange('fontSize', size)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    theme.fontSize === size
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Accessibility className="w-5 h-5 text-green-500" />
            <span>Accessibility</span>
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          {[
            { key: 'screenReader', label: 'Screen Reader Support', description: 'Enhanced support for screen readers' },
            { key: 'highContrast', label: 'High Contrast Mode', description: 'Increase contrast for better visibility' },
            { key: 'reducedMotion', label: 'Reduce Motion', description: 'Minimize animations and transitions' },
            { key: 'focusIndicators', label: 'Focus Indicators', description: 'Enhanced focus indicators for keyboard navigation' },
            { key: 'keyboardNavigation', label: 'Keyboard Navigation', description: 'Full keyboard navigation support' },
            { key: 'colorBlindSupport', label: 'Color Blind Support', description: 'Alternative indicators for color-blind users' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{setting.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibility[setting.key as keyof AccessibilitySettings]}
                  onChange={(e) => handleAccessibilityChange(setting.key as keyof AccessibilitySettings, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Languages className="w-5 h-5 text-purple-500" />
            <span>Language & Localization</span>
          </h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {language.available.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  language.current === lang.code
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">{lang.native}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            {getDeviceIcon(device.type)}
            <span>Device Information</span>
          </h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Device Type</div>
              <div className="font-medium text-gray-900 dark:text-white capitalize">{device.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Screen Size</div>
              <div className="font-medium text-gray-900 dark:text-white">{device.screenSize}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Orientation</div>
              <div className="font-medium text-gray-900 dark:text-white capitalize">{device.orientation}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pixel Ratio</div>
              <div className="font-medium text-gray-900 dark:text-white">{device.pixelRatio}x</div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Zoom Controls</h3>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-medium text-gray-900 dark:text-white">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Reset Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Reset to Defaults</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Restore all settings to their default values</div>
            </div>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserExperienceManager;
