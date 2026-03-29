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

// Contexts
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { TestingProvider, ErrorBoundary } from './contexts/TestingContext';

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
import AccessibilityHub from './pages/AccessibilityHub';
import SystemHealthDashboard from './pages/SystemHealthDashboard';
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
import DailySafetyCheck from './pages/DailySafetyCheck';
import CrimeReporting from './pages/CrimeReporting';

// Utils
import { secretCodeManager } from './utils/secretCode';
import { productionResetManager } from './utils/productionReset';

// Hooks
import { useAppDownloadModal } from './hooks/useAppDownloadModal';
import { cacheManager } from './utils/cacheManager';

const AppLayoutContent: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const shouldShowMainNavigation = !isDashboardRoute;

  return (
    <>
      {shouldShowMainNavigation && (
        <>
          <UnifiedHeader />
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
    const initializeApp = async () => {
      try {
        const resetResult = await productionResetManager.checkAndResetForProduction();

        if (resetResult.wasReset) {
          console.log('🔄 Production reset completed:', resetResult.reason);
          alert('Welcome to REPRO PLAN v3.0! Your app has been updated for production use.');
        }

        const hasValidCode = secretCodeManager.hasValidSecretCode();
        setIsAuthenticated(hasValidCode);
        setIsLoading(false);

        if (!hasValidCode) {
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
    
    const handleStakeholderAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const role = urlParams.get('role');
      const validStakeholderRoles = ['ADMIN', 'POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO'];
      
      if (role && validStakeholderRoles.includes(role) && window.location.pathname === '/dashboard') {
        console.log('🔍 Stakeholder URL detected:', role, '- Ensuring Router access');
        setIsLoading(false);
      }
    };
    
    window.addEventListener('popstate', handleStakeholderAccess);
    
    handleStakeholderAccess();

    cacheManager.initializeCache().then(() => {
      console.log('Cache manager initialized with new features');

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
      const response = await (await import('./services/api')).apiService.loginUser(code) as { success: boolean; message?: string; user?: any };

      if (response.success) {
        if ((await import('./utils/secretCode')).secretCodeManager.validateSecretCode(code)) {
          (await import('./utils/secretCode')).secretCodeManager.updateLastUsed();
          setIsAuthenticated(true);
        }
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if ((await import('./utils/secretCode')).secretCodeManager.validateSecretCode(code)) {
        (await import('./utils/secretCode')).secretCodeManager.updateLastUsed();
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
    <ErrorBoundary>
      <TestingProvider>
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
                  <Route path="/accessibility" element={<AccessibilityHub />} />
                  <Route path="/system-health" element={<SystemHealthDashboard />} />
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
                  <Route path="/daily-safety-check" element={<DailySafetyCheck />} />
                  <Route path="/report-crime" element={<CrimeReporting />} />
                  
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
              </div>
            </Router>
          </AccessibilityProvider>
        </TestingProvider>
      </ErrorBoundary>
    );
}

export default App;
