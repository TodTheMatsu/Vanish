import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types/user';

export interface Post {
  id: number;
  content: string;
  timestamp: Date;
  expiresIn: number;
  author: UserProfile;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id, content, timestamp, expires_in,
          profiles:profiles ( username, display_name, profile_picture )
        `)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      if (postsData) {
        const formatted = postsData.map((post: any) => ({
          id: post.id,
          content: post.content,
          timestamp: new Date(post.timestamp),
          expiresIn: post.expires_in,
          author: {
            username: post.profiles?.username || 'unknown',
            displayName: post.profiles?.display_name || 'Unknown',
            profilePicture: post.profiles?.profile_picture || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif'
          }
        })).filter(post => {
          const expiration = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
          return Date.now() < expiration;
        });
        setPosts(formatted);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const createPost = async (postData: { content: string; expiresIn: number }) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('No user found');
      const newPostData = {
        content: postData.content,
        timestamp: new Date().toISOString(),
        expires_in: postData.expiresIn,
        author_id: currentUser.id
      };
      const { data: post, error } = await supabase
        .from('posts')
        .insert(newPostData)
        .select(`
          *,
          profiles (
            username,
            display_name,
            profile_picture
          )
        `)
        .single();
      if (error) throw error;
      if (post) {
        const formatted = {
          id: post.id,
          content: post.content,
          timestamp: new Date(post.timestamp),
          expiresIn: post.expires_in,
          author: {
            username: post.profiles.username,
            displayName: post.profiles.display_name,
            profilePicture: post.profiles.profile_picture || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBleHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif'
          }
        };
        setPosts(prev => [formatted, ...prev].filter(post => {
          const expiration = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
          return Date.now() < expiration;
        }));
        return formatted;
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(posts => posts.filter(post => {
        const expiration = new Date(post.timestamp).getTime() + (post.expiresIn * 60 * 60 * 1000);
        return Date.now() < expiration;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return { posts, fetchPosts, createPost, setPosts };
};
