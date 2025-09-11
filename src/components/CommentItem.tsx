import { motion } from 'framer-motion';
import { Comment } from '../api/commentsApi';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface CommentItemProps {
  comment: Comment;
  onReply?: (parentCommentId: number) => void;
  onDelete?: (commentId: number) => void;
  isDeleting?: boolean;
  level?: number; // For nested comments
}

export function CommentItem({ comment, onReply, onDelete, isDeleting, level = 0 }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const maxLevel = 3; // Maximum nesting level

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-8 mt-3' : 'mt-4'} ${level >= maxLevel ? 'opacity-75' : ''}`}
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
            <span className="text-neutral-400 text-xs">
              @{comment.author.username}
            </span>
            <span className="text-neutral-500 text-xs">·</span>
            <span className="text-neutral-500 text-xs">
              {formatTimeAgo(comment.timestamp)}
            </span>
          </div>

          <p className="text-white text-sm leading-relaxed mb-2">
            {comment.content}
          </p>

          <div className="flex items-center space-x-4 text-xs">
            {level < maxLevel && onReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-neutral-400 hover:text-blue-400 transition-colors"
              >
                Reply
              </button>
            )}

            {onDelete && (
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
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.length > 2 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-blue-400 text-xs mb-2 hover:underline"
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
            </button>
          )}

          {showReplies && comment.replies.map((reply: Comment) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isDeleting={isDeleting}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
