import { motion } from 'framer-motion';
import { IoHomeSharp, IoMailSharp, IoSettingsSharp } from 'react-icons/io5';
import { UserProfile } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { use } from 'motion/react-client';

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

  const goToProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  return (
    <div className="w-16 md:w-64 bg-neutral-900 fixed h-screen flex flex-col items-center md:items-start p-4">
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
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=default" }}
        />
        <div className="hidden md:block">
          <div className="font-bold">{user.displayName}</div>
          <div className="text-sm text-neutral-400">@{user.username}</div>
        </div>
      </motion.div>
      {/* Navigation */}
      <div className="space-y-4 w-full">
        {navigationItems.map((item) => (
          <motion.button
            key={item.path}
            whileHover={{ scale: 1.05 }}
            onClick={() => onNavigate(item.path)}
            className="flex items-center space-x-2 text-white cursor-pointer hover:text-blue-500 w-full p-2 rounded"
          >
            <item.icon size={24} />
            <span className="hidden md:inline">{item.label}</span>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onSettings}
          className="flex items-center space-x-2 text-white cursor-pointer hover:text-blue-500 w-full p-2 rounded"
        >
          <IoSettingsSharp size={24} />
          <span className="hidden md:inline">Settings</span>
        </motion.button>
      </div>
    </div>
  );
}
