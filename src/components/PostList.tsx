import { motion } from 'framer-motion';
import { Post } from '../hooks/usePosts';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { CommentSection } from './CommentSection';

interface PostListProps {
  posts: Post[];
}
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
    <Masonry
      className="w-auto flex"
      breakpointCols={{ default: 3, 768: 2, 480: 1 }}
      columnClassName="pl-4 background-clip-padding"
    >
      {posts.map(post => (
        <motion.div
          key={post.id}
          id={`post-${post.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 pt-4 mb-4 md:p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all break-words w-full max-w-full"
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
            <p className="text-lg whitespace-pre-wrap mb-4">
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
            
            {/* Display dedicated post image */}
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="w-full rounded-lg object-cover max-h-96" 
                loading="lazy"
              />
            )}
          </div>
          <div className="flex justify-between items-center text-sm text-neutral-400 mt-auto">
            <span>{post.timestamp.toLocaleString()}</span>
            <div className="flex items-center space-x-3">
              <span className="text-blue-400">{timeLeft(post)}</span>
            </div>
          </div>

          {/* Comments section */}
          <CommentSection postId={post.id} />
        </motion.div>
      ))}
    </Masonry>
  );
}
