import React, { useState } from 'react';

interface AdminInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const AdminInput: React.FC<AdminInputProps> = ({
  label,
  error,
  icon,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'block w-full px-4 py-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
    : focused
    ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-500/20 bg-primary-50/50'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 bg-white';
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const iconClasses = icon ? 'pl-11' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`${baseClasses} ${stateClasses} ${iconClasses}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default AdminInput;
