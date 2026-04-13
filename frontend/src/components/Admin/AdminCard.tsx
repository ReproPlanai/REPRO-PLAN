import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

const AdminCard: React.FC<AdminCardProps> = ({
  children,
  className = '',
  gradient = false,
  gradientFrom = 'from-white',
  gradientVia = 'via-white',
  gradientTo = 'to-gray-50',
  hover = false,
  padding = 'md',
  shadow = 'md'
}) => {
  const baseClasses = 'rounded-2xl border border-gray-200/60 backdrop-blur-sm transition-all duration-200';
  
  const gradientClasses = gradient
    ? `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`
    : 'bg-white';
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-gray-300/80 hover:-translate-y-0.5' : '';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  return (
    <div className={`${baseClasses} ${gradientClasses} ${hoverClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}>
      {children}
    </div>
  );
};

export default AdminCard;
