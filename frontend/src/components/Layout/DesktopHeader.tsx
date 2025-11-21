import React, { useState } from 'react';
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
  Play,
  Download,
  FileText,
  Smartphone,
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
  icon: any;
  label: string;
}

interface DropdownMenu {
  title: string;
  icon: any;
  items: NavigationItem[];
}

const DesktopHeader: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Organize navigation items into logical groups
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
        { path: '/articles', icon: FileText, label: 'Articles' },
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
        { path: '/sms', icon: Smartphone, label: 'SMS & USSD' },
        { path: '/sms-alerts', icon: Bell, label: 'SRHR Alerts' },
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
        { path: '/offline', icon: Download, label: 'Offline Mode' },
        { path: '/settings', icon: Settings, label: t('navigation.settings') },
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
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

  const handleItemClick = () => {
    setActiveDropdown(null);
    setDropdownPosition(null);
    setIsMobileMenuOpen(false);
  };


  return (
    <>
    <header className="bg-white border-b border-gray-200 shadow-sm overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between h-16" style={{ overflow: 'visible' }}>
          {/* Logo - Responsive sizing */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shadow-lg ring-2 ring-primary-100">
              <img 
                src={LogoCircular} 
                alt="REPRO PLAN Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">REPRO PLAN</h1>
              <p className="text-xs text-gray-500">Your Safe Space for SRHR</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">REPRO PLAN</h1>
            </div>
          </Link>

            {/* Desktop Navigation Dropdowns - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto overflow-visible">
            {dropdownMenus.map((menu) => {
              const Icon = menu.icon;
              const hasActiveItem = isAnyItemActive(menu.items);
              const isOpen = activeDropdown === menu.title;
              
              return (
                <div key={menu.title} className="relative">
                  <button
                    onClick={(e) => handleDropdownToggle(menu.title, e)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      hasActiveItem || isOpen
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{menu.title}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                </div>
              );
            })}
          </nav>

          {/* Right side - Notifications and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Notifications - Always visible */}
            <NotificationSystem />

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu - Organized like desktop dropdowns */}
    {isMobileMenuOpen && (
      <>
        {/* Mobile menu backdrop */}
        <div 
          className="fixed inset-0 z-20 lg:hidden bg-black bg-opacity-25" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg relative z-30 max-h-[80vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="space-y-6">
              {dropdownMenus.map((menu) => {
                const MenuIcon = menu.icon;
                
                return (
                  <div key={menu.title} className="space-y-3">
                    {/* Menu Section Header */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <MenuIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        {menu.title}
                      </h3>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="space-y-1 ml-4">
                      {menu.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={(e) => {
                              e.preventDefault();
                              handleItemClick();
                              // Small delay to ensure menu closes before navigation
                              setTimeout(() => {
                                window.location.href = item.path;
                              }, 100);
                            }}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 touch-manipulation min-h-[48px] cursor-pointer ${
                              active
                                ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                            }`}
                          >
                            <ItemIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
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

    {/* Dropdown Menus - Outside header to overlay page content (Desktop only) */}
    {activeDropdown && (
      <>
        {/* Backdrop for closing dropdowns */}
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setActiveDropdown(null);
            setDropdownPosition(null);
          }}
        />
        
        {/* Dropdown Content */}
        {dropdownMenus.map((menu) => {
          const isOpen = activeDropdown === menu.title;
          if (!isOpen) return null;
          
          return (
            <div 
              key={menu.title}
              className="fixed w-56 sm:w-64 bg-white rounded-xl shadow-xl border-2 border-red-500 z-50" 
              style={{ 
                zIndex: 9999, 
                minHeight: '200px',
                left: dropdownPosition ? `${dropdownPosition.x - 112}px` : '50%',
                top: dropdownPosition ? `${dropdownPosition.y}px` : '64px',
                transform: dropdownPosition ? 'none' : 'translateX(-50%)'
              }}
            >
              <div className="p-2">
                {menu.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick();
                        // Small delay to ensure dropdown closes before navigation
                        setTimeout(() => {
                          window.location.href = item.path;
                        }, 100);
                      }}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        active
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
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

export default DesktopHeader;
