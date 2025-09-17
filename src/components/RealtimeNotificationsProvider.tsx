import { createContext, useContext, ReactNode } from 'react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';

interface RealtimeNotificationsProviderProps {
  children: ReactNode;
}

const RealtimeNotificationsContext = createContext<{}>({});

export const RealtimeNotificationsProvider = ({ children }: RealtimeNotificationsProviderProps) => {
  // This will ensure realtime notifications are active for all authenticated users
  useRealtimeNotifications();

  return (
    <RealtimeNotificationsContext.Provider value={{}}>
      {children}
    </RealtimeNotificationsContext.Provider>
  );
};

export const useRealtimeNotificationsContext = () => {
  const context = useContext(RealtimeNotificationsContext);
  if (!context) {
    throw new Error('useRealtimeNotificationsContext must be used within a RealtimeNotificationsProvider');
  }
  return context;
};