import { motion } from 'framer-motion';
import { Comment } from '../api/commentsApi';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { supabase } from '../supabaseClient';

interface CommentItemProps {
  comment: Comment;
  onReply?: (parentCommentId: number, replyingToAuthor: { username: string; displayName: string }) => void;
  onDelete?: (commentId: number) => void;
  isDeleting?: boolean;
  level?: number; // For visual indentation
  parentAuthor?: {
    username: string;
    displayName: string;
  };
}

export function CommentItem({ comment, onReply, onDelete, isDeleting, level = 0, parentAuthor }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false); // Start collapsed
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getTotalRepliesCount = (replies: Comment[]): number => {
    return replies.reduce((count, reply) => count + 1 + getTotalRepliesCount(reply.replies || []), 0);
  };

  const totalRepliesCount = comment.replies ? getTotalRepliesCount(comment.replies) : 0;

  const indentClass = level === 0 ? 'mt-4' : level === 1 ? 'ml-6 mt-2' : 'mt-2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={indentClass}
    >
      <div className="flex space-x-3">
        <Link to={`/profile/${comment.author.username}`}>
          <img
            src={comment.author.profilePicture}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif";
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              to={`/profile/${comment.author.username}`}
              className="font-semibold text-white hover:underline text-sm"
            >
              {comment.author.displayName}
            </Link>
            <span className="text-neutral-500 text-xs">
              {formatTimeAgo(comment.timestamp)}
            </span>
          </div>

          {parentAuthor && (
            <div className="text-neutral-400 text-xs mb-2">
              replying to <Link to={`/profile/${parentAuthor.username}`} className="hover:underline">{parentAuthor.displayName}</Link>
            </div>
          )}

          <p className="text-white text-sm leading-relaxed mb-2">
            {comment.content}
          </p>

          <div className="flex items-center space-x-4 text-xs">
            {level === 0 && comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-neutral-400 hover:text-blue-400 transition-colors flex items-center space-x-1"
              >
                {showReplies ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
                <span>{showReplies ? 'Hide' : 'Show'} {totalRepliesCount} {totalRepliesCount === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}
            {onReply && (
              <button
                onClick={() => onReply(comment.id, {
                  username: comment.author.username,
                  displayName: comment.author.displayName
                })}
                className="text-neutral-400 hover:text-blue-400 transition-colors"
              >
                Reply
              </button>
            )}
            {onDelete && currentUserId === comment.author.userId && (
              <button
                onClick={() => onDelete(comment.id)}
                disabled={isDeleting}
                className="text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (level === 0 ? showReplies : true) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1"
        >
          {comment.replies.map((reply: Comment) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isDeleting={isDeleting}
              level={level + 1}
              parentAuthor={comment.author}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
