import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  footer,
  className = '',
  onClick,
  hoverable = false
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
  const hoverClasses = hoverable ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;