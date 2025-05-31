import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IoHomeSharp, 
  IoMailSharp, 
  IoSettingsSharp, 
  IoSearchSharp, 
  IoLogOutOutline,
  IoAddCircleOutline,
  IoPersonOutline
} from 'react-icons/io5';
import { UserProfile } from '../types/user';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchUsersModal from './SearchUsersModal';
import { supabase } from '../supabaseClient';

interface SidebarProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
  onSettings: () => void;
}

const navigationItems = [
  { path: '/home', icon: IoHomeSharp, label: 'Home' },
  { path: '/messages', icon: IoMailSharp, label: 'Messages' },
];

export default function Sidebar({ user, onNavigate, onSettings }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToProfile = () => {
    navigate(`/profile/${user.username}`);
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
           (path.includes('/profile') && location.pathname.includes('/profile'));
  };

  return (
    <>
      <motion.div 
        className="w-16 md:w-64 lg:w-80 bg-neutral-900 fixed h-screen flex flex-col justify-between items-center md:items-start p-4 shadow-lg z-10 overflow-y-auto"
        initial={{ x: isCollapsed ? -60 : 0 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full">
          {/* App Logo/Name */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-xl font-bold text-white hidden md:block">Vanish</h1>
            <div className="md:hidden text-white text-2xl font-bold">V</div>
          </div>
          
          {/* User Info */}
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
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif" }}
            />
            <div className="hidden md:block overflow-hidden">
              <div className="font-bold text-white truncate">{user.displayName}</div>
              <div className="text-sm text-neutral-400 truncate">@{user.username}</div>
            </div>
          </motion.div>
          
          {/* Create Post Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/home')}
            className="flex items-center justify-center md:justify-start space-x-2 text-white bg-blue-600 hover:bg-blue-700 w-full p-3 rounded-xl mb-8 transition-colors duration-200 font-medium"
          >
            <IoAddCircleOutline size={20} />
            <span className="hidden md:inline">Create Post</span>
          </motion.button>
           
          {/* Navigation */}
          <div className="space-y-2 w-full mb-8">
            {/* Profile Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={goToProfile}
              className={`flex items-center space-x-3 text-white cursor-pointer w-full p-3 rounded-xl transition-all duration-200 ${
                isActive(`/profile/${user.username}`) 
                  ? 'bg-white/10 font-medium' 
                  : 'hover:bg-white/5'
              }`}
              aria-label="Go to profile"
            >
              <IoPersonOutline size={20} />
              <span className="hidden md:inline">Profile</span>
              {isActive(`/profile/${user.username}`) && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto mr-1"></div>
              )}
            </motion.button>
            
            {/* Search Users Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSearch(true)}
              className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/5 w-full p-3 rounded-xl transition-all duration-200"
              aria-label="Search users"
            >
              <IoSearchSharp size={20} />
              <span className="hidden md:inline">Search Users</span>
            </motion.button>
            
            {/* Navigation Items */}
            {navigationItems.map((item) => (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center space-x-3 text-white cursor-pointer w-full p-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'bg-white/10 font-medium' 
                    : 'hover:bg-white/5'
                }`}
                aria-label={item.label}
              >
                <item.icon size={20} />
                <span className="hidden md:inline">{item.label}</span>
                {isActive(item.path) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto mr-1"></div>
                )}
              </motion.button>
            ))}
            
            {/* Settings Button */}
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
          </div>
        </div>
        
        {/* Logout Button at bottom */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center space-x-3 text-white cursor-pointer hover:bg-red-500/10 w-full p-3 rounded-xl transition-all duration-200 mt-auto"
          aria-label="Logout"
        >
          <IoLogOutOutline size={20} className="text-red-400" />
          <span className="hidden md:inline text-red-400">Logout</span>
        </motion.button>
      </motion.div>
      
      {/* Sidebar overlay for mobile */}
      <div className="md:hidden fixed inset-0 bg-black/0 z-0 pointer-events-none"></div>
      
      {/* Modals */}
      <SearchUsersModal show={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
