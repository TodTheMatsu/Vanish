import { useState } from 'react';
import { CommentList } from './CommentList';
import { AddCommentForm } from './AddCommentForm';
import { useComments, useCommentCount } from '../hooks/useComments';
import { motion } from 'framer-motion';

interface CommentSectionProps {
  postId: number;
  initialCommentCount?: number;
}

export function CommentSection({ postId, initialCommentCount = 0 }: CommentSectionProps) {
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const { comments, isLoading, createComment, deleteComment, isCreatingComment, isDeletingComment } = useComments(postId);
  const { data: commentCount = initialCommentCount } = useCommentCount(postId);

  const handleCreateComment = async (content: string, parentCommentId?: number) => {
    await createComment({ postId, content, parentCommentId });
    setReplyingTo(null);
  };

  const handleReply = (parentCommentId: number) => {
    setReplyingTo(parentCommentId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  return (
    <div className="mt-4 border-t border-neutral-800 pt-4">
      {/* Comment toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors mb-3"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-sm">
          {commentCount === 0 ? 'No comments' : `${commentCount} comment${commentCount === 1 ? '' : 's'}`}
        </span>
      </button>

      {/* Add comment form (always visible when comments are shown) */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <AddCommentForm
            onSubmit={handleCreateComment}
            isSubmitting={isCreatingComment}
            placeholder="What are your thoughts?"
          />
        </motion.div>
      )}

      {/* Comments list */}
      {showComments && (
        <CommentList
          comments={comments}
          onReply={handleReply}
          onDelete={handleDeleteComment}
          isDeleting={isDeletingComment}
          isLoading={isLoading}
        />
      )}

      {/* Reply form */}
      {replyingTo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Reply to comment</h3>
            <AddCommentForm
              onSubmit={handleCreateComment}
              onCancel={handleCancelReply}
              isSubmitting={isCreatingComment}
              placeholder="Write your reply..."
              autoFocus={true}
              parentCommentId={replyingTo}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
