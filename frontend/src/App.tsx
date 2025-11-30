import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './i18n';
import './styles/accessibility.css';

// Components
import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UI/UpdateNotification';
import useServiceWorkerUpdate from './hooks/useServiceWorkerUpdate';
import DesktopHeader from './components/Layout/DesktopHeader';
import LoginForm from './components/Auth/LoginForm';
import CreateCodeForm from './components/Auth/CreateCodeForm';
import ForgetCodeForm from './components/Auth/ForgetCodeForm';
import SRHRAlerts from './components/SMS/SRHRAlerts';
import StorytellingPlatform from './components/Storytelling/StorytellingPlatform';
import SafeSpaceLocator from './components/SafeSpace/SafeSpaceLocator';
import ConsentEducationGame from './components/Games/ConsentEducationGame';
import InclusiveYouthSupport from './components/Inclusive/InclusiveYouthSupport';
import DashboardAccessManager from './components/Dashboard/DashboardAccessManager';
import AppDownloadModal from './components/AppDownloadModal';
import AppInstallBanner from './components/AppInstallBanner';
import FloatingDownloadButton from './components/FloatingDownloadButton';

// Contexts
import { AccessibilityProvider } from './contexts/AccessibilityContext';

// Pages
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import Videos from './pages/Videos';
import Articles from './pages/Articles';
import SMSInterface from './components/SMS/SMSInterface';
import Clinics from './pages/Clinics';
import Tracker from './pages/Tracker';
import Games from './pages/Games';
import Emergency from './pages/Emergency';
import Mentorship from './pages/Mentorship';
import OfflineMode from './pages/OfflineMode';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Tutorial from './pages/Tutorial';
import VisualAccessibility from './pages/VisualAccessibility';
import MotorAccessibility from './pages/MotorAccessibility';
import HearingAccessibility from './pages/HearingAccessibility';
import CognitiveAccessibility from './pages/CognitiveAccessibility';
import MedicationOrder from './pages/MedicationOrder';
import SecureMap from './pages/SecureMap';
import QRVerification from './pages/QRVerification';

// Utils
import { secretCodeManager } from './utils/secretCode';
import { smsIntegration } from './utils/smsIntegration';

// Hooks
import { useAppDownloadModal } from './hooks/useAppDownloadModal';
import { cacheManager } from './utils/cacheManager';

