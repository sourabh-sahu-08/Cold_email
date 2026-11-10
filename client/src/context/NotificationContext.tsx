import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, title?: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (type: NotificationType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setNotifications(prev => [...prev, { id, type, message, title }]);

      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
        {notifications.map(n => {
          let bgColor = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

          if (n.type === 'success') {
            bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-950';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          } else if (n.type === 'error') {
            bgColor = 'bg-rose-50 border-rose-200 text-rose-950';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          }

          return (
            <div
              key={n.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgColor}`}
            >
              {icon}
              <div className="flex-1 text-sm">
                {n.title && <div className="font-semibold mb-0.5">{n.title}</div>}
                <div className="leading-relaxed">{n.message}</div>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
