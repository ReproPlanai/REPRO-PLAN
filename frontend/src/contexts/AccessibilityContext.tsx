import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface AccessibilitySettings {
  // Visual Accessibility
  fontSize: 'normal' | 'large' | 'extra-large' | 'huge';
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
  
  // Motor Accessibility
  keyboardNavigation: boolean;
  voiceCommands: boolean;
  largeTouchTargets: boolean;
  
  // Cognitive Accessibility
  simpleLanguage: boolean;
  showProgress: boolean;
  confirmActions: boolean;
  
  // Hearing Accessibility
  visualAlerts: boolean;
  captions: boolean;
  
  // Rural/Basic Phone Features
  smsMode: boolean;
  offlineMode: boolean;
  lowBandwidth: boolean;
  ussdMode: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => void;
  resetToDefaults: () => void;
  applyAccessibilityStyles: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  colorBlindMode: 'none',
  reducedMotion: false,
  keyboardNavigation: false,
  voiceCommands: false,
  largeTouchTargets: false,
  simpleLanguage: false,
  showProgress: true,
  confirmActions: false,
  visualAlerts: false,
  captions: true,
  smsMode: false,
  offlineMode: false,
  lowBandwidth: false,
  ussdMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  };

  const applyAccessibilityStyles = useCallback(() => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      normal: '16px',
      large: '20px',
      'extra-large': '24px',
      huge: '32px'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(settings.colorBlindMode);
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Large touch targets
    if (settings.largeTouchTargets) {
      root.classList.add('large-touch-targets');
    } else {
      root.classList.remove('large-touch-targets');
    }
    
    // Low bandwidth mode
    if (settings.lowBandwidth) {
      root.classList.add('low-bandwidth');
    } else {
      root.classList.remove('low-bandwidth');
    }
  }, [settings]);

  useEffect(() => {
    applyAccessibilityStyles();
  }, [applyAccessibilityStyles]);

  // Auto-detect some settings
  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !settings.reducedMotion) {
      updateSetting('reducedMotion', true);
    }
    
    // Detect high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (highContrastQuery.matches && !settings.highContrast) {
      updateSetting('highContrast', true);
    }
    
    // Detect if user is on a mobile device (likely to benefit from large touch targets)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && !settings.largeTouchTargets) {
      updateSetting('largeTouchTargets', true);
    }
  }, [settings.reducedMotion, settings.highContrast, settings.largeTouchTargets]);

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    resetToDefaults,
    applyAccessibilityStyles,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
