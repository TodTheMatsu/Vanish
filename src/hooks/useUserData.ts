import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User } from './usePosts';

const defaultUser: User = {
  username: 'defaultUser',
  displayName: 'Default User',
  profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
};

export const useUserData = () => {
  const [user, setUser] = useState<User>(defaultUser);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, profile_picture')
        .eq('email', authUser.email)
        .single();
      if (profile) {
        const userData = {
          username: profile.username,
          displayName: profile.display_name,
          profilePicture: profile.profile_picture || defaultUser.profilePicture
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return { user, setUser, fetchUserData };
};
