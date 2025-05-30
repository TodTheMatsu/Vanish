import { supabase } from '../supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '../types/user';

export interface Post {
  id: number;
  content: string;
  timestamp: Date;
  expiresIn: number;
  author: UserProfile;
}

const formatAndFilter = (postsData: any[]): Post[] => {
  return postsData
    .map(post => ({
      id: post.id,
      content: post.content,
      timestamp: new Date(post.timestamp),
      expiresIn: post.expires_in,
      author: {
        username: post.profiles?.username ?? 'unknown',
        displayName: post.profiles?.display_name ?? 'Unknown',
        profilePicture:
          post.profiles?.profile_picture ??
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif',
      },
    }))
    .filter(post => {
      const expireAt =
        post.timestamp.getTime() + post.expiresIn * 60 * 60 * 1000;
      return Date.now() < expireAt;
    });
};

export const usePosts = () => {
  const qc = useQueryClient();

  const {data: posts = [],isLoading,isError,refetch,} = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: raw, error } = await supabase
        .from('posts')
        .select(`
          id, content, timestamp, expires_in,
          profiles:profiles ( username, display_name, profile_picture )
        `)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return formatAndFilter(raw ?? []);
    },
    staleTime: 1000 * 60, // 1min
  });

  const createPostMutation = useMutation({
    mutationFn: async (input: { content: string; expiresIn: number }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newRaw, error } = await supabase
        .from('posts')
        .insert({
          content: input.content,
          timestamp: new Date().toISOString(),
          expires_in: input.expiresIn,
          author_id: user.id,
        })
        .select(`
          id, content, timestamp, expires_in,
          profiles ( username, display_name, profile_picture )
        `)
        .single();
      if (error) throw error;
      return formatAndFilter([newRaw])[0];
    },
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
