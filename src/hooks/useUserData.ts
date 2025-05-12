import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types/user';

const defaultUser: UserProfile = {
  username: 'defaultUser',
  displayName: 'Default User',
  profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
};

export const useUserData = (username?: string) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('profiles')
        .select('user_id, username, display_name, profile_picture, bio, banner_url');

      if (username) {
        query = query.eq('username', username);
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setError("No authenticated user found.");
          setLoading(false);
          return;
        }
        // Instead of matching by email, match on the user_id from auth.users.
        query = query.eq('user_id', authUser.id);
      }

      const { data: profile, error: profileError } = await query.single();

      if (profileError) {
        setError(profileError.message);
      }

      if (profile) {
        const userData: UserProfile = {
          username: profile.username,
          displayName: profile.display_name,
          profilePicture: profile.profile_picture || defaultUser.profilePicture,
          bio: profile.bio || '',
          banner_url: profile.banner_url || ''
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [username]);

  return { user, setUser, loading, error, fetchUserData };
};
