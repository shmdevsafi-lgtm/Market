/**
 * Toast Notification Component
 * Optimisé pour mobile avec positions fixes et animations fluides
 */

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastNotificationProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function ToastNotification({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
    warning: 'bg-amber-500 border-amber-600',
  };

  const typeIcons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  };

  const Icon = typeIcons[type];

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-[9999]
        max-w-[90vw] w-full sm:max-w-[500px]
        ${typeStyles[type]} border-l-4
        rounded-lg backdrop-blur-sm bg-opacity-95
        shadow-lg
        flex items-center gap-3
        px-4 py-3 sm:px-5 sm:py-4
        text-white text-sm sm:text-base
        animate-in slide-in-from-top fade-in duration-300
      `}
    >
      <Icon size={20} className="flex-shrink-0" />
      <span className="flex-1 break-words">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors ml-2 touch-target"
        aria-label="Fermer"
      >
        <X size={18} />
      </button>
    </div>
  );
}
