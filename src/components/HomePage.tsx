
import { useState } from 'react';
import { motion } from 'framer-motion';

interface Post {
  id: number;
  content: string;
  timestamp: Date;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      setPosts([
        { id: Date.now(), content: newPost, timestamp: new Date() },
        ...posts
      ]);
      setNewPost('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full p-4 bg-white/5 rounded-lg text-white resize-none"
            placeholder="What's on your mind?"
            rows={4}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-2 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            type="submit"
          >
            Post
          </motion.button>
        </form>

        <div className="space-y-4">
          {posts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 rounded-lg"
            >
              <p className="mb-2">{post.content}</p>
              <p className="text-sm text-gray-400">
                {post.timestamp.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
