import React, { forwardRef } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  helperText,
  error,
  fullWidth = false,
  className = '',
  onChange,
  ...props
}, ref) => {
  const baseClasses = 'shadow-sm rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50';
  const errorClasses = error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${widthClass}`}
        onChange={handleChange}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {(helperText || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;