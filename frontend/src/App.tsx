import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './i18n';
import { Analytics } from '@vercel/analytics/react';
import { apiService } from './services/api';

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
import DashboardAccessManager from './components/Dashboard/DashboardAccessManager';
import AppDownloadModal from './components/AppDownloadModal';
import AppInstallBanner from './components/AppInstallBanner';
import FloatingDownloadButton from './components/FloatingDownloadButton';

// Contexts
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { TestingProvider, ErrorBoundary } from './contexts/TestingContext';
import { UpdateProvider, UpdateModal } from './contexts/UpdateContext';

// Utils
import { secretCodeManager } from './utils/secretCode';
import { productionResetManager } from './utils/productionReset';

// Hooks
import { useAppDownloadModal } from './hooks/useAppDownloadModal';
import { cacheManager } from './utils/cacheManager';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Videos = lazy(() => import('./pages/Videos'));
const Clinics = lazy(() => import('./pages/Clinics'));
const Tracker = lazy(() => import('./pages/Tracker'));
const Games = lazy(() => import('./pages/Games'));
const EmergencyGhana = lazy(() => import('./pages/EmergencyGhana'));
const Mentorship = lazy(() => import('./pages/Mentorship'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Tutorial = lazy(() => import('./pages/Tutorial'));
const AccessibilityHub = lazy(() => import('./pages/AccessibilityHub'));
const SignLanguage = lazy(() => import('./pages/SignLanguage'));
const MedicationOrder = lazy(() => import('./pages/MedicationOrder'));
const SecureMap = lazy(() => import('./pages/SecureMap'));
const QRVerification = lazy(() => import('./pages/QRVerification'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Lazy loaded components
const StorytellingPlatform = lazy(() => import('./components/Storytelling/StorytellingPlatform'));
const SafeSpaceLocator = lazy(() => import('./components/SafeSpace/SafeSpaceLocator'));
const ConsentEducationGame = lazy(() => import('./components/Games/ConsentEducationGame'));
const InclusiveYouthSupport = lazy(() => import('./components/Inclusive/InclusiveYouthSupport'));

// Lazy loaded admin pages
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AuditLogViewer = lazy(() => import('./pages/AuditLogViewer'));
const BiometricPage = lazy(() => import('./pages/BiometricPage'));
const WorkflowManager = lazy(() => import('./pages/WorkflowManager'));
const SupportGroups = lazy(() => import('./pages/SupportGroups'));
const HealthRecords = lazy(() => import('./pages/HealthRecords'));
const ResourcesLibrary = lazy(() => import('./pages/ResourcesLibrary'));
const DirectMessages = lazy(() => import('./pages/DirectMessages'));
const LiveTracking = lazy(() => import('./pages/LiveTracking'));
const DailySafetyCheck = lazy(() => import('./pages/DailySafetyCheck'));
const CrimeReporting = lazy(() => import('./pages/CrimeReporting'));

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
            ? 'flex-1 w-full h-full bg-gray-50 pt-14 sm:pt-16'
            : 'flex-1 w-full h-full bg-gray-50'
        }
        style={{
          paddingTop: shouldShowMainNavigation ? 'calc(0.5rem + env(safe-area-inset-top))' : 'env(safe-area-inset-top)',
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
      const response = await apiService.loginUser(code) as { success: boolean; message?: string; user?: any };

      if (response.success) {
        if (secretCodeManager.validateSecretCode(code)) {
          secretCodeManager.updateLastUsed();
          setIsAuthenticated(true);
        }
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
    <ErrorBoundary>
      <UpdateProvider>
        <TestingProvider>
          <AccessibilityProvider>
            <Router>
              <Analytics />
              <div className="min-h-screen min-h-[100dvh] bg-gray-50" style={{ overflowY: 'visible' }}>
                <OfflineIndicator />
                <UpdateModal />
                
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
                <Suspense fallback={
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading...</p>
                    </div>
                  </div>
                }>
                  <Routes>
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/ReproBot" element={<Chatbot />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/stories" element={<StorytellingPlatform />} />
                    <Route path="/clinics" element={<Clinics />} />
                    <Route path="/safe-spaces" element={<SafeSpaceLocator />} />
                    <Route path="/tracker" element={<Tracker />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/consent-game" element={<ConsentEducationGame />} />
                    <Route path="/inclusive-support" element={<InclusiveYouthSupport />} />
                    <Route path="/emergency" element={<EmergencyGhana />} />
                    <Route path="/mentorship" element={<Mentorship />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/tutorial" element={<Tutorial />} />
                    <Route path="/qr-verification" element={<QRVerification />} />
                    <Route path="/accessibility" element={<AccessibilityHub />} />
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
                </Suspense>
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
      </UpdateProvider>
    </ErrorBoundary>
  );
}

export default App;
