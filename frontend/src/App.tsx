import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './i18n';
import { Analytics } from '@vercel/analytics/react';

// Components
import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UI/UpdateNotification';
import useServiceWorkerUpdate from './hooks/useServiceWorkerUpdate';
import UnifiedHeader from './components/Layout/UnifiedHeader';
import BottomNavigation from './components/Layout/BottomNavigation';
import LoginForm from './components/Auth/LoginForm';
import CreateCodeForm from './components/Auth/CreateCodeForm';
import ForgetCodeForm from './components/Auth/ForgetCodeForm';
import PreAuthLoader from './components/Auth/PreAuthLoader';
import StorytellingPlatform from './components/Storytelling/StorytellingPlatform';
import SafeSpaceLocator from './components/SafeSpace/SafeSpaceLocator';
import ConsentEducationGame from './components/Games/ConsentEducationGame';
import InclusiveYouthSupport from './components/Inclusive/InclusiveYouthSupport';
import DashboardAccessManager from './components/Dashboard/DashboardAccessManager';
import AppDownloadModal from './components/AppDownloadModal';
import AppInstallBanner from './components/AppInstallBanner';
import FloatingDownloadButton from './components/FloatingDownloadButton';
import SafetyCheckManager from './components/Safety/SafetyCheckManager';
import NotificationSystem from './components/UI/NotificationSystem';

// Contexts
import { AccessibilityProvider } from './contexts/AccessibilityContext';

// Pages
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import Videos from './pages/Videos';
import Clinics from './pages/Clinics';
import Tracker from './pages/Tracker';
import Games from './pages/Games';
import Emergency from './pages/Emergency';
import Mentorship from './pages/Mentorship';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Tutorial from './pages/Tutorial';
import VisualAccessibility from './pages/VisualAccessibility';
import MotorAccessibility from './pages/MotorAccessibility';
import HearingAccessibility from './pages/HearingAccessibility';
import CognitiveAccessibility from './pages/CognitiveAccessibility';
import SignLanguage from './pages/SignLanguage';
import MedicationOrder from './pages/MedicationOrder';
import SecureMap from './pages/SecureMap';
import QRVerification from './pages/QRVerification';

// New Admin & Management Pages
import AdminPanel from './pages/AdminPanel';
import AuditLogViewer from './pages/AuditLogViewer';
import BiometricPage from './pages/BiometricPage';
import WorkflowManager from './pages/WorkflowManager';
import SupportGroups from './pages/SupportGroups';
import HealthRecords from './pages/HealthRecords';
import ResourcesLibrary from './pages/ResourcesLibrary';
import DirectMessages from './pages/DirectMessages';
import LiveTracking from './pages/LiveTracking';

// Utils
import { secretCodeManager } from './utils/secretCode';
import { offlineStorage } from './utils/offlineStorage';
import { productionResetManager } from './utils/productionReset';

// Hooks
import { useAppDownloadModal } from './hooks/useAppDownloadModal';
import { cacheManager } from './utils/cacheManager';

