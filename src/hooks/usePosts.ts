import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface User {
  username: string;
  displayName: string;
  profilePicture: string;
}

export interface Post {
  id: number;
  content: string;
  timestamp: Date;
  expiresIn: number;
  author: User;
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
            profilePicture: post.profiles?.profile_picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
          }
        }));
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
            profilePicture: post.profiles.profile_picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
          }
        };
        setPosts(prev => [formatted, ...prev]);
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
