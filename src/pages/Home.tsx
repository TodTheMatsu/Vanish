
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Post {
  id: number;
  content: string;
  timestamp: Date;
  expiresIn: number; // hours
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [expiresIn, setExpiresIn] = useState(24); // default 24 hours

  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(currentPosts => 
        currentPosts.filter(post => {
          const expirationTime = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
          return Date.now() < expirationTime;
        })
      );
    }, 60000); // Check every minute

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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Home</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 border-b border-white/20 pb-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full p-4 bg-transparent border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500"
            placeholder="What's happening?"
            rows={3}
          />
          <div className="flex justify-between items-center mt-2">
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(Number(e.target.value))}
              className="bg-transparent border border-white/20 rounded px-2 py-1"
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
              className="p-4 border border-white/20 rounded-lg"
            >
              <p className="mb-2">{post.content}</p>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{new Date(post.timestamp).toLocaleString()}</span>
                <span>{timeLeft(post)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
