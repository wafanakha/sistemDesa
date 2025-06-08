import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  fullWidth = false,
  className = '',
  startIcon,
  endIcon,
  ...props
}, ref) => {
  const baseClasses = 'shadow-sm rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50';
  const errorClasses = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const iconClasses = startIcon || endIcon ? 'pl-10' : '';
  
  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${widthClass} ${iconClasses}`}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
            {endIcon}
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;