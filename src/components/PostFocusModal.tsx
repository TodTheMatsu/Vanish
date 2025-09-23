import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '../hooks/usePosts';
import { CommentSection } from './CommentSection';
import { IoClose, IoTimeOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

interface PostFocusModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostFocusModal({ post, isOpen, onClose }: PostFocusModalProps) {

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!post) return null;

  const timeLeft = () => {
    const expiration = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
    const hours = Math.max(0, Math.floor((expiration - Date.now()) / (1000 * 60 * 60)));
    return `${hours}h remaining`;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 rounded-xl border border-neutral-700 w-full max-w-7xl h-[95vh] sm:h-[90vh] md:h-[85vh] overflow-hidden flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-neutral-800/80 hover:bg-neutral-700/80 rounded-full text-white transition-colors"
            >
              <IoClose size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Post content - Left side on desktop */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0"
                 onClick={(e) => e.stopPropagation()}>
              {/* Post header */}
              <div className="p-3 sm:p-4 lg:p-6 border-b border-neutral-700 flex-shrink-0">
                <Link
                  to={`/profile/${post.author.username}`}
                  className="inline-flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={post.author.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white hover:underline text-sm sm:text-base block truncate">{post.author.displayName}</span>
                    <span className="text-neutral-400 text-xs sm:text-sm">@{post.author.username}</span>
                  </div>
                </Link>
              </div>

              {/* Post content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 min-h-0">
                <div className="max-w-none lg:max-w-2xl mx-auto">
                  {/* Post text */}
                  <div className="mb-4 lg:mb-6">
                    <p className="text-base sm:text-lg lg:text-xl leading-relaxed whitespace-pre-wrap text-white">
                      {post.content.split(/(\s+)/).map((seg, i) => {
                        const imageRegex = /(https?:\/\/.*\.(?:png|jpe?g|gif|webp))/i;
                        if (imageRegex.test(seg)) {
                          return (
                            <img
                              key={i}
                              src={seg}
                              alt="post media"
                              className="my-2 sm:my-3 max-w-full rounded-lg shadow-lg"
                            />
                          );
                        }
                        return <span key={i}>{seg}</span>;
                      })}
                    </p>
                  </div>

                  {/* Dedicated post image */}
                  {post.imageUrl && (
                    <div className="mb-4 lg:mb-6">
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="w-full rounded-lg shadow-lg max-h-64 sm:max-h-80 lg:max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Post metadata */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-400 border-t border-neutral-700 pt-3 sm:pt-4">
                    <span>{post.timestamp.toLocaleString()}</span>
                    <div className="flex items-center space-x-2">
                      <IoTimeOutline size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-blue-400">{timeLeft()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments section - Right side on desktop, bottom on mobile */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-neutral-700 flex flex-col min-h-0"
                 onClick={(e) => e.stopPropagation()}>
              <div className="p-3 sm:p-4 border-b border-neutral-700 flex-shrink-0">
                <h3 className="text-base sm:text-lg font-semibold text-white">Comments</h3>
              </div>
              <div className="flex-1 px-10 overflow-hidden min-h-0">
                <CommentSection postId={post.id} showAllComments={true} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}