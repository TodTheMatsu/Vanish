import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '../types/user';
import { postsApi } from '../api/postsApi';
import StaleTime from '../constants/staletime.ts';
export interface Post {
  id: number;
  content: string;
  timestamp: Date;
  expiresIn: number;
  author: UserProfile;
}

export const usePosts = () => {
  const qc = useQueryClient();

  const {data: posts = [],isLoading,isError,refetch,} = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: postsApi.fetchPosts,
    staleTime: StaleTime.OneMinute,
  });

  const createPostMutation = useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: newPost => {
      qc.setQueryData<Post[]>(['posts'], prev =>
        [newPost, ...(prev ?? [])].filter(p => {
          const expireAt = p.timestamp.getTime() + p.expiresIn * 60 * 60 * 1000;
          return Date.now() < expireAt;
        })
      );
    },
  });

  return {
    posts,
    isLoading,
    isError,
    refetch,
    createPost: createPostMutation.mutateAsync,
  };
};

// Hook for fetching posts by username
export const usePostsByUsername = (username: string) => {
  return useQuery<Post[]>({
    queryKey: ['posts', 'user', username],
    queryFn: () => postsApi.fetchPostsByUsername(username),
    staleTime: StaleTime.TwoMinutes,
    enabled: !!username,
  });
};