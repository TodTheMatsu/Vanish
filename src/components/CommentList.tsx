import { CommentItem } from './CommentItem';
import { Comment } from '../api/commentsApi';

interface CommentListProps {
  comments: Comment[];
  onReply?: (parentCommentId: number) => void;
  onDelete?: (commentId: number) => void;
  isDeleting?: boolean;
  isLoading?: boolean;
}

export function CommentList({
  comments,
  onReply,
  onDelete,
  isDeleting,
  isLoading
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="mt-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-3">
            <div className="w-8 h-8 bg-neutral-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
              <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="mt-4 text-center py-8">
        <p className="text-neutral-400 text-sm">No comments yet.</p>
        <p className="text-neutral-500 text-xs mt-1">Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-1">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
