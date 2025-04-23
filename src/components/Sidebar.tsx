import { motion } from 'framer-motion';
import { IoHomeSharp, IoMailSharp, IoSettingsSharp } from 'react-icons/io5';

interface SidebarProps {
  user: { profilePicture: string; displayName: string; username: string };
  onNavigate: (path: string) => void;
  onSettings: () => void;
}

export default function Sidebar({ user, onNavigate, onSettings }: SidebarProps) {
  return (
    <div className="w-16 md:w-64 bg-neutral-900 fixed h-screen flex flex-col items-center md:items-start p-4">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-8 w-full">
        <img src={user.profilePicture} alt="Profile" className="w-10 h-10 object-cover rounded-full" />
        <div className="hidden md:block">
          <div className="font-bold">{user.displayName}</div>
          <div className="text-sm text-neutral-400">@{user.username}</div>
        </div>
      </div>
      {/* Navigation */}
      <div className="space-y-4 w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => onNavigate('/home')}
          className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
        >
          <IoHomeSharp size={24} />
          <span className="hidden md:inline">Home</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => onNavigate('/messages')}
          className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
        >
          <IoMailSharp size={24} />
          <span className="hidden md:inline">Messages</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onSettings}
          className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
        >
          <IoSettingsSharp size={24} />
          <span className="hidden md:inline">Settings</span>
        </motion.button>
      </div>
    </div>
  );
}
