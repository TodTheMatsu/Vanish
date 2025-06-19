import { supabase } from '../supabaseClient';

export interface SendMessageData {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  expirationHours?: number; // Default to app setting
  replyTo?: string;
}

export interface CreateConversationData {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string; // Required for group chats
  expirationHours?: number; // For auto-dissolving groups
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  expires_at: string;
  read_by: Record<string, string>;
  screenshot_detected: boolean;
  edited_at?: string;
  reply_to?: string;
  sender?: {
    id: string;
    username: string;
    display_name: string;
    profile_picture: string;
  };
  reply_to_message?: {
    id: string;
    content: string;
    sender?: {
      username: string;
      display_name: string;
    };
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  created_at: string;
  expires_at?: string;
  created_by: string;
  last_message_at: string;
  conversation_participants: Array<{
    id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    left_at?: string;
    user: {
      id: string;
      username: string;
      display_name: string;
      profile_picture: string;
    };
  }>;
}

export interface ConversationPermissions {
  isParticipant: boolean;
  isAdmin: boolean;
  role: 'admin' | 'member';
}

export const messagesApi = {
  /**
   * Fetch all conversations for the current user using secure Edge Function
   */
  async fetchConversations(_userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-conversations', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching conversations via Edge Function:', error);
      throw error;
    }
  },

  /**
   * Fetch messages for a specific conversation using secure Edge Function
   */
  async fetchMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-messages', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: { 
          conversationId: conversationId, 
          limit, 
          offset 
        }
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching messages via Edge Function:', error);
      throw error;
    }
  },

  /**
   * Send a new message to a conversation using secure Edge Function
   */
  async sendMessage(messageData: SendMessageData, _userId: string): Promise<Message> {
    try {
      const { data, error } = await supabase.functions.invoke('send-message', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: {
          conversationId: messageData.conversationId,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          expirationHours: messageData.expirationHours || 24,
          replyTo: messageData.replyTo || null
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error sending message via Edge Function:', error);
      throw error;
    }
  },

  /**
   * Create a new conversation with participants
   * RLS ensures proper permissions are enforced
   */
  async createConversation(conversationData: CreateConversationData): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Start transaction by creating conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([{
        type: conversationData.type,
        name: conversationData.name,
        created_by: user.id,
        expires_at: conversationData.expirationHours 
          ? new Date(Date.now() + conversationData.expirationHours * 60 * 60 * 1000).toISOString()
          : null
      }])
      .select()
      .single();

    if (convError) throw convError;

    // Add participants (creator as admin, others as members)
    const participants = [
      {
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'admin'
      },
      ...conversationData.participantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: 'member' as const
      }))
    ];

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) throw participantsError;

    // Fetch the complete conversation with participants
    const { data: completeConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation.id)
      .single();

    if (fetchError) throw fetchError;

    // Get participants for this conversation
    const { data: conversationParticipants, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversation.id)
      .is('left_at', null);

    if (partError) throw partError;

    // Get user profiles for participants
    const userIds = conversationParticipants?.map(p => p.user_id) || [];
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    if (profileError) throw profileError;

    // Transform the data to match our expected structure
    const finalConversation = {
      ...completeConversation,
      conversation_participants: (conversationParticipants || []).map(participant => ({
        ...participant,
        user: (profiles || []).find(profile => profile.user_id === participant.user_id) || {
          id: participant.user_id,
          username: 'Unknown',
          display_name: 'Unknown User',
          profile_picture: ''
        }
      }))
    };

    return finalConversation;
  },

  /**
   * Mark a message as read by the current user
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    if (!userId) throw new Error('User ID is required');

    const { data: message } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();

    if (!message) return;

    const readBy = message.read_by || {};
    readBy[userId] = new Date().toISOString();

    const { error } = await supabase
      .from('messages')
      .update({ read_by: readBy })
      .eq('id', messageId);

    if (error) throw error;
  },

  /**
   * Get user's permissions for a specific conversation using secure Edge Function
   */
  async getUserPermissions(conversationId: string, _userId: string): Promise<ConversationPermissions | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-permissions', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: { conversationId }
      });

      if (error) return null;

      return data;
    } catch (error) {
      console.error('Error getting user permissions via Edge Function:', error);
      return null;
    }
  },

  /**
   * Leave a conversation (sets left_at timestamp)
   */
  async leaveConversation(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('conversation_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Add a participant to a conversation (admin only)
   * RLS ensures only admins can do this
   */
  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_participants')
      .insert([{
        conversation_id: conversationId,
        user_id: userId,
        role: 'member'
      }]);

    if (error) throw error;
  },

  /**
   * Remove a participant from a conversation (admin only)
   * RLS ensures only admins can do this
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Delete a message (sender or admin)
   * RLS ensures proper permissions
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  },

  /**
   * Edit a message (sender only, within time limit)
   * RLS ensures proper permissions
   */
  async editMessage(messageId: string, newContent: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ 
        content: newContent,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  },

  /**
   * Search for users to add to conversations
   */
  async searchUsers(query: string): Promise<Array<{ id: string; username: string; display_name: string; profile_picture: string }>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, profile_picture')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    
    return (data || []).map(profile => ({
      id: profile.user_id,
      username: profile.username,
      display_name: profile.display_name,
      profile_picture: profile.profile_picture || 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmo5MXJsb2U4ZDVlNjU5dzJ4NGRpanY0YTJ0Zm16MnBseHJxMWx1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41m0CPz6UCnaUmxG/giphy.gif'
    }));
  }
};
