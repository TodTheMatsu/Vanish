import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoHomeSharp, IoMailSharp, IoSettingsSharp, IoSearchSharp } from 'react-icons/io5';
import { UserProfile } from '../types/user';
import { useNavigate } from 'react-router-dom';
import SearchUsersModal from './SearchUsersModal';

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
  const [showSearch, setShowSearch] = useState(false);

  const goToProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  return (
    <>
      <div className="w-16 md:w-80 bg-neutral-900 fixed h-screen flex flex-col items-center md:items-start p-4">
        {/* User Info */}
        <motion.div 
          className="flex items-center space-x-3 mb-8 w-full border-2 text-white border-neutral-800 p-2 rounded-lg hover:bg-neutral-800 transition duration-200 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={goToProfile}
        >
          <img 
            src={user.profilePicture} 
            alt="Profile" 
            className="w-10 h-10 object-cover rounded-full" 
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif" }}
          />
          <div className="hidden md:block">
            <div className="font-bold">{user.displayName}</div>
            <div className="text-sm text-neutral-400">@{user.username}</div>
          </div>
        </motion.div>
         
        {/* Navigation */}
        <div className="space-y-4 w-full">
          {/* Search Users Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowSearch(true)}
            className="flex items-center space-x-2 text-white cursor-pointer hover:bg-white/5 w-full p-2 rounded"
          >
            <IoSearchSharp size={24} />
            <span className="hidden md:inline">Search Users</span>
          </motion.button>
          {navigationItems.map((item) => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.05 }}
              onClick={() => onNavigate(item.path)}
              className="flex items-center space-x-2 text-white cursor-pointer hover:bg-white/5 w-full p-2 rounded"
            >
              <item.icon size={24} />
              <span className="hidden md:inline">{item.label}</span>
            </motion.button>
          ))}
          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={onSettings}
            className="flex items-center space-x-2 text-white cursor-pointer hover:bg-white/5 w-full p-2 rounded"
          >
            <IoSettingsSharp size={24} />
            <span className="hidden md:inline">Settings</span>
          </motion.button>
        </div>
      </div>
      <SearchUsersModal show={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
