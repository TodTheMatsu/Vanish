import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MessagesLayout } from '../components/messages/MessagesLayout';
import Sidebar from '../components/Sidebar';
import SettingsModal from '../components/SettingsModal';
import { useUser } from '../UserContext';
import { useSettings } from '../hooks/useSettings';

export default function Messages() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { currentUser, updateUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

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
    setTempUser,
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

  // Listen for mobile chat/list state from MessagesLayout
  const handleMobileViewChange = (view: 'list' | 'chat') => {
    setShowSidebar(view === 'list');
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex relative overflow-hidden">
      {showSidebar && (
        <Sidebar
          minimized={isDesktop}
          onNavigate={path => navigate(path)}
          onSettings={() => {
            if (currentUser) {
              setTempUser(currentUser);
              setShowSettings(true);
            }
          }}
          onCreatePost={() => {}}
        />
      )}
      <div className="flex-1 min-w-0">
        <MessagesLayout
          selectedConversationId={conversationId}
          onMobileViewChange={handleMobileViewChange}
        />
      </div>
      <SettingsModal
        show={showSettings}
        tempUser={tempUser ?? { username: '', displayName: '', profilePicture: '' }}
        isLoading={isSettingsLoading}
        settingsError={settingsError}
        onUsernameChange={handleUsernameChange}
        onDisplayNameChange={handleDisplayNameChange}
        onProfilePictureChange={handleProfilePictureChange}
        onSave={handleSaveSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}
