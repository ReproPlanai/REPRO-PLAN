import React, { useState } from 'react';
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
  QrCode
} from 'lucide-react';
import { LogoCircular } from '../assets';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const quickAccessItems = [
    {
      path: '/chatbot',
      icon: MessageCircle,
      title: t('home.getHelp'),
      description: 'Ask SRHR questions anonymously',
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
      description: 'Find nearby health services',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      path: '/tracker',
      icon: Calendar,
      title: t('home.trackHealth'),
      description: 'Track your health and cycles',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
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
      title: 'Peer Support',
      description: 'Connect with trained mentors',
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
    { icon: MessageCircle, text: 'Asked about contraception', time: '2 hours ago' },
    { icon: Calendar, text: 'Tracked menstrual cycle', time: '1 day ago' },
    { icon: Gamepad2, text: 'Completed SRHR quiz', time: '3 days ago' }
  ];

  return (
    <div className="w-full h-full bg-gray-50 overflow-x-hidden">
      
      <main className="p-4 sm:p-6">
        <div className="space-y-6">
          {/* Hero section - Enhanced for mobile */}
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-8 shadow-xl">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/30">
                  <img 
                    src={LogoCircular} 
                    alt="REPRO PLAN Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">REPRO PLAN</h2>
              </div>
            <p className="text-base sm:text-lg opacity-90 mb-6 leading-relaxed">
              Your anonymous companion for sexual and reproductive health and rights. 
              Get accurate information, find services, and connect with support - all while maintaining complete privacy.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">100% Anonymous</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Evidence-Based</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">24/7 Available</span>
              </div>
            </div>
          </div>

          {/* App Download Prompt */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get the REPRO PLAN App</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Download our app for the best experience with offline access, push notifications, and enhanced security.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setShowInstallPrompt(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download App</span>
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access - Enhanced mobile grid */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              {t('home.quickAccess')}
            </h3>
            <div className="mobile-grid">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="card hover:shadow-xl transition-all duration-300 group active:scale-98 touch-manipulation"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`p-3 sm:p-4 rounded-xl ${item.color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${item.textColor} mb-1 text-sm sm:text-base`}>
                          {item.title}
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity - Enhanced mobile layout */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              {t('home.recentActivity')}
            </h3>
            <div className="card">
              {recentActivities.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-gray-100 rounded-lg flex-shrink-0">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm sm:text-base truncate">{activity.text}</p>
                          <p className="text-gray-500 text-xs sm:text-sm">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">No recent activity</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Start exploring REPRO PLAN features</p>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice - Enhanced mobile layout */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Your Privacy is Protected</h4>
                  <p className="text-blue-800 text-xs sm:text-sm mb-3 leading-relaxed">
                    REPRO PLAN uses secret codes to ensure your complete anonymity. No personal information is required or stored. 
                    Your conversations, health data, and activities remain private and secure.
                  </p>
                <ul className="text-blue-700 text-xs sm:text-sm space-y-1">
                  <li>• No phone numbers or names required</li>
                  <li>• All data encrypted and stored locally</li>
                  <li>• Anonymous usage analytics only</li>
                  <li>• No tracking or profiling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt
        isOpen={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
        onInstall={() => {
          // Handle manual installation instructions
          alert('To install REPRO PLAN as an app:\n\n1. Open this page in your browser\n2. Look for "Add to Home Screen" in your browser menu\n3. Tap "Add" to install the app');
          setShowInstallPrompt(false);
        }}
      />
    </div>
  );
};

export default Home;
