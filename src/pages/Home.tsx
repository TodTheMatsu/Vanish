
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoHomeSharp, IoMailSharp } from 'react-icons/io5';

interface Post {
  id: number;
  content: string;
  timestamp: Date;
  expiresIn: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24);

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
          expiresIn: expiresIn
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

  return (
    <div className="min-h-screen w-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-neutral-900 fixed h-screen flex flex-col items-center md:items-start p-4 space-y-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
        >
          <IoHomeSharp size={24} />
          <span className="hidden md:inline">Home</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 text-white hover:text-blue-500 w-full p-2 rounded"
        >
          <IoMailSharp size={24} />
          <span className="hidden md:inline">Private Messages</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="ml-16 md:ml-64 flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-8 bg-neutral-900 rounded-xl p-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500"
              placeholder="What's happening?"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
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

          <div className="space-y-4">
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all break-words"
              >
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
    </div>
  );
}
