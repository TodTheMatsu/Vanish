import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoHomeSharp, 
  IoMailSharp, 
  IoSettingsSharp, 
  IoSearchSharp, 
  IoLogOutOutline,
  IoAddCircleOutline,
  IoPersonOutline,
  IoMenuOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchUsersModal from './SearchUsersModal';
import { supabase } from '../supabaseClient';
import { useUser } from '../UserContext';

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
  const [showSearch, setShowSearch] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);

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

  // Check if a navigation item is active
  const isActive = (path: string) => {
    if (path === '/home' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || 
           (path === `/profile/${user?.username}` && location.pathname.includes('/profile'));
  };

  // Toggle sidebar on mobile
  const toggleSidebar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <motion.button
          className="sidebar-toggle fixed top-4 left-4 z-50 bg-neutral-800 text-white p-2 rounded-full shadow-lg"
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
        </motion.button>
      )}
      
      {/* Sidebar */}
      <AnimatePresence>
        <motion.div 
          className={`sidebar h-screen flex flex-col justify-between items-center md:items-start p-4 shadow-lg z-40 overflow-y-auto bg-neutral-900 ${
            isMobile 
              ? isOpen 
                ? 'fixed top-0 left-0 w-64' 
                : 'hidden' 
              : 'relative w-64 min-w-[16rem] max-w-xs'
          }`}
          initial={isMobile ? { x: isOpen ? -240 : 0 } : { x: 0 }}
          animate={isMobile ? { x: isOpen ? 0 : -240 } : { x: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
        <div className="w-full">
          {/* App Logo */}
          <div className="mb-8 text-center w-full">
            <img 
              src="https://i.postimg.cc/KYC6M5vT/Vanish-Logo.png" 
              alt="Vanish Logo" 
              className={`${isMobile && !isOpen ? 'hidden' : 'block'} h-10 md:h-24 mx-auto object-contain`}
            />
          </div>
          
          {/* User Info - Only show when sidebar is open on mobile */}
          {(!isMobile || (isMobile && isOpen)) && (
            isLoading ? (
              <div className="flex items-center space-x-3 mb-8 w-full border border-neutral-800 p-3 rounded-xl">
                <div className="w-10 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
                <div className={`${isMobile ? (isOpen ? 'block' : 'hidden') : 'hidden md:block'} flex-1`}>
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
                <div className={`${isMobile ? (isOpen ? 'block' : 'hidden') : 'hidden md:block'} overflow-hidden`}>
                  <div className="font-bold text-white truncate">{user.displayName}</div>
                  <div className="text-sm text-neutral-400 truncate">@{user.username}</div>
                </div>
              </motion.div>
            )
          )}
          
          {/* Create Post Button - Only show when sidebar is open on mobile */}
          {(!isMobile || (isMobile && isOpen)) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (onCreatePost) {
                  onCreatePost();
                } else {
                  navigate('/home');
                }
                if (isMobile) setIsOpen(false);
              }}
              className="flex items-center justify-center md:justify-start space-x-2 text-white bg-blue-600 hover:bg-blue-700 w-full p-3 rounded-xl mb-8 transition-colors duration-200 font-medium"
            >
              <IoAddCircleOutline size={20} />
              <span className={`${isMobile ? (isOpen ? 'inline' : 'hidden') : 'hidden md:inline'}`}>Create Post</span>
            </motion.button>
          )}
           
          {/* Navigation - Only show when sidebar is open on mobile */}
          {(!isMobile || (isMobile && isOpen)) && (
            <div className="space-y-2 w-full mb-8">
              {/* Profile Button */}
              {user && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    goToProfile();
                    if (isMobile) setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 text-white cursor-pointer w-full p-3 rounded-xl transition-all duration-200 ${
                    isActive(`/profile/${user.username}`) 
                      ? 'bg-white/10 font-medium' 
                      : 'hover:bg-white/5'
                  }`}
                  aria-label="Go to profile"
                >
                  <IoPersonOutline size={20} />
                  <span className={`${isMobile ? (isOpen ? 'inline' : 'hidden') : 'hidden md:inline'}`}>Profile</span>
                  {isActive(`/profile/${user.username}`) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto mr-1"></div>
                  )}
                </motion.button>
              )}
              
              {/* Search Users Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setShowSearch(true);
                  if (isMobile) setIsOpen(false);
                }}
                className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/5 w-full p-3 rounded-xl transition-all duration-200"
                aria-label="Search users"
              >
                <IoSearchSharp size={20} />
                <span className={`${isMobile ? (isOpen ? 'inline' : 'hidden') : 'hidden md:inline'}`}>Search Users</span>
              </motion.button>
              
              {/* Navigation Items */}
              {navigationItems.map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onNavigate(item.path);
                    if (isMobile) setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 text-white cursor-pointer w-full p-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-white/10 font-medium' 
                      : 'hover:bg-white/5'
                  }`}
                  aria-label={item.label}
                >
                  <item.icon size={20} />
                  <span className={`${isMobile ? (isOpen ? 'inline' : 'hidden') : 'hidden md:inline'}`}>{item.label}</span>
                  {isActive(item.path) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto mr-1"></div>
                  )}
                </motion.button>
              ))}
              
              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onSettings();
                  if (isMobile) setIsOpen(false);
                }}
                className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/5 w-full p-3 rounded-xl transition-all duration-200"
                aria-label="Settings"
              >
                <IoSettingsSharp size={20} />
                <span className={`${isMobile ? (isOpen ? 'inline' : 'hidden') : 'hidden md:inline'}`}>Settings</span>
              </motion.button>
            </div>
          )}
        </div>
        
        {/* Logout Button at bottom - Only show when sidebar is open on mobile */}
          {(!isMobile || (isMobile && isOpen)) && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="flex items-center space-x-3 text-white cursor-pointer hover:bg-red-500/10 w-full p-3 rounded-xl transition-all duration-200 mt-auto"
              aria-label="Logout"
            >
              <IoLogOutOutline size={20} className="text-red-400" />
              <span className={`${isMobile ? (isOpen ? 'inline' : 'hidden') : 'hidden md:inline'} text-red-400`}>Logout</span>
            </motion.button>
          )}
      </motion.div>
      </AnimatePresence>
      
      {/* Sidebar overlay for mobile - only visible when sidebar is open */}
      {isMobile && isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Modals */}
      <SearchUsersModal show={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
