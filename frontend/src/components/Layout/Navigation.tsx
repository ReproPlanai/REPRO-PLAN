import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Gamepad2, 
  Shield, 
  Users, 
  Settings,
  Menu,
  X,
  Wifi,
  WifiOff,
  Play,
  Download,
  FileText,
  Globe,
  Smartphone,
  Bell,
  Heart,
  BookOpen,
  Lock,
  GraduationCap,
  Eye,
  MousePointer,
  Volume2,
  Brain
} from 'lucide-react';
import { useState } from 'react';
import { useOffline } from '../../hooks/useOffline';
import NotificationSystem from '../UI/NotificationSystem';

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isOnline } = useOffline();

  const navigationItems = [
    { path: '/', icon: Home, label: t('navigation.home') },
    { path: '/chatbot', icon: MessageCircle, label: t('navigation.chatbot') },
    { path: '/videos', icon: Play, label: 'Videos' },
    { path: '/articles', icon: FileText, label: 'Articles' },
    { path: '/sms', icon: Smartphone, label: 'SMS & USSD' },
    { path: '/sms-alerts', icon: Bell, label: 'SRHR Alerts' },
    { path: '/stories', icon: BookOpen, label: 'Stories' },
    { path: '/clinics', icon: MapPin, label: t('navigation.clinics') },
    { path: '/safe-spaces', icon: Lock, label: 'Safe Spaces' },
    { path: '/tracker', icon: Calendar, label: t('navigation.tracker') },
    { path: '/games', icon: Gamepad2, label: t('navigation.games') },
    { path: '/consent-game', icon: Heart, label: 'Consent Game' },
    { path: '/inclusive-support', icon: Users, label: 'Inclusive Support' },
    { path: '/emergency', icon: Shield, label: t('navigation.emergency') },
    { path: '/mentorship', icon: Users, label: t('navigation.mentorship') },
    { path: '/offline', icon: Download, label: 'Offline Mode' },
    { path: '/visual-accessibility', icon: Eye, label: 'Visual Accessibility' },
    { path: '/motor-accessibility', icon: MousePointer, label: 'Motor Accessibility' },
    { path: '/hearing-accessibility', icon: Volume2, label: 'Hearing Accessibility' },
    { path: '/cognitive-accessibility', icon: Brain, label: 'Easy to Use' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/tutorial', icon: GraduationCap, label: 'Tutorial' },
    { path: '/settings', icon: Settings, label: t('navigation.settings') },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button - Enhanced for better touch targets - Moved to right side */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 right-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 touch-manipulation active:scale-95 transition-transform"
        style={{ 
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          minHeight: '48px',
          minWidth: '48px'
        }}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay with better touch handling */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        />
      )}

      {/* Navigation - Enhanced mobile experience */}
      <nav className={`
        fixed left-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl z-40 transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ 
        paddingTop: 'max(60px, env(safe-area-inset-top))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <div className="p-4 sm:p-6 h-full flex flex-col">
          {/* Logo - Enhanced for mobile */}
          <div className="flex items-center space-x-3 mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-10 sm:h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 sm:w-6 sm:h-6 text-white" />
            </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">REPRO PLAN</h1>
                  <p className="text-xs text-gray-500 truncate">Your Safe Space for SRHR</p>
                </div>
          </div>

              {/* Mobile Status Section - Only visible on mobile */}
              <div className="lg:hidden mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="space-y-3">
                  {/* Top row - Status indicators */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Online/Offline indicator */}
                      <div className="flex items-center space-x-2">
                        {isOnline ? (
                          <Wifi className="w-5 h-5 text-green-500" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {t('common.anonymous')}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row - Notifications and Language */}
                  <div className="flex items-center justify-between">
                    {/* Notifications */}
                    <NotificationSystem />

                    {/* Language selector */}
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <select className="text-sm border-0 bg-transparent text-gray-600 focus:outline-none">
                        <option value="en">English</option>
                        <option value="kpelle">Kpelle</option>
                        <option value="bassa">Bassa</option>
                        <option value="kru">Kru</option>
                        <option value="vai">Vai</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

          {/* Navigation items - Enhanced spacing and touch targets */}
          <div className="space-y-1 flex-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 touch-manipulation
                    active:scale-98 lg:active:scale-100
                    ${active 
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                    }
                  `}
                  style={{ minHeight: '52px' }}
                >
                  <Icon size={22} className="flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Privacy indicator - Enhanced for mobile */}
          <div className="mt-4 sm:mt-8 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-sm font-medium text-green-700">
                {t('common.anonymous')}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1 leading-relaxed">
              Your data is protected and anonymous
            </p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