// Component to conditionally render header
const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  const shouldShowHeader = !location.pathname.startsWith('/dashboard');
  
  return shouldShowHeader ? <DesktopHeader /> : null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [showForgetCode, setShowForgetCode] = useState(false);
  const { isUpdateAvailable, updateServiceWorker, dismissUpdate } = useServiceWorkerUpdate();
  const [isLoading, setIsLoading] = useState(true);
  
  // App download modal
  const { showModal, closeModal, handleDownload } = useAppDownloadModal();

  useEffect(() => {
    // Check if user has a valid secret code
    const hasValidCode = secretCodeManager.hasValidSecretCode();
    setIsAuthenticated(hasValidCode);
    setIsLoading(false);
    
    // Handle stakeholder URL changes
    const handleStakeholderAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const role = urlParams.get('role');
      const validStakeholderRoles = ['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO'];
      
      if (role && validStakeholderRoles.includes(role) && window.location.pathname === '/dashboard') {
        console.log('🔍 Stakeholder URL detected:', role, '- Ensuring Router access');
        // Force re-render to ensure Router is accessible
        setIsLoading(false);
      }
    };
    
    // Listen for URL changes
    window.addEventListener('popstate', handleStakeholderAccess);
    
    // Check initial URL
    handleStakeholderAccess();
    
    return () => {
      window.removeEventListener('popstate', handleStakeholderAccess);
    };

    // Initialize SMS integration
    // eslint-disable-next-line no-unreachable
    smsIntegration.processOfflineQueue();

    // Initialize cache manager with new features
    cacheManager.initializeCache().then(() => {
      console.log('Cache manager initialized with new features');
      
      // Check if cache needs update
      if (cacheManager.needsCacheUpdate()) {
        console.log('Cache update available - new features ready');
      }
    });

    // Register service worker for PWA functionality
    // eslint-disable-next-line no-unreachable
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker installed with updates');
                  // Force cache refresh for new features
                  cacheManager.forceCacheRefresh();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for service worker messages
    // eslint-disable-next-line no-unreachable
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SW_UPDATE') {
          console.log('Service Worker update received:', event.data);
          // Handle new features notification
        }
      });
    }
  }, []);

  const handleLogin = async (code: string) => {
    try {
      // Use API service (now uses mock data for prototype)
      const { apiService } = await import('./services/api');
      const response = await apiService.loginUser(code);

      if (response.success) {
        // Store code locally after successful login
        if (secretCodeManager.validateSecretCode(code)) {
          secretCodeManager.updateLastUsed();
          setIsAuthenticated(true);
        }
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Fallback to local validation if API fails
      if (secretCodeManager.validateSecretCode(code)) {
        secretCodeManager.updateLastUsed();
        setIsAuthenticated(true);
      } else {
        alert('Invalid secret code. Please try again.');
      }
    }
  };

  const handleCreateCode = (code: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    secretCodeManager.deleteSecretCode();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading REPRO PLAN...</p>
        </div>
      </div>
    );
  }

  // Check for stakeholder access first
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');
  const validStakeholderRoles = ['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO'];
  const isStakeholderAccess = role && validStakeholderRoles.includes(role) && window.location.pathname === '/dashboard';
  
  if (!isAuthenticated && !isStakeholderAccess) {
    // Regular users need authentication
    console.log('🔍 Regular user - Showing login form');
    if (showForgetCode) {
      return <ForgetCodeForm onBack={() => setShowForgetCode(false)} onCodeRecovered={handleCreateCode} />;
    }
    if (showCreateCode) {
      return <CreateCodeForm onBack={() => setShowCreateCode(false)} onCodeCreated={handleCreateCode} />;
    }
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onCreateNew={() => setShowCreateCode(true)}
        onForgetCode={() => setShowForgetCode(true)}
      />
    );
  }
  
  if (isStakeholderAccess) {
    console.log('🔍 Stakeholder detected:', role, '- Allowing access to Router');
  }

  return (
    <AccessibilityProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ overflowY: 'visible' }}>
          <OfflineIndicator />
          
          {/* App Install Banner */}
          <AppInstallBanner
            onInstall={handleDownload}
            onDismiss={closeModal}
          />
          
          {/* Update Notification */}
          {isUpdateAvailable && (
            <UpdateNotification
              onUpdate={updateServiceWorker}
              onDismiss={dismissUpdate}
            />
          )}
          
          {/* Desktop Header - Hide for dashboard pages */}
          <ConditionalHeader />
          
            {/* Main content area with proper mobile spacing */}
            <main className="flex-1 lg:ml-0 min-h-screen-safe">
              <div className="w-full max-w-none">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/sms" element={<SMSInterface />} />
                  <Route path="/sms-alerts" element={<SRHRAlerts />} />
                  <Route path="/stories" element={<StorytellingPlatform />} />
                  <Route path="/clinics" element={<Clinics />} />
                  <Route path="/safe-spaces" element={<SafeSpaceLocator />} />
                  <Route path="/tracker" element={<Tracker />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/consent-game" element={<ConsentEducationGame />} />
                  <Route path="/inclusive-support" element={<InclusiveYouthSupport />} />
                  <Route path="/emergency" element={<Emergency />} />
                  <Route path="/mentorship" element={<Mentorship />} />
                  <Route path="/offline" element={<OfflineMode />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/tutorial" element={<Tutorial />} />
                  <Route path="/qr-verification" element={<QRVerification />} />
                  <Route path="/visual-accessibility" element={<VisualAccessibility />} />
                  <Route path="/motor-accessibility" element={<MotorAccessibility />} />
                  <Route path="/hearing-accessibility" element={<HearingAccessibility />} />
                  <Route path="/cognitive-accessibility" element={<CognitiveAccessibility />} />
                  <Route path="/medication-order" element={<MedicationOrder />} />
                  <Route path="/secure-map" element={<SecureMap />} />
                  <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
                  <Route path="/dashboard" element={<DashboardAccessManager />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
            
            
            {/* App Download Modal */}
            <AppDownloadModal
              isOpen={showModal}
              onClose={closeModal}
              onDownload={handleDownload}
            />

            {/* Floating Download Button */}
            <FloatingDownloadButton
              onOpenModal={openModal}
            />
        </div>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;
