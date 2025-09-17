import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import SettingsModal from '../components/SettingsModal';
import { NotificationList } from '../components/NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import { useUser } from '../UserContext';
import { useSettings } from '../hooks/useSettings';
import { IoCheckmarkDone, IoTrash } from 'react-icons/io5';

export default function Notifications() {
  const { currentUser, updateUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
  } = useNotifications();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    tempUser,
    isSettingsLoading,
    settingsError,
    handleUsernameChange,
    handleDisplayNameChange,
    handleProfilePictureChange,
    handleSaveSettings,
    handleLogout,
  } = useSettings({
    user: currentUser,
    setUser: updateUser,
    onClose: () => setShowSettings(false),
  });

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setDeletingIds(prev => prev.filter(did => did !== id));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteRead = async () => {
    try {
      await deleteReadNotifications();
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex relative overflow-hidden">
      {showSidebar && (
        <Sidebar
          minimized={isDesktop}
          onNavigate={(path) => {
            if (path === 'settings') {
              setShowSettings(true);
            } else {
              window.location.href = path;
            }
          }}
          onSettings={() => setShowSettings(true)}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/50 backdrop-blur-sm border-b border-neutral-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-neutral-400 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
              </select>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <IoCheckmarkDone size={16} />
                  <span>Mark all read</span>
                </button>
              )}

              {/* Delete read notifications */}
              {notifications.some(n => n.read) && (
                <button
                  onClick={handleDeleteRead}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <IoTrash size={16} />
                  <span>Clear read</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              isLoading={isLoading}
              deletingIds={deletingIds}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && tempUser && (
        <SettingsModal
          show={showSettings}
          tempUser={tempUser}
          isLoading={isSettingsLoading}
          settingsError={settingsError}
          onUsernameChange={handleUsernameChange}
          onDisplayNameChange={handleDisplayNameChange}
          onProfilePictureChange={handleProfilePictureChange}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
