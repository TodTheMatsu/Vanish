import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoHomeSharp, 
  IoMailSharp, 
  IoSettingsSharp, 
  IoLogOutOutline,
  IoAddCircleOutline,
  IoPersonOutline,
  IoMenuOutline,
  IoSearchSharp
} from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../UserContext';
import SearchUsersModal from './SearchUsersModal';

interface SidebarProps {
  onNavigate: (path: string) => void;
  onSettings: () => void;
  onCreatePost?: () => void;
}

const navigationItems = [
  { path: '/home', icon: IoHomeSharp, label: 'Home' },
  { path: '/messages', icon: IoMailSharp, label: 'Messages' },
];

export default function Sidebar({ onNavigate, onSettings, onCreatePost }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser: user, isLoading } = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar when resizing to mobile
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile && isOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isOpen]);

  const goToProfile = () => {
    if (user) {
      navigate(`/profile/${user.username}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handler for Create Post button (navigates to /home and opens modal)
  const handleCreatePost = () => {
    navigate('/home', { state: { openCreatePost: true } });
  };

  // Check if a navigation item is active
  const isActive = (path: string) => {
    if (path === '/home' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || 
           (path === `/profile/${user?.username}` && location.pathname.includes('/profile'));
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 flex justify-around items-center h-16 md:hidden">
          <button
            onClick={() => onNavigate('/home')}
            className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/home') ? 'text-blue-500' : 'text-white'}`}
            aria-label="Home"
          >
            <IoHomeSharp size={24} />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => onNavigate('/messages')}
            className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/messages') ? 'text-blue-500' : 'text-white'}`}
            aria-label="Messages"
          >
            <IoMailSharp size={24} />
            <span className="text-xs">Messages</span>
          </button>
          {/* Centered Post Button */}
          <div className="relative flex-1 flex justify-center items-center h-full">
            <button
              onClick={handleCreatePost}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg border-4 border-neutral-900 w-14 h-14 flex flex-col items-center justify-center z-10"
              aria-label="Create Post"
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)' }}
            >
              <IoAddCircleOutline size={32} />
            </button>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-white"
            aria-label="Search"
          >
            <IoSearchSharp size={24} />
            <span className="text-xs">Search</span>
          </button>
          <button
            onClick={() => setShowDrawer(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-white"
            aria-label="Menu"
          >
            <IoMenuOutline size={28} />
            <span className="text-xs">Menu</span>
          </button>
        </nav>
      )}
      {/* Mobile Drawer for Profile/Settings */}
      <AnimatePresence>
        {isMobile && showDrawer && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDrawer(false)} />
            <div className="relative w-full bg-neutral-900 rounded-t-2xl p-6 pb-10 border-t border-neutral-800 shadow-2xl">
              <div className="flex flex-col items-center mb-6">
                {isLoading ? (
                  <div className="w-16 h-16 bg-neutral-800 rounded-full animate-pulse mb-2" />
                ) : user && (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-16 h-16 object-cover rounded-full shadow-md mb-2"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif'; }}
                  />
                )}
                <div className="font-bold text-white text-lg">{user?.displayName}</div>
                <div className="text-sm text-neutral-400">@{user?.username}</div>
              </div>
              <button
                onClick={() => { setShowDrawer(false); if (user) onNavigate(`/profile/${user.username}`); }}
                className="w-full py-3 bg-neutral-800 rounded-xl font-bold text-white mb-3 text-lg flex items-center justify-center"
              >
                <IoPersonOutline className="inline mr-2" /> Profile
              </button>
              <button
                onClick={() => { setShowDrawer(false); onSettings(); }}
                className="w-full py-3 bg-blue-500 rounded-xl font-bold text-white mb-3 text-lg flex items-center justify-center"
              >
                <IoSettingsSharp className="inline mr-2" /> Settings
              </button>
              <button
                onClick={async () => { setShowDrawer(false); await handleLogout(); }}
                className="w-full py-3 bg-transparent border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors text-lg flex items-center justify-center"
              >
                <IoLogOutOutline className="inline mr-2" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <AnimatePresence>
          <motion.div 
            className={`sidebar h-screen flex flex-col justify-between items-center md:items-start p-4 shadow-lg z-40 overflow-y-auto bg-neutral-900 relative w-64 min-w-[16rem] max-w-xs`}
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Top: Logo and User Info */}
            <div className="w-full">
              {/* App Logo */}
              <div className="mb-8 text-center w-full">
                <img 
                  src="https://i.postimg.cc/KYC6M5vT/Vanish-Logo.png" 
                  alt="Vanish Logo" 
                  className="h-10 md:h-24 mx-auto object-contain"
                />
              </div>
              {/* User Info */}
              {isLoading ? (
                <div className="flex items-center space-x-3 mb-8 w-full border border-neutral-800 p-3 rounded-xl">
                  <div className="w-10 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-800 w-24 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-neutral-800 w-16 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : user && (
                <motion.div 
                  className="flex items-center space-x-3 mb-8 w-full border border-neutral-800 p-3 rounded-xl hover:bg-neutral-800/50 transition duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToProfile}
                >
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-10 h-10 object-cover rounded-full shadow-md" 
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif" }}
                  />
                  <div className="overflow-hidden">
                    <div className="font-bold text-white truncate">{user.displayName}</div>
                    <div className="text-sm text-neutral-400 truncate">@{user.username}</div>
                  </div>
                </motion.div>
              )}
              {/* Divider */}
              <div className="border-b border-neutral-800 my-4" />
              {/* Main Navigation */}
              <div className="space-y-2 mb-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('/home')}
                  className={`flex items-center space-x-3 text-white cursor-pointer w-full p-3 rounded-xl transition-all duration-200 ${isActive('/home') ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
                  aria-label="Home"
                >
                  <IoHomeSharp size={20} />
                  <span className="hidden md:inline">Home</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate('/messages')}
                  className={`flex items-center space-x-3 text-white cursor-pointer w-full p-3 rounded-xl transition-all duration-200 ${isActive('/messages') ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
                  aria-label="Messages"
                >
                  <IoMailSharp size={20} />
                  <span className="hidden md:inline">Messages</span>
                </motion.button>
              </div>
              {/* Divider */}
              <div className="border-b border-neutral-800 my-4" />
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSearch(true)}
                className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/5 w-full p-3 rounded-xl transition-all duration-200 mb-4"
                aria-label="Search users"
              >
                <IoSearchSharp size={20} />
                <span className="hidden md:inline">Search Users</span>
              </motion.button>
              {/* Create Post Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreatePost}
                className="flex items-center justify-center md:justify-start space-x-2 text-white bg-blue-600 hover:bg-blue-700 w-full p-3 rounded-xl mb-8 transition-colors duration-200 font-medium"
                aria-label="Create Post"
              >
                <IoAddCircleOutline size={20} />
                <span className="hidden md:inline">Create Post</span>
              </motion.button>
            </div>
            {/* Bottom: Settings and Logout */}
            <div className="w-full mt-auto space-y-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSettings}
                className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/5 w-full p-3 rounded-xl transition-all duration-200"
                aria-label="Settings"
              >
                <IoSettingsSharp size={20} />
                <span className="hidden md:inline">Settings</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="flex items-center space-x-3 text-white cursor-pointer hover:bg-red-500/10 w-full p-3 rounded-xl transition-all duration-200"
                aria-label="Logout"
              >
                <IoLogOutOutline size={20} className="text-red-400" />
                <span className="hidden md:inline text-red-400">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* Modals */}
      <SearchUsersModal show={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
