
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoHomeSharp, IoMailSharp, IoSettingsSharp, IoCloseOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  displayName: string;
  profilePicture: string;
}

interface Post {
  id: number;
  content: string;
  timestamp: Date;
  expiresIn: number;
  author: User;
}

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User>({
    username: 'defaultUser',
    displayName: 'Default User',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(currentPosts => 
        currentPosts.filter(post => {
          const expirationTime = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
          return Date.now() < expirationTime;
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      setPosts([
        { 
          id: Date.now(), 
          content: newPost, 
          timestamp: new Date(),
          expiresIn: expiresIn,
          author: user
        },
        ...posts
      ]);
      setNewPost('');
    }
  };

  const timeLeft = (post: Post) => {
    const expirationTime = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
    const hours = Math.max(0, Math.floor((expirationTime - Date.now()) / (1000 * 60 * 60)));
    return `${hours}h remaining`;
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUser({ ...tempUser, displayName: e.target.value });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUser({ ...tempUser, profilePicture: e.target.value });
  };

  const [showPostCreation, setShowPostCreation] = useState(false);
  const [tempUser, setTempUser] = useState(user);

  const handleSaveSettings = () => {
    setUser(tempUser);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-neutral-900 fixed h-screen flex flex-col items-center md:items-start p-4">
        <div className="flex items-center space-x-3 mb-8 w-full">
          <img 
            src={user.profilePicture} 
            alt="Profile" 
            className="w-10 h-10 rounded-full"
          />
          <div className="hidden md:block">
            <div className="font-bold">{user.displayName}</div>
            <div className="text-sm text-neutral-400">@{user.username}</div>
          </div>
        </div>
        
        <div className="space-y-4 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/home')}
            className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
          >
            <IoHomeSharp size={24} />
            <span className="hidden md:inline">Home</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/messages')}
            className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
          >
            <IoMailSharp size={24} />
            <span className="hidden md:inline">Private Messages</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
          >
            <IoSettingsSharp size={24} />
            <span className="hidden md:inline">Settings</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-16 md:ml-64 flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPostCreation(true)}
            className="mb-8 w-full py-3 bg-blue-500 rounded-xl font-bold hover:bg-blue-600 flex items-center justify-center space-x-2"
          >
            <span>Create Post</span>
          </motion.button>

          <div className="space-y-4">
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all break-words"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={post.author.profilePicture} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <span className="font-bold">{post.author.displayName}</span>
                    <span className="text-neutral-400 text-sm ml-2">@{post.author.username}</span>
                  </div>
                </div>
                <div className="min-h-[50px] mb-4">
                  <p className="text-lg whitespace-pre-wrap">{post.content}</p>
                </div>
                <div className="flex justify-between text-sm text-neutral-400 mt-auto">
                  <span>{new Date(post.timestamp).toLocaleString()}</span>
                  <span className="font-bold text-blue-400">{timeLeft(post)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Post Creation Overlay */}
      <AnimatePresence>
        {showPostCreation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 rounded-xl p-6 max-w-2xl w-[90%] relative"
            >
              <button
                onClick={() => setShowPostCreation(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <IoCloseOutline size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-4">Create Post</h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
                setShowPostCreation(false);
              }}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500 mb-4"
                  placeholder="What's happening?"
                  rows={4}
                />
                <div className="flex justify-between items-center">
                  <select
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(Number(e.target.value))}
                    className="bg-neutral-800 border border-neutral-700 rounded-md px-2 py-1"
                  >
                    <option value={1}>1 hour</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                    <option value={72}>72 hours</option>
                    <option value={168}>1 week</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-blue-500 rounded-full font-bold hover:bg-blue-600"
                    type="submit"
                  >
                    Post
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 rounded-xl p-6 max-w-2xl w-[90%] relative"
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <IoCloseOutline size={24} />
              </button>
              
              <h1 className="text-3xl font-bold mb-6">Settings</h1>
              
              <div className="space-y-6">
                <div>
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full mb-4"
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
                    value={tempUser.displayName}
                    onChange={handleDisplayNameChange}
                    className="w-full p-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
                  <input
                    type="text"
                    value={tempUser.profilePicture}
                    onChange={handleProfilePictureChange}
                    className="w-full p-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveSettings}
                  className="w-full py-2 bg-blue-500 rounded-lg font-bold mt-4"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
