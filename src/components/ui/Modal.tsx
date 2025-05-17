import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      timeoutId = setTimeout(() => {
        setIsVisible(false);
        // Restore body scrolling when modal is closed
        document.body.style.overflow = 'auto';
      }, 300);
    }
    
    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isVisible) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl transform transition-transform ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        
        {footer && <div className="px-6 py-4 border-t bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;