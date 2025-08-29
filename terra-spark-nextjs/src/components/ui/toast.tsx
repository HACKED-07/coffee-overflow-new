'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  onDismiss: (id: string) => void;
}

export function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full bg-background border rounded-lg shadow-lg p-4 transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${variant === 'destructive' ? 'border-red-200 bg-red-50 dark:bg-red-950' : 'border-border'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`font-semibold ${variant === 'destructive' ? 'text-red-900 dark:text-red-100' : ''}`}>
            {title}
          </h4>
          {description && (
            <p className={`text-sm mt-1 ${variant === 'destructive' ? 'text-red-700 dark:text-red-200' : 'text-muted-foreground'}`}>
              {description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="ml-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<any[]>([]);

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={dismiss}
        />
      ))}
    </>
  );
}

