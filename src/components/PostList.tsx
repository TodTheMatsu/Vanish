import { motion } from 'framer-motion';
import { Post } from '../hooks/usePosts';
import { Link } from 'react-router-dom';

interface PostListProps {
  posts: Post[];
}

const timeLeft = (post: Post) => {
  const expiration = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
  const hours = Math.max(0, Math.floor((expiration - Date.now()) / (1000 * 60 * 60)));
  return `${hours}h remaining`;
};

export function PostList({ posts }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all break-words"
        >
          <Link to={`/profile/${post.author.username}`} className="inline-flex items-center space-x-3 mb-4">
            <img 
              src={post.author.profilePicture} 
              alt="Profile" 
              className="w-8 h-8 rounded-full  object-cover" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif" }}
            />
            <div className="hover:underline hover:scale-105 transition-all duration-300">
              <span className="font-bold">{post.author.displayName}</span>
              <span className="text-neutral-400 text-sm ml-2">@{post.author.username}</span>
            </div>
          </Link>
          <div className="min-h-[50px] mb-4">
            <p className="text-lg whitespace-pre-wrap">
              {post.content.split(/(\s+)/).map((seg, i) => {
                // Check if the segment is an image/gif link.
                const imageRegex = /(https?:\/\/.*\.(?:png|jpe?g|gif|webp))/i;
                if (imageRegex.test(seg)) {
                  return (
                    <img 
                      key={i}
                      src={seg} 
                      alt="post media" 
                      className="my-2 max-w-full rounded-lg" 
                    />
                  );
                }
                return <span key={i}>{seg}</span>;
              })}
            </p>
          </div>
          <div className="flex justify-between text-sm text-neutral-400 mt-auto">
            <span>{post.timestamp.toLocaleString()}</span>
            <span className="font-bold text-blue-400">{timeLeft(post)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
