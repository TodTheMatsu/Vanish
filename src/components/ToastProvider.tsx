import React, { useState, useCallback, ReactNode } from 'react';
import { Toast, ToastContext } from '../hooks/useToast';
import { IoCheckmarkCircle, IoCloseCircle, IoWarning, IoInformationCircle } from 'react-icons/io5';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'], duration: number = 5000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white/10 border-l-4 border-green-300/60 text-green-100';
      case 'error':
        return 'bg-white/10 border-l-4 border-red-300/60 text-red-100';
      case 'warning':
        return 'bg-white/10 border-l-4 border-yellow-200/60 text-yellow-100';
      case 'info':
        return 'bg-white/10 border-l-4 border-blue-300/60 text-blue-100';
      default:
        return 'bg-white/10 border-l-4 border-neutral-500/60 text-neutral-200';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <IoCheckmarkCircle className="text-green-200 text-2xl" style={{filter: 'drop-shadow(0 0 2px #22d3ee88)'}} />;
      case 'error':
        return <IoCloseCircle className="text-red-200 text-2xl" style={{filter: 'drop-shadow(0 0 2px #f8717188)'}} />;
      case 'warning':
        return <IoWarning className="text-yellow-100 text-2xl" style={{filter: 'drop-shadow(0 0 2px #fde68a88)'}} />;
      case 'info':
        return <IoInformationCircle className="text-blue-200 text-2xl" style={{filter: 'drop-shadow(0 0 2px #60a5fa88)'}} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center p-4 rounded-xl shadow-2xl min-w-80 animate-slide-in backdrop-blur-md border ${getToastStyles()}`} style={{background: 'rgba(30,30,40,0.85)'}}>
      <span className="mr-3">{getIcon()}</span>
      <span className="flex-1 font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-neutral-300 hover:text-white text-lg px-2 py-1 rounded transition-colors"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
};
