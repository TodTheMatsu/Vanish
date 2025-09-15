import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment, commentsApi } from '../api/commentsApi';
import StaleTime from '../constants/staletime.ts';

export const useComments = (postId: number) => {
  const qc = useQueryClient();

  const { data: comments = [], isLoading, isError, refetch } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.fetchComments(postId),
    staleTime: StaleTime.OneMinute,
    enabled: !!postId,
  });

  const createCommentMutation = useMutation({
    mutationFn: commentsApi.createComment,
    onSuccess: (newComment) => {
      // Update the comments cache
      qc.setQueryData<Comment[]>(['comments', postId], (prev) => {
        if (!prev) return [newComment];

        // Helper function to recursively find and update parent comment
        const updateReplies = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === newComment.parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
              };
            }
            // Recursively check replies
            if (comment.replies) {
              return {
                ...comment,
                replies: updateReplies(comment.replies),
              };
            }
            return comment;
          });
        };

        // If it's a reply, add it to the parent comment's replies
        if (newComment.parentCommentId) {
          return updateReplies(prev);
        }

        // Otherwise, add as a top-level comment
        return [...prev, newComment];
      });

      // Update the comment count cache
      qc.setQueryData<number>(['commentCount', postId], (prev) => (prev || 0) + 1);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: commentsApi.deleteComment,
    onSuccess: (_, deletedCommentId) => {
      // Update the comments cache
      qc.setQueryData<Comment[]>(['comments', postId], (prev) => {
        if (!prev) return [];

        // Helper function to recursively find and remove comment
        const removeComment = (comments: Comment[]): Comment[] => {
          return comments
            .map(comment => {
              // Remove from replies if it's a reply
              if (comment.replies) {
                comment.replies = removeComment(comment.replies);
              }
              return comment;
            })
            .filter(comment => comment.id !== deletedCommentId); // Remove top-level comment
        };

        return removeComment(prev);
      });

      // Update the comment count cache
      qc.setQueryData<number>(['commentCount', postId], (prev) => Math.max(0, (prev || 0) - 1));
    },
  });

  return {
    comments,
    isLoading,
    isError,
    refetch,
    createComment: createCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    isCreatingComment: createCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
};

export const useCommentCount = (postId: number) => {
  return useQuery<number>({
    queryKey: ['commentCount', postId],
    queryFn: () => commentsApi.getCommentCount(postId),
    staleTime: StaleTime.TwoMinutes,
    enabled: !!postId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
