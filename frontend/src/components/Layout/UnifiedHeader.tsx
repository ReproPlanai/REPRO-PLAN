import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  MapPin,
  Calendar,
  Gamepad2,
  Shield,
  Users,
  Settings,
  Play,
  Bell,
  Heart,
  BookOpen,
  Lock,
  ChevronDown,
  GraduationCap,
  Eye,
  MousePointer,
  Volume2,
  Brain,
  Menu,
  X,
  Pill,
  Navigation,
  QrCode
} from 'lucide-react';
import { LogoCircular } from '../../assets';
import NotificationSystem from '../UI/NotificationSystem';

interface NavigationItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface DropdownMenu {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
}

const UnifiedHeader: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownMenus: DropdownMenu[] = [
    {
      title: 'Health & Safety',
      icon: Shield,
      items: [
        { path: '/', icon: Home, label: t('navigation.home') },
        { path: '/clinics', icon: MapPin, label: t('navigation.clinics') },
        { path: '/safe-spaces', icon: Lock, label: 'Safe Spaces' },
        { path: '/secure-map', icon: Navigation, label: 'Secure Map' },
        { path: '/medication-order', icon: Pill, label: 'Order Medicine' },
        { path: '/emergency', icon: Shield, label: t('navigation.emergency') },
        { path: '/tracker', icon: Calendar, label: t('navigation.tracker') },
      ]
    },
    {
      title: 'Education & Support',
      icon: BookOpen,
      items: [
        { path: '/chatbot', icon: MessageCircle, label: t('navigation.chatbot') },
        { path: '/videos', icon: Play, label: 'Videos' },
        { path: '/stories', icon: BookOpen, label: 'Stories' },
        { path: '/mentorship', icon: Users, label: t('navigation.mentorship') },
        { path: '/inclusive-support', icon: Users, label: 'Inclusive Support' },
      ]
    },
    {
      title: 'Interactive Features',
      icon: Gamepad2,
      items: [
        { path: '/games', icon: Gamepad2, label: t('navigation.games') },
        { path: '/consent-game', icon: Heart, label: 'Consent Game' },
      ]
    },
    {
      title: 'Tools & Settings',
      icon: Settings,
      items: [
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: '/tutorial', icon: GraduationCap, label: 'Tutorial' },
        { path: '/qr-verification', icon: QrCode, label: 'QR Code Verification' },
        { path: '/visual-accessibility', icon: Eye, label: 'Visual Accessibility' },
        { path: '/motor-accessibility', icon: MousePointer, label: 'Motor Accessibility' },
        { path: '/hearing-accessibility', icon: Volume2, label: 'Hearing Accessibility' },
        { path: '/cognitive-accessibility', icon: Brain, label: 'Easy to Use' },
        { path: '/settings', icon: Settings, label: t('navigation.settings') },
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAnyItemActive = (items: NavigationItem[]) => {
    return items.some(item => isActive(item.path));
  };

  const handleDropdownToggle = (title: string, event: React.MouseEvent) => {
    if (activeDropdown === title) {
      setActiveDropdown(null);
      setDropdownPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 4
      });
      setActiveDropdown(title);
    }
  };

  const handleItemClick = (path: string) => {
    setActiveDropdown(null);
    setDropdownPosition(null);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 overflow-visible">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-between h-14 sm:h-16" style={{ overflow: 'visible' }}>
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg ring-2 ring-primary-100">
                <img src={LogoCircular} alt="REPRO PLAN Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex flex-col leading-[1]">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">REPRO PLAN</h1>
                <p className="text-xs text-gray-500 hidden sm:block -mt-2 leading-none">Your Safe Space for SRHR</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-1 overflow-visible">
              {dropdownMenus.map((menu) => {
                const Icon = menu.icon;
                const hasActiveItem = isAnyItemActive(menu.items);
                const isOpen = activeDropdown === menu.title;

                return (
                  <div key={menu.title} className="relative">
                    <button
                      onClick={(e) => handleDropdownToggle(menu.title, e)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        hasActiveItem || isOpen
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{menu.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center space-x-2">
              <NotificationSystem />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 lg:hidden w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="p-4 pt-16">
              <div className="space-y-6">
                {dropdownMenus.map((menu) => {
                  const MenuIcon = menu.icon;
                  return (
                    <div key={menu.title} className="space-y-2">
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <MenuIcon className="w-5 h-5 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-800">{menu.title}</h3>
                      </div>
                      <div className="space-y-1 ml-2">
                        {menu.items.map((item) => {
                          const ItemIcon = item.icon;
                          const active = isActive(item.path);
                          return (
                            <button
                              key={item.path}
                              onClick={() => handleItemClick(item.path)}
                              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 touch-manipulation min-h-[48px] text-left ${
                                active
                                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <ItemIcon className="w-5 h-5 flex-shrink-0" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {activeDropdown && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => { setActiveDropdown(null); setDropdownPosition(null); }}
            aria-hidden="true"
          />
          {dropdownMenus.map((menu) => {
            const isOpen = activeDropdown === menu.title;
            if (!isOpen) return null;

            return (
              <div
                key={menu.title}
                className="fixed w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                style={{
                  left: dropdownPosition ? `${Math.max(8, dropdownPosition.x - 112)}px` : '50%',
                  top: dropdownPosition ? `${dropdownPosition.y}px` : '64px',
                  transform: dropdownPosition ? 'none' : 'translateX(-50%)'
                }}
              >
                <div className="p-2">
                  {menu.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleItemClick(item.path)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                          active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

export default UnifiedHeader;
