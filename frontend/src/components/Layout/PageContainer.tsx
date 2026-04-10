import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  gradient?: boolean;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

/**
 * Centralized Page Container Component
 * 
 * Provides consistent full-screen layout across all pages.
 * Features:
 * - Full viewport height (100dvh) support
 * - Safe area insets for mobile devices
 * - Optional full-width (no max-width constraints)
 * - Optional gradients
 * - Consistent padding (none on mobile, sm padding on larger screens)
 * - Single scroller pattern - no nested scrolling containers
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  fullWidth = true,
  noPadding = false,
  gradient = false,
  gradientFrom = 'from-slate-50',
  gradientVia = 'via-white',
  gradientTo = 'to-primary-50/30',
}) => {
  // Base classes - use min-h-screen instead of h-full to prevent nested scrolling
  const baseClasses = 'w-full min-h-screen';
  
  // Padding classes - no padding on mobile if noPadding is true, add bottom padding for hamburger menu
  const paddingClasses = noPadding 
    ? 'pb-20 sm:pb-8' 
    : 'p-0 sm:p-4 pb-20 sm:pb-8';
  
  // Gradient or background
  const bgClasses = gradient
    ? `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`
    : 'bg-gray-50';
  
  // Full width means no max-width constraints
  const widthClasses = fullWidth ? '' : 'max-w-7xl mx-auto';

  return (
    <div 
      className={`${baseClasses} ${bgClasses} ${paddingClasses} ${widthClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
