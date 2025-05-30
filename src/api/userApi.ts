import { supabase } from '../supabaseClient';
import { UserProfile } from '../types/user';

export const userApi = {
  // Fetch user data by username or current authenticated user
  async fetchUser(username?: string): Promise<UserProfile> {
    let query = supabase
      .from('profiles')
      .select('user_id, username, display_name, profile_picture, bio, banner_url');

    if (username) {
      query = query.eq('username', username);
    } else {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        throw new Error("No authenticated user found.");
      }
      query = query.eq('user_id', authUser.id);
    }

    const { data: profile, error } = await query.single();

    if (error) {
      throw new Error(error.message);
    }

    if (!profile) {
      throw new Error("Profile not found");
    }

    return {
      username: profile.username,
      displayName: profile.display_name,
      profilePicture: profile.profile_picture || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif',
      bio: profile.bio || '',
      banner_url: profile.banner_url || ''
    };
  },

  // Update user profile
  async updateUser(updates: Partial<UserProfile>): Promise<void> {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser?.id) {
      throw new Error("User not found");
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        display_name: updates.displayName,
        profile_picture: updates.profilePicture,
        bio: updates.bio,
        banner_url: updates.banner_url
      })
      .eq('user_id', currentUser.id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Search users by username
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name, profile_picture, bio')
      .ilike('username', `%${searchTerm}%`)
      .limit(10);

    if (error) {
      throw new Error(error.message);
    }

    return data.map(profile => ({
      username: profile.username,
      displayName: profile.display_name,
      profilePicture: profile.profile_picture || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif',
      bio: profile.bio || '',
      banner_url: ''
    }));
  }
};