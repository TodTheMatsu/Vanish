import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '../types/user';
import { userApi } from '../api/userApi';

const defaultUser: UserProfile = {
  username: 'defaultUser',
  displayName: 'Default User',
  profilePicture: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif'
};

export const useUserData = (username?: string) => {
  const queryClient = useQueryClient();

  const {
    data: user = defaultUser,
    isLoading: loading,
    error,
    refetch: fetchUserData
  } = useQuery<UserProfile, Error>({
    queryKey: ['userData', username],
    queryFn: () => userApi.fetchUser(username),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: Partial<UserProfile>) => {
      await userApi.updateUser(updatedUser);
      return updatedUser;
    },
    onSuccess: (updatedData) => {
      // Update the cache with the new user data
      queryClient.setQueryData(['userData', username], (oldData: UserProfile) => ({
        ...oldData,
        ...updatedData
      }));
    },
  });

  const setUser = (updatedUser: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    const newUser = typeof updatedUser === 'function' ? updatedUser(user) : updatedUser;
    updateUserMutation.mutate(newUser);
  };

  return { 
    user, 
    setUser, 
    loading, 
    error: error?.message || null, 
    fetchUserData,
    isUpdating: updateUserMutation.isPending
  };
};