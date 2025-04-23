import { useState } from 'react';
import { motion } from 'framer-motion';

interface User {
  username: string;
  displayName: string;
  profilePicture: string;
}

export default function Settings() {
  const [user, setUser] = useState<User>({
    username: 'defaultUser',
    displayName: 'Default User',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  });

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, displayName: e.target.value });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, profilePicture: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto bg-neutral-900 rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div>
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              className="w-24 h-24 rounded-full mb-4" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=default" }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full p-2 bg-neutral-800 rounded-lg text-neutral-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={user.displayName}
              onChange={handleDisplayNameChange}
              className="w-full p-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
            <input
              type="text"
              value={user.profilePicture}
              onChange={handleProfilePictureChange}
              className="w-full p-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 bg-blue-500 rounded-lg font-bold mt-4"
          >
            Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );
}
