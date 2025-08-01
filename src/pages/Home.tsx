import { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PostList } from '../components/PostList';
import CreatePostModal from '../components/CreatePostModal';
import SettingsModal from '../components/SettingsModal';
import { usePosts } from '../hooks/usePosts';
import { useUser } from '../UserContext';
import { useSettings } from '../hooks/useSettings';
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, createPost } = usePosts();
  const { currentUser, updateUser } = useUser();
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(false);

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

  // Hide welcome message after 5 seconds, only once per session
  useEffect(() => {
    const hasWelcomed = sessionStorage.getItem('vanish-welcome-shown');
    if (!hasWelcomed) {
      setShowWelcome(true);
      sessionStorage.setItem('vanish-welcome-shown', 'true'); // Save immediately
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }
  }, []);

  // Check if it's the user's first time on this device
  useEffect(() => {
    if (!localStorage.getItem('hasVisitedApp')) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedApp', 'true');
    }
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

  useEffect(() => {
    if (location.state?.openCreatePost) {
      setShowPostCreation(true);
      // Clear the state so it doesn't trigger again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex flex-row relative max-h-screen overflow-hidden">

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

        <div className="flex overflow-y-scroll flex-col items-center justify-start p-4 pt-8 pb-14 md:pb-8 relative z-10">
          <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl flex flex-col items-center">
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
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="bg-neutral-900 rounded-xl p-8 max-w-md w-full text-center border border-blue-500 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Welcome to the App!</h2>
                <p className="mb-4 text-white">We're glad to have you here. You can personalize your profile and enable notifications in the settings menu at any time.</p>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
