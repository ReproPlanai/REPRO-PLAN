import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Gamepad2, 
  Shield, 
  Users,
  BookOpen,
  Phone,
  Play,
  Download,
  Smartphone,
  QrCode,
  Sparkles,
  Lock,
  Activity,
  Heart
} from 'lucide-react';
import { LogoCircular } from '../assets';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import PageContainer from '../components/Layout/PageContainer';
import SurveyCompletionModal from '../components/Modals/SurveyCompletionModal';
import OnboardingCompletionModal from '../components/Modals/OnboardingCompletionModal';
import { apiService } from '../services/api';
import { secretCodeManager } from '../utils/secretCode';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [clinicCount, setClinicCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const quickAccessItems = [
    {
      path: '/chatbot',
      icon: MessageCircle,
      title: t('home.getHelp'),
      description: 'Ask ReproBot SRHR questions anonymously',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      path: '/videos',
      icon: Play,
      title: 'Educational Videos',
      description: 'Watch expert SRHR content',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      path: '/clinics',
      icon: MapPin,
      title: t('home.findServices'),
      description: `Find ${isLoading ? '...' : `${clinicCount}+`} health services in Ghana`,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      path: '/tracker',
      icon: Calendar,
      title: t('home.trackHealth'),
      description: 'Track your health and cycles with AI insights',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      path: '/health-records',
      icon: Heart,
      title: 'Health Records',
      description: 'View and manage your complete health history',
      color: 'bg-pink-500',
      textColor: 'text-pink-600'
    },
    {
      path: '/games',
      icon: Gamepad2,
      title: t('home.learnMore'),
      description: 'Learn through interactive games',
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      path: '/emergency',
      icon: Shield,
      title: t('home.emergencyHelp'),
      description: 'Get immediate emergency support',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      path: '/mentorship',
      icon: Users,
      title: 'AI Video Therapy',
      description: 'Connect with ReproBot for therapy sessions',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    },
    {
      path: '/qr-verification',
      icon: QrCode,
      title: 'QR Code Verification',
      description: 'Generate QR code for stakeholder verification',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    }
  ];

  const recentActivities = [
    { icon: Activity, text: 'Ghana clinic data updated', time: 'Just now' },
    { icon: MessageCircle, text: 'ReproBot AI assistant ready', time: 'Just now' },
    { icon: Shield, text: 'Emergency services configured', time: 'Just now' }
  ];

  // Fetch clinic data from API
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (apiUrl) {
          const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/clinics/ghana`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.clinics) {
              setClinicCount(data.clinics.length);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch clinic data:', error);
        // Set default count if API fails
        setClinicCount(50);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const secretCode = secretCodeManager.getSecretCode();
        if (secretCode) {
          const userResponse = await apiService.verifyUser(String(secretCode));
          if (userResponse?.success && userResponse.user) {
            setUserData(userResponse.user);
            
            // Check if user needs to complete survey
            if (!userResponse.user.survey_link || userResponse.user.survey_link === '') {
              setShowSurveyModal(true);
            }
            
            // Check if user needs to complete onboarding (empty demographics)
            if (!userResponse.user.demographics || Object.keys(userResponse.user.demographics).length === 0) {
              setShowOnboardingModal(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check user status:', error);
      }
    };

    checkUserStatus();
  }, []);

  const handleSurveyContinue = () => {
    setShowSurveyModal(false);
    // Navigate to survey page
    window.location.href = userData?.survey_link || '/survey';
  };

  const handleOnboardingContinue = () => {
    setShowOnboardingModal(false);
    // Navigate to onboarding/profile completion page
    window.location.href = '/profile';
  };

  return (
    <PageContainer
      gradient
      gradientFrom="from-slate-50"
      gradientVia="via-white"
      gradientTo="to-primary-50/20"
    >
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 sm:pb-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-2xl shadow-primary-500/20 mb-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.05)_100%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <img 
                src={LogoCircular} 
                alt="REPRO PLAN" 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-white/30"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/25 rounded-full text-xs font-semibold text-white uppercase tracking-wide">Welcome</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">REPRO PLAN</h1>
              <p className="text-sm text-white/90 leading-relaxed">
                Your anonymous companion for sexual and reproductive health and rights. Get accurate information, find services, and connect with support.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { icon: Lock, title: '100%', desc: 'Anonymous', color: 'from-emerald-500 to-teal-500' },
            { icon: BookOpen, title: 'Expert', desc: 'Verified Info', color: 'from-blue-500 to-cyan-500' },
            { icon: Phone, title: '24/7', desc: 'Available', color: 'from-purple-500 to-indigo-500' },
            { icon: Shield, title: 'Secure', desc: 'Encrypted', color: 'from-amber-500 to-orange-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={desc} className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${color}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* App Download */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/60 p-5 sm:p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">Get the REPRO PLAN App</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download for offline access, push notifications, and enhanced security.
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowInstallPrompt(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            {t('home.quickAccess')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-200/60 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div className={`p-2.5 rounded-xl ${item.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${item.textColor} text-sm mb-0.5`}>
                      {item.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('home.recentActivity')}
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium text-sm truncate">{activity.text}</p>
                        <p className="text-gray-500 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs">Start exploring REPRO PLAN features</p>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="font-semibold text-blue-900 text-sm">Your Privacy is Protected</h4>
              <p className="text-blue-800 text-xs mt-1 leading-relaxed">
                REPRO PLAN uses secret codes to ensure your complete anonymity. No personal information is required or stored.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt
        isOpen={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
        onInstall={() => {
          alert('To install REPRO PLAN as an app:\n\n1. Open this page in your browser\n2. Look for "Add to Home Screen" in your browser menu\n3. Tap "Add" to install the app');
          setShowInstallPrompt(false);
        }}
      />

      {/* Survey Completion Modal */}
      <SurveyCompletionModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onContinue={handleSurveyContinue}
      />

      {/* Onboarding Completion Modal */}
      <OnboardingCompletionModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onContinue={handleOnboardingContinue}
      />
    </PageContainer>
  );
};

export default Home;
