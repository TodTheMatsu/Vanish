import { IoNotifications, IoNotificationsOutline } from 'react-icons/io5';
import { useUnreadCount } from '../hooks/useNotifications';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
  minimized?: boolean;
}

export function NotificationBell({ onClick, className = '', minimized = false }: NotificationBellProps) {
  const { data: unreadCount = 0, isLoading } = useUnreadCount();

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center space-x-3 text-white cursor-pointer w-full p-3 rounded-xl transition-all duration-200 justify-center ${minimized ? 'justify-center' : 'justify-start'} hover:bg-white/10 ${className}`}
    >
      <div className="relative">
        {unreadCount > 0 ? (
          <IoNotifications className="text-xl text-blue-200" style={{filter: 'drop-shadow(0 0 2px #60a5fa88)'}} />
        ) : (
          <IoNotificationsOutline className="text-xl text-neutral-300" />
        )}
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center animate-pulse"
            style={{
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute -top-1 -right-1 w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      {!minimized && <span className="font-medium">Notifications</span>}
    </button>
  );
}
