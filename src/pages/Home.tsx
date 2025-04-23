import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Sidebar from '../components/Sidebar';
import { PostList } from '../components/PostList';
import CreatePostModal from '../components/CreatePostModal';
import SettingsModal from '../components/SettingsModal';
import { usePosts } from '../hooks/usePosts';
import { useUserData } from '../hooks/useUserData';
import { supabase } from '../supabaseClient';

export default function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { posts, createPost } = usePosts();
  const { user, setUser } = useUserData();
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUser, setTempUser] = useState(user);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Handlers for creating a post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    await createPost({ content: newPost, expiresIn });
    setNewPost('');
  };

  // Handlers for settings changes
  const handleUsernameChange = (val: string) => {
    // Validate username: only lowercase letters and numbers allowed.
    const allowedRegex = /^[a-z0-9]*$/;
    if (!allowedRegex.test(val)) {
      setSettingsError('Username must only contain lowercase letters and numbers. No spaces or special characters.');
    } else {
      setSettingsError('');
    }
    setTempUser(prev => ({ ...prev, username: val }));
  };

  const handleDisplayNameChange = (val: string) =>
    setTempUser(prev => ({ ...prev, displayName: val }));
  const handleProfilePictureChange = (val: string) =>
    setTempUser(prev => ({ ...prev, profilePicture: val }));
  
  const handleSaveSettings = async () => {
    setIsSettingsLoading(true);
    if (!/^[a-z0-9]+$/.test(tempUser.username)) {
      setSettingsError('Username must only contain lowercase letters and numbers. No spaces or special characters.');
      setIsSettingsLoading(false);
      return;
    }
    try {
      // Get current user to retrieve id.
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) {
        setSettingsError("User not found");
        setIsSettingsLoading(false);
        return;
      }
      // Update the profiles table with new settings.
      const { error } = await supabase
        .from('profiles')
        .update({
          username: tempUser.username,
          display_name: tempUser.displayName,
          profile_picture: tempUser.profilePicture
        })
        .eq('user_id', currentUser.id);
      if (error) {
        setSettingsError(error.message);
      } else {
        setUser(tempUser);
        setShowSettings(false);
      }
    } catch (error) {
      setSettingsError('Error updating settings');
      console.error('Settings update error:', error);
    } finally {
      setIsSettingsLoading(false);
    }
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
        <div className="max-w-2xl mx-auto">
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
        onLogout={async () => {
          await logout();
          navigate('/');
        }}
      />
    </div>
  );
}
