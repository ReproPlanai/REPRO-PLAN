import React from 'react';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-600'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  if (dot) {
    return (
      <span className={`inline-flex items-center ${sizeClasses[size]}`}>
        <span className={`w-2 h-2 rounded-full ${variantClasses[variant].split(' ')[0].replace('bg-', 'bg-')}`} />
        {children && <span className="ml-2">{children}</span>}
      </span>
    );
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

export default AdminBadge;
