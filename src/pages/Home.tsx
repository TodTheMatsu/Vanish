import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PostList } from '../components/PostList';
import CreatePostModal from '../components/CreatePostModal';
import SettingsModal from '../components/SettingsModal';
import { usePosts } from '../hooks/usePosts';
import { useUserData } from '../hooks/useUserData';
import { useSettings } from '../hooks/useSettings'; // Import the shared hook

export default function Home() {
  const navigate = useNavigate();
  const { posts, createPost } = usePosts();
  const { user, setUser } = useUserData();
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [showPostCreation, setShowPostCreation] = useState(false);
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
    setIsSettingsLoading,
    setSettingsError,
  } = useSettings({
    user,
    setUser,
    onClose: () => setShowSettings(false), // Close the modal
  });

  // Handlers for creating a post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    await createPost({ content: newPost, expiresIn });
    setNewPost('');
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white flex">
      <Sidebar
        user={user}
        onNavigate={path => navigate(path)}
        onSettings={() => {
          setTempUser(user);
          setShowSettings(true);
        }}
      />
      <div className="ml-16 md:ml-64 flex-1 p-4">
        <div className="max-w-3xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPostCreation(true)}
            className="fixed bottom-8 right-8 md:right-24 w-20 h-20 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
          >
            <img src="https://img.icons8.com/?size=100&id=2563&format=png&color=FFFFFF" alt="Post" className="w-[50%] h-[50%]" />
          </motion.button>
          <PostList posts={posts} />
        </div>
      </div>
      <CreatePostModal
        show={showPostCreation}
        newPost={newPost}
        expiresIn={expiresIn}
        onChange={setNewPost}
        onExpiresChange={setExpiresIn}
        onSubmit={handleCreatePost}
        onClose={() => setShowPostCreation(false)}
      />
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
    </div>
  );
}
