import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export function useFollow(myUserId: string, targetUserId: string) {
  const queryClient = useQueryClient();

  // Query: Is following?
  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['isFollowing', myUserId, targetUserId],
    queryFn: async () => {
      if (!myUserId || !targetUserId) return false;
      const { data } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', myUserId)
        .eq('following_id', targetUserId)
        .single();
      return !!data;
    },
    enabled: !!myUserId && !!targetUserId,
  });

  // Mutation: Follow
  const followMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('followers')
        .insert([{ follower_id: myUserId, following_id: targetUserId }]);
      if (error && error.code !== '23505') throw error; // ignore duplicate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', myUserId, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followerCount', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followingCount', myUserId] });
    },
  });

  // Mutation: Unfollow
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', myUserId)
        .eq('following_id', targetUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', myUserId, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followerCount', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followingCount', myUserId] });
    },
  });

  return {
    isFollowing,
    isLoading,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    followPending: followMutation.isPending,
    unfollowPending: unfollowMutation.isPending,
  };
}

export function useFollowerCount(userId: string) {
  return useQuery({
    queryKey: ['followerCount', userId],
    queryFn: async () => {
      const { count } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      return count ?? 0;
    },
    enabled: !!userId,
  });
}

export function useFollowingCount(userId: string) {
  return useQuery({
    queryKey: ['followingCount', userId],
    queryFn: async () => {
      const { count } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);
      return count ?? 0;
    },
    enabled: !!userId,
  });
} 