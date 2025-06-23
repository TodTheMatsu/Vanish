import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PostList } from '../components/PostList';
import CreatePostModal from '../components/CreatePostModal';
import SettingsModal from '../components/SettingsModal';
import { usePosts } from '../hooks/usePosts';
import { useUser } from '../UserContext';
import { useSettings } from '../hooks/useSettings';

export default function Home() {
  const navigate = useNavigate();
  const { posts, createPost } = usePosts();
  const { currentUser, updateUser } = useUser();
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(true);

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

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handlers for creating a post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    await createPost({ content: newPost, expiresIn });
    setNewPost('');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex flex-row relative overflow-hidden">
      <Sidebar
        onNavigate={path => navigate(path)}
        onSettings={() => {
          if (currentUser) {
            setTempUser(currentUser);
            setShowSettings(true);
          }
        }}
        onCreatePost={() => setShowPostCreation(true)}
      />
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-white/1 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Welcome Header */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 left-0 right-0 md:left-1/2 mx-auto z-30 p-4 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-sm w-[90%] md:max-w-4xl"
            >
              <h1 className="text-xl md:text-3xl font-bold text-white">
                {getGreeting()}, {currentUser?.displayName || 'User'}!
              </h1>
              <p className="text-sm md:text-base text-neutral-300 mt-2">
                Welcome back to Vanish. Share your thoughts that disappear in time.
              </p>
              <div className="flex items-center mt-3 text-xs md:text-sm text-neutral-400">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    getTimeOfDay() === 'morning' ? 'bg-white' :
                    getTimeOfDay() === 'afternoon' ? 'bg-neutral-300' :
                    getTimeOfDay() === 'evening' ? 'bg-neutral-400' : 'bg-neutral-500'
                  }`}></div>
                  <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-start p-4 pt-8 relative z-10">
          <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl flex flex-col items-center">
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8 w-full"
            >
              <div className="p-2 md:p-4 bg-neutral-900/50 rounded-lg md:rounded-xl border border-neutral-800 backdrop-blur-sm text-center">
                <div className="text-lg md:text-2xl font-bold text-white">{posts.length}</div>
                <div className="text-xs md:text-sm text-neutral-400">Posts</div>
              </div>
              <div className="p-2 md:p-4 bg-neutral-900/50 rounded-lg md:rounded-xl border border-neutral-800 backdrop-blur-sm text-center">
                <div className="text-lg md:text-2xl font-bold text-white">
                  {posts.filter(post => {
                    const expiration = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
                    return expiration > Date.now();
                  }).length}
                </div>
                <div className="text-xs md:text-sm text-neutral-400">Visible</div>
              </div>
              <div className="p-2 md:p-4 bg-neutral-900/50 rounded-lg md:rounded-xl border border-neutral-800 backdrop-blur-sm text-center">
                <div className="text-lg md:text-2xl font-bold text-white">
                  {new Set(posts.map(post => post.author.username)).size}
                </div>
                <div className="text-xs md:text-sm text-neutral-400">Users</div>
              </div>
            </motion.div>

            {/* Posts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full"
            >
              <div className="flex items-center justify-center md:justify-between mb-6 w-full">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-200">Recent Posts</h2>
                {posts.length === 0 && (
                  <span className="text-sm text-neutral-500 hidden md:block">No posts yet</span>
                )}
              </div>
              {posts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 px-8 w-full"
                >
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-neutral-300 mb-2">No posts yet</h3>
                  <p className="text-neutral-500 mb-6">Be the first to share something that vanishes in time!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPostCreation(true)}
                    className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-neutral-200 transition-all duration-200 shadow-lg"
                  >
                    Create Your First Post
                  </motion.button>
                </motion.div>
              ) : (
                <PostList posts={posts} />
              )}
            </motion.div>

            {/* Floating Action Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPostCreation(true)}
              className="hidden md:flex fixed bottom-8 right-8 md:right-24 w-16 h-16 bg-white rounded-full shadow-2xl hover:shadow-white/25 items-center justify-center z-50 border border-neutral-300 cursor-pointer"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{type: "spring", stiffness: 200 }}
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </motion.button>
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
    </div>
  );
}
