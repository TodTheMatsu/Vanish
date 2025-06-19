import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from './types/user';
import { userApi } from './api/userApi';
import { supabase } from './supabaseClient';

interface UserContextType {
  currentUser: UserProfile | undefined;
  userId: string | undefined; // Add user ID from auth
  isLoading: boolean;
  error: Error | null;
  refetchUser: () => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // Fetch the current authenticated user
  const {
    data: userData,
    isLoading,
    error,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        throw new Error('No authenticated user found');
      }
      const userProfile = await userApi.fetchUserById(authUser.id);
      return {
        profile: userProfile,
        userId: authUser.id
      };
    },
    enabled: true, // Re-enable the query
    staleTime: 1000 * 60 * 10, // 10 minutes - increase staleTime
    gcTime: 1000 * 60 * 15, // 15 minutes - keep in cache longer
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on every mount
    refetchInterval: false, // Disable automatic refetching
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  const currentUser = userData?.profile;
  const userId = userData?.userId;

  // Listen for auth state changes and refetch user data
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Refetch user data when signed in
        refetchUser();
      } else if (event === 'SIGNED_OUT') {
        // Clear user data when signed out
        queryClient.removeQueries({ queryKey: ['currentUser'] });
      }
    });

    return () => subscription.unsubscribe();
  }, [refetchUser, queryClient]);

  // Update user function
  const updateUser = async (updates: Partial<UserProfile>) => {
    await userApi.updateUser(updates);
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        userId,
        isLoading,
        error,
        refetchUser,
        updateUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};