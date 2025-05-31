import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from './types/user';
import { userApi } from './api/userApi';
import { supabase } from './supabaseClient';

interface UserContextType {
  currentUser: UserProfile | undefined;
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
    data: currentUser,
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
      return userApi.fetchUser();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

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