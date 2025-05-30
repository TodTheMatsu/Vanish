import { supabase } from '../supabaseClient';
import { Post } from '../hooks/usePosts';

export const postsApi = {
  // Fetch all posts
  async fetchPosts(): Promise<Post[]> {
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

  // Create a new post
  async createPost(input: { content: string; expiresIn: number }): Promise<Post> {
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

  // Fetch posts by username
  async fetchPostsByUsername(username: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, content, timestamp, expires_in,
        profiles:profiles ( username, display_name, profile_picture )
      `)
      .eq('profiles.username', username)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return formatAndFilter(data ?? []);
  }
};

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
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif',
      },
    }))
    .filter(post => {
      const expireAt =
        post.timestamp.getTime() + post.expiresIn * 60 * 60 * 1000;
      return Date.now() < expireAt;
    });
};