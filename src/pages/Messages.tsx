import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex relative overflow-hidden">
      <Sidebar
        onNavigate={path => navigate(path)}
        onSettings={() => {
          if (currentUser) {
            setTempUser(currentUser);
            setShowSettings(true);
          }
        }}
        onCreatePost={() => {}}
      />
      <div className="flex-1 min-w-0">
        <MessagesLayout selectedConversationId={conversationId} />
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
