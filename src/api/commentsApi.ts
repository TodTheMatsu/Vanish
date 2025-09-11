import { supabase } from '../supabaseClient';

export interface Comment {
  id: number;
  postId: number;
  content: string;
  timestamp: Date;
  author: {
    username: string;
    displayName: string;
    profilePicture: string;
  };
  parentCommentId?: number;
  replies?: Comment[];
}

export const commentsApi = {
  // Fetch comments for a specific post
  async fetchComments(postId: number): Promise<Comment[]> {
    const { data: raw, error } = await supabase
      .from('comments')
      .select('id, post_id, content, timestamp, parent_comment_id, author_id')
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Fetch profiles for all comment authors
    const authorIds = raw?.map(comment => comment.author_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, profile_picture')
      .in('user_id', authorIds);

    const profileMap = new Map(
      profiles?.map(profile => [profile.user_id, profile]) || []
    );

    const comments = raw?.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      content: comment.content,
      timestamp: new Date(comment.timestamp),
      parentCommentId: comment.parent_comment_id,
      author: {
        username: profileMap.get(comment.author_id)?.username ?? 'unknown',
        displayName: profileMap.get(comment.author_id)?.display_name ?? 'Unknown',
        profilePicture: profileMap.get(comment.author_id)?.profile_picture ??
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif',
      },
      replies: [] as Comment[],
    })) ?? [];

    // Fetch replies for each comment
    for (const comment of comments) {
      comment.replies = await this.fetchCommentReplies(comment.id);
    }

    return comments;
  },

  // Fetch replies for a specific comment
  async fetchCommentReplies(commentId: number): Promise<Comment[]> {
    const { data: raw, error } = await supabase
      .from('comments')
      .select('id, post_id, content, timestamp, parent_comment_id, author_id')
      .eq('parent_comment_id', commentId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    if (!raw || raw.length === 0) return [];

    // Fetch profiles for all reply authors
    const authorIds = raw.map(reply => reply.author_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, profile_picture')
      .in('user_id', authorIds);

    const profileMap = new Map(
      profiles?.map(profile => [profile.user_id, profile]) || []
    );

    return raw.map(reply => ({
      id: reply.id,
      postId: reply.post_id,
      content: reply.content,
      timestamp: new Date(reply.timestamp),
      parentCommentId: reply.parent_comment_id,
      author: {
        username: profileMap.get(reply.author_id)?.username ?? 'unknown',
        displayName: profileMap.get(reply.author_id)?.display_name ?? 'Unknown',
        profilePicture: profileMap.get(reply.author_id)?.profile_picture ??
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif',
      },
    }));
  },

  // Create a new comment
  async createComment(input: {
    postId: number;
    content: string;
    parentCommentId?: number;
  }): Promise<Comment> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newRaw, error } = await supabase
      .from('comments')
      .insert({
        post_id: input.postId,
        content: input.content,
        timestamp: new Date().toISOString(),
        author_id: user.id,
        parent_comment_id: input.parentCommentId || null,
      })
      .select('id, post_id, content, timestamp, parent_comment_id')
      .single();

    if (error) throw error;

    // Fetch the profile data separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, display_name, profile_picture')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.warn('Failed to fetch profile:', profileError);
    }

    return {
      id: newRaw.id,
      postId: newRaw.post_id,
      content: newRaw.content,
      timestamp: new Date(newRaw.timestamp),
      parentCommentId: newRaw.parent_comment_id,
      author: {
        username: profile?.username ?? 'unknown',
        displayName: profile?.display_name ?? 'Unknown',
        profilePicture: profile?.profile_picture ??
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif',
      },
    };
  },

  // Delete a comment
  async deleteComment(commentId: number): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', user.id);

    if (error) throw error;
  },

  // Get comment count for a post
  async getCommentCount(postId: number): Promise<number> {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  },
};