// Layout content with route-based header visibility and mobile-first full screen
const AppLayoutContent: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  // Show unified header and bottom nav for all main app routes (except dashboard which has its own header)
  const shouldShowMainNavigation = !isDashboardRoute;

  return (
    <>
      {shouldShowMainNavigation && (
        <>
          <UnifiedHeader />
          <div className="fixed top-4 right-4 z-50">
            <NotificationSystem />
          </div>
          <BottomNavigation />
        </>
      )}
      <main
        className={
          shouldShowMainNavigation
            ? 'flex-1 w-full h-full overflow-x-hidden overflow-y-auto bg-gray-50 pt-14 sm:pt-16'
            : 'flex-1 w-full h-full overflow-x-hidden overflow-y-auto bg-gray-50'
        }
        style={{
          paddingTop: shouldShowMainNavigation ? 'calc(3.5rem + env(safe-area-inset-top))' : 'env(safe-area-inset-top)',
          paddingBottom: shouldShowMainNavigation ? 'calc(4rem + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)',
          height: '100dvh',
          minHeight: '100dvh'
        }}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [showForgetCode, setShowForgetCode] = useState(false);
  const [showPreAuthLoader, setShowPreAuthLoader] = useState(false);
  const { isUpdateAvailable, updateServiceWorker, dismissUpdate } = useServiceWorkerUpdate();
  const [isLoading, setIsLoading] = useState(true);
  const loaderTimeoutRef = useRef<number | undefined>(undefined);
  
  // App download modal
  const { showModal, closeModal, handleDownload, openModal } = useAppDownloadModal();

  useEffect(() => {
    // Check for production reset first
    const isStakeholderUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const role = urlParams.get('role');
      const validStakeholderRoles = ['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO'];

      return Boolean(role && validStakeholderRoles.includes(role) && window.location.pathname === '/dashboard');
    };

    const initializeApp = async () => {
      try {
        const resetResult = await productionResetManager.checkAndResetForProduction();

        if (resetResult.wasReset) {
          console.log('🔄 Production reset completed:', resetResult.reason);
          // Show user notification about reset
          alert('Welcome to REPRO PLAN v3.0! Your app has been updated for production use.');
        }

        // Check if user has a valid secret code
        const hasValidCode = secretCodeManager.hasValidSecretCode();
        setIsAuthenticated(hasValidCode);
        setIsLoading(false);

        if (!hasValidCode && !isStakeholderUrl()) {
          setShowPreAuthLoader(true);
          if (loaderTimeoutRef.current) {
            window.clearTimeout(loaderTimeoutRef.current);
          }
          loaderTimeoutRef.current = window.setTimeout(() => {
            setShowPreAuthLoader(false);
          }, 5000);
        } else {
          setShowPreAuthLoader(false);
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
    
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

    // Initialize cache manager with new features
    cacheManager.initializeCache().then(() => {
      console.log('Cache manager initialized with new features');

      // Check if cache needs update
      if (cacheManager.needsCacheUpdate()) {
        console.log('Cache update available - new features ready');
      }
    });

    return () => {
      window.removeEventListener('popstate', handleStakeholderAccess);
      if (loaderTimeoutRef.current) {
        window.clearTimeout(loaderTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = async (code: string) => {
    try {
      // Use API service for production authentication
      const { apiService } = await import('./services/api');
      const response = await apiService.loginUser(code) as { success: boolean; message?: string; user?: any };

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
    if (showPreAuthLoader && !showCreateCode && !showForgetCode) {
      return <PreAuthLoader />;
    }
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
        <Analytics />
        <div className="min-h-screen min-h-[100dvh] bg-gray-50 overflow-x-hidden" style={{ overflowY: 'visible' }}>
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
          
          <AppLayoutContent isAuthenticated={isAuthenticated}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/rehana" element={<Chatbot />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/stories" element={<StorytellingPlatform />} />
              <Route path="/clinics" element={<Clinics />} />
              <Route path="/safe-spaces" element={<SafeSpaceLocator />} />
              <Route path="/tracker" element={<Tracker />} />
              <Route path="/games" element={<Games />} />
              <Route path="/consent-game" element={<ConsentEducationGame />} />
              <Route path="/inclusive-support" element={<InclusiveYouthSupport />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/qr-verification" element={<QRVerification />} />
              <Route path="/visual-accessibility" element={<VisualAccessibility />} />
              <Route path="/motor-accessibility" element={<MotorAccessibility />} />
              <Route path="/hearing-accessibility" element={<HearingAccessibility />} />
              <Route path="/cognitive-accessibility" element={<CognitiveAccessibility />} />
              <Route path="/sign-language" element={<SignLanguage />} />
              <Route path="/medication-order" element={<MedicationOrder />} />
              <Route path="/secure-map" element={<SecureMap />} />
              <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
              <Route path="/dashboard" element={<DashboardAccessManager />} />
              
              {/* New Admin & Management Routes */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/audit-logs" element={<AuditLogViewer />} />
              <Route path="/biometrics" element={<BiometricPage />} />
              <Route path="/workflows" element={<WorkflowManager />} />
              <Route path="/support-groups" element={<SupportGroups />} />
              <Route path="/health-records" element={<HealthRecords />} />
              <Route path="/resources" element={<ResourcesLibrary />} />
              <Route path="/messages" element={<DirectMessages />} />
              <Route path="/live-tracking" element={<LiveTracking />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayoutContent>

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

            {/* Safety Check Manager - Daily Wellness Check-ins */}
            {isAuthenticated && <SafetyCheckManager />}
        </div>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;
